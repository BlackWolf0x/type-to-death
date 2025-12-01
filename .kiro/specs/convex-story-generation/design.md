# Convex Story Generation - Design

## Overview

This feature adds automated story generation to the Convex backend using Claude AI. The system consists of three main components:

1. **Schema Extension**: A new `stories` table to persist generated stories
2. **Generation Action**: An internal action that calls Claude Sonnet 4.5 and stores results
3. **Cron Job**: A daily scheduler that triggers story generation
4. **Query Function**: A public query to fetch the latest story

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Cron Job      │────▶│  Generation      │────▶│  Claude API     │
│   (daily)       │     │  Action          │     │  (Sonnet 4.5)   │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  Stories Table   │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  Query Function  │◀──── Frontend
                        └──────────────────┘
```

## Components and Interfaces

### 1. Schema (schema.ts)

**Responsibilities:**
- Define the stories table structure
- Provide type safety for story documents

**Dependencies:**
- Convex schema utilities

### 2. Stories Module (stories.ts)

**Responsibilities:**
- Implement story generation action using Claude tool use for structured output
- Store generated stories
- Provide query for latest story

**Dependencies:**
- Claude SDK (@anthropic-ai/sdk)
- Convex action/query utilities
- Environment variable (CLAUDE_API_KEY)
- Story prompt from `convex/prompt.ts`
- Type definitions from `types.ts`

### 3. Prompt Module (prompt.ts)

**Responsibilities:**
- Export the story generation prompt
- Centralize prompt text for reusability

**Dependencies:**
- None

### 4. Type Definitions (types.ts)

**Responsibilities:**
- Define Story and Chapter interfaces
- Provide shared types across the application

**Dependencies:**
- None

### 5. Cron Configuration (crons.ts)

**Responsibilities:**
- Schedule daily story generation
- Reference internal generation action

**Dependencies:**
- Convex cron utilities
- Internal API references

## Data Model

### Stories Table Schema

```typescript
// schema.ts addition
stories: defineTable({
  title: v.string(),
  introduction: v.string(),
  chapters: v.array(
    v.object({
      text: v.string(),
      difficulty: v.union(
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard")
      ),
    })
  ),
  createdAt: v.number(), // timestamp for ordering
})
```

### Story Interface (from types.ts)

```typescript
// Located in app-next/types.ts
export interface Chapter {
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Story {
  title: string;
  introduction: string;
  chapters: Chapter[];
}
```

## Core Algorithms

### 1. Story Generation Flow

```
1. Cron triggers generateStory action (retryCount = 0)
2. Action reads CLAUDE_API_KEY from environment
3. Action imports STORY_PROMPT from convex/prompt.ts
4. Action calls Claude API with tool use (forced structured output)
5. Claude returns tool_use block with Story object matching JSON schema
6. Validate Story object has required fields and 10 chapters
7. Insert story into database with timestamp
8. On failure: schedule retry in 5 minutes (max 3 attempts)
9. After max retries: wait for next daily cron
```

**Implementation Details:**
- Uses Claude's tool use feature with `tool_choice` to guarantee structured JSON output
- JSON schema enforces the Story interface structure
- No manual JSON parsing needed - Claude returns typed object
- Prompt is imported from `convex/prompt.ts`
- Types are imported from `types.ts`
- Retry logic: max 3 attempts, 5 minute delay between retries
- Uses optional `retryCount` argument to track attempts

### 2. Latest Story Query

```
1. Query stories table
2. Order by createdAt descending
3. Take first result
4. Return story or null if none exist
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### P1: JSON Parsing Round Trip
**Property:** *For any* valid Story object, serializing to JSON and parsing back should produce an equivalent Story object with the same title, introduction, and chapters.
**Verification:** Generate random valid Story objects, serialize to JSON, parse back, and compare all fields.
**Validates: Requirements 2.2**

### P2: Latest Story Ordering
**Property:** *For any* set of stories with distinct creation timestamps, the getLatestStory query should return the story with the maximum createdAt value.
**Verification:** Insert multiple stories with different timestamps, query latest, verify it has the highest timestamp.
**Validates: Requirements 4.1**

## Edge Cases

### E1: Empty Stories Table
**Scenario:** No stories have been generated yet
**Handling:** getLatestStory returns null

### E2: Malformed Claude Response
**Scenario:** Claude returns invalid JSON or missing fields
**Handling:** Log error, do not insert, action completes without throwing

### E3: Claude API Error
**Scenario:** API rate limit, network error, or authentication failure
**Handling:** Log error, schedule retry in 5 minutes (up to 3 attempts total)

### E5: Max Retries Exceeded
**Scenario:** Story generation fails 3 times in a row
**Handling:** Log error, wait for next daily cron job to try again

### E4: Missing API Key
**Scenario:** CLAUDE_API_KEY environment variable not set
**Handling:** Log error and exit early without calling API

## Error Handling

```typescript
// Error handling pattern in generateStory action
try {
  const anthropic = new Anthropic({ apiKey });
  
  // Use tool_choice to force structured JSON output
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    tools: [{
      name: "generate_story",
      description: "Generate a horror story for the typing game",
      input_schema: STORY_SCHEMA,
    }],
    tool_choice: { type: "tool", name: "generate_story" },
    messages: [{ role: "user", content: STORY_PROMPT }],
  });
  
  // Find the tool_use block in the response
  const toolUseBlock = response.content.find(
    (block) => block.type === "tool_use"
  );
  
  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    console.error("No tool_use block found in response");
    return;
  }
  
  // The input is already parsed as the Story structure
  const story = toolUseBlock.input as Story;
  
  // Validate required fields exist
  if (!story.title || !story.introduction || !story.chapters) {
    console.error('Invalid story structure - missing required fields');
    return;
  }
  
  if (!Array.isArray(story.chapters) || story.chapters.length !== 10) {
    console.error('Invalid story structure - chapters must be 10 items');
    return;
  }
  
  await ctx.runMutation(internal.stories.insertStory, {
    title: story.title,
    introduction: story.introduction,
    chapters: story.chapters,
  });
} catch (error) {
  console.error('Story generation failed:', error);
  // Don't rethrow - let cron continue
}
```

## Integration Points

### Files to Create/Modify

1. **convex/schema.ts** - Add stories table definition
2. **convex/stories.ts** - New file with action and query
3. **convex/crons.ts** - New file with cron configuration
4. **convex/prompt.ts** - New file exporting STORY_PROMPT
5. **types.ts** - Root-level file with Story and Chapter interfaces (shared across app)

### Environment Variables

- `CLAUDE_API_KEY` - Already configured in Convex dashboard

## Testing Strategy

### Manual Testing

1. Deploy schema changes and verify table creation
2. Manually trigger generateStory action via Convex dashboard
3. Verify story appears in stories table with correct structure
4. Call getLatestStory query and verify response
5. Wait 24 hours or manually trigger cron to verify scheduling

### Edge Case Testing

1. Test with invalid API key (should log error, not crash)
2. Test query with empty table (should return null)
3. Verify cron is registered in Convex dashboard

### Property-Based Testing

Property-based tests would require a test environment with Convex test utilities. For this backend-only feature, manual verification is sufficient for the MVP.

## Performance Considerations

- Claude Sonnet 4.5 provides high-quality story generation with tool use support
- Tool use with JSON schema eliminates parsing errors and retries
- Single story generation per day minimizes API costs
- Query uses descending order on createdAt with index for efficient latest retrieval
- Prompt is imported from separate module for maintainability

## Future Enhancements (Out of Scope)

- Story quality validation before insertion
- Multiple stories per day with rotation
- Story categories or themes
- Story expiration/cleanup
- Exponential backoff for retries
