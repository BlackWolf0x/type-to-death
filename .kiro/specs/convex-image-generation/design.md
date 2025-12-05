# Convex Image Generation - Design

## Overview

This design extends the existing story generation system to automatically generate patient portrait images using the Recraft.ai API. The system follows a pipeline architecture where image generation is triggered asynchronously after story creation, ensuring the core story generation flow remains unaffected by image generation failures.

## Architecture

1. **Story Generation Action** (`generateStory`) - Extended to schedule image generation after successful story insertion
2. **Image Generation Action** (`generatePatientPortrait`) - New internal action that calls Recraft.ai API, stores the image, and updates the story document
3. **Storage Update Mutation** (`updateStoryImage`) - New internal mutation to update the story document with the storage ID

```
┌─────────────────────┐
│   generateStory     │
│   (existing)        │
└─────────┬───────────┘
          │ 1. Insert story
          ▼
┌─────────────────────┐
│   insertStory       │
│   (existing)        │
│   returns storyId   │
└─────────┬───────────┘
          │ 2. Schedule async
          ▼
┌─────────────────────┐
│generatePatientPortrait│
│   (new action)      │
└─────────┬───────────┘
          │ 3. Call Recraft.ai
          ▼
┌─────────────────────┐
│   Recraft.ai API    │
│   (external)        │
└─────────┬───────────┘
          │ 4. Download image
          ▼
┌─────────────────────┐
│   ctx.storage.store │
│   (Convex storage)  │
└─────────┬───────────┘
          │ 5. Update document
          ▼
┌─────────────────────┐
│  updateStoryImage   │
│   (new mutation)    │
└─────────────────────┘
```

## Components and Interfaces

### generatePatientPortrait Action

**Responsibilities:**
- Receive storyId and imageGenerationPrompt as parameters
- Validate environment configuration (RECRAFT_API_KEY)
- Call Recraft.ai API with the prompt
- Download the generated image
- Store the image in Convex storage
- Call mutation to update the story document

**Dependencies:**
- Recraft.ai API
- Convex storage system
- updateStoryImage mutation

### updateStoryImage Mutation

**Responsibilities:**
- Receive storyId and storageId as parameters
- Update the story document's storageId field

**Dependencies:**
- Convex database

## Data Model

### Configuration Variables (Environment)

```typescript
// Required environment variable
RECRAFT_API_KEY: string  // Recraft.ai API authentication key
```

### Action Arguments

```typescript
// generatePatientPortrait action args
{
  storyId: v.id("stories"),
  imageGenerationPrompt: v.string(),
}

// updateStoryImage mutation args
{
  storyId: v.id("stories"),
  storageId: v.id("_storage"),
}
```

### Recraft.ai API Request

```typescript
// POST https://external.api.recraft.ai/v1/images/generations
{
  prompt: string,           // The imageGenerationPrompt
  style: "realistic_image", // Realistic portrait style
  model: "recraftv3",       // Latest model
  size: "1024x1024",        // Square portrait
}
```

### Recraft.ai API Response

```typescript
{
  data: [
    {
      url: string,  // URL to download the generated image
    }
  ]
}
```

## Core Algorithms

### 1. Image Generation Pipeline

```
1. Validate RECRAFT_API_KEY exists
   - If missing, log error and return early
2. Construct API request with prompt and parameters
3. Send POST request to Recraft.ai API
   - Include Authorization header with API key
4. Parse response and extract image URL
5. Fetch image from URL
6. Convert response to Blob
7. Store blob using ctx.storage.store()
8. Call updateStoryImage mutation with storyId and storageId
9. Log success
```

### 2. Error Handling Flow

```
At each step:
1. Wrap in try-catch
2. On error:
   - Log error with context (step, storyId, error message)
   - Return early (do not throw)
   - Do not retry (image generation is non-critical)
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### P1: Story-to-Image Pipeline Trigger
**Property:** *For any* successfully inserted story with a valid imageGenerationPrompt, the generatePatientPortrait action is scheduled with the correct storyId and imageGenerationPrompt parameters.
**Verification:** After story insertion, verify ctx.scheduler.runAfter is called with the correct action and parameters.
**Validates: Requirements 1.1, 4.2**

### P2: Missing API Key Handling
**Property:** *For any* call to generatePatientPortrait when RECRAFT_API_KEY is not set, the action terminates gracefully without throwing an exception and logs an appropriate error.
**Verification:** Call action without API key set, verify no exception is thrown and error is logged.
**Validates: Requirements 2.4**

### P3: API Request Formation
**Property:** *For any* imageGenerationPrompt string, the Recraft.ai API request body contains the prompt in the correct format with required parameters (style, model, size).
**Verification:** Verify the fetch request body matches expected schema with prompt included.
**Validates: Requirements 2.1, 2.3**

### P4: Image Storage Round-Trip
**Property:** *For any* successful Recraft.ai API response containing an image URL, the image is downloaded, stored in Convex storage, and a valid Id<"_storage"> is obtained.
**Verification:** Mock successful API response, verify storage.store is called and returns valid storage ID.
**Validates: Requirements 3.1, 3.2, 3.3**

### P5: Document Update Integrity
**Property:** *For any* successful storage operation, the story document identified by storyId is updated with the correct storageId value.
**Verification:** After storage, verify updateStoryImage mutation is called with matching storyId and storageId.
**Validates: Requirements 4.1, 4.3**

### P6: Failure Isolation
**Property:** *For any* failure in the image generation pipeline (API error, download error, storage error), the failure does not propagate to or affect the story generation flow.
**Verification:** Simulate failures at each step, verify story generation completes successfully and no exceptions propagate.
**Validates: Requirements 1.3, 5.1, 5.2, 5.3, 5.4**

## Integration with Existing Code

### Modified: generateStory Action (stories.ts)

After the successful `insertStory` mutation call, add scheduling of the image generation action:

```typescript
// Current code
const storyId = await ctx.runMutation(internal.stories.insertStory, {
  title: story.title,
  // ... other fields
});

// Add after insertion
await ctx.scheduler.runAfter(0, internal.stories.generatePatientPortrait, {
  storyId,
  imageGenerationPrompt: story.imageGenerationPrompt,
});
```

### New: generatePatientPortrait Action

```typescript
export const generatePatientPortrait = internalAction({
  args: {
    storyId: v.id("stories"),
    imageGenerationPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

### New: updateStoryImage Mutation

```typescript
export const updateStoryImage = internalMutation({
  args: {
    storyId: v.id("stories"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.storyId, {
      storageId: args.storageId,
    });
  },
});
```

## Edge Cases

### E1: Empty or Invalid Prompt
**Scenario:** imageGenerationPrompt is empty or contains only whitespace
**Handling:** Log warning and skip image generation (do not call API with empty prompt)

### E2: API Rate Limiting
**Scenario:** Recraft.ai returns 429 Too Many Requests
**Handling:** Log error with rate limit details, do not retry (non-critical feature)

### E3: Large Image Response
**Scenario:** Generated image is very large (>10MB)
**Handling:** Convex storage handles large files; no special handling needed

### E4: Invalid Image URL in Response
**Scenario:** API returns success but URL is invalid or inaccessible
**Handling:** Catch fetch error, log with URL details, terminate gracefully

### E5: Story Deleted Before Image Stored
**Scenario:** Story document is deleted between image generation and storage update
**Handling:** Mutation will fail silently (patch on non-existent document), log error

## Performance Considerations

- Image generation is scheduled with `runAfter(0)` for immediate async execution
- No blocking of story generation flow
- Single API call per story (no retries to avoid rate limiting)
- Image download and storage are sequential but non-blocking to other operations
- Typical Recraft.ai response time: 5-15 seconds

## Testing Strategy

### Unit Testing
- Test API request formation with various prompts
- Test error handling for missing API key
- Test mutation updates correct document

### Integration Testing
- Test full pipeline with mocked Recraft.ai API
- Test storage integration with Convex test utilities

### Manual Testing
1. Generate a new story and verify image appears in storage
2. Check story document has valid storageId
3. Verify image is accessible via storage URL
4. Test with missing API key - verify graceful failure
5. Test with invalid API key - verify error logging

### Edge Case Testing
1. Empty prompt handling
2. API timeout simulation
3. Invalid response format handling

## Future Enhancements (Out of Scope)

- Retry logic with exponential backoff for transient failures
- Image regeneration endpoint for failed generations
- Multiple image styles/variations per story
- Image optimization/compression before storage
- Webhook notification on image generation completion
- Batch image generation for existing stories
