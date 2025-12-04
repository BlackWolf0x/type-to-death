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
3. Action queries all previous story data using getPreviousStoryData
4. Action imports STORY_PROMPT from convex/prompt.ts
5. Action constructs enhanced prompt with previous titles, patient names, and patient numbers
6. Action calls Claude API with enhanced prompt and tool use (forced structured output)
7. Claude returns tool_use block with Story object matching JSON schema
8. Validate Story object has required fields and 10 chapters
9. Insert story into database with timestamp
10. On failure: schedule retry in 5 minutes (max 3 attempts)
11. After max retries: wait for next daily cron
```

**Implementation Details:**
- Uses Claude's tool use feature with `tool_choice` to guarantee structured JSON output
- JSON schema enforces the Story interface structure
- No manual JSON parsing needed - Claude returns typed object
- Prompt is imported from `convex/prompt.ts` and enhanced with previous story data
- Previous story data (titles, patient names, patient numbers) retrieved via single internal query before generation
- Enhanced prompt includes instruction to avoid repeating previous titles and patient identities
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

### 3. Get Previous Story Data Query

```
1. Query all stories from stories table
2. Order by createdAt ascending (oldest to newest)
3. Map to extract title, patientName, and patientNumber fields
4. Return array of objects with { title, patientName, patientNumber } structure
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### P1: JSON Parsing Round Trip
**Property:** *For any* valid Story object, serializing to JSON and parsing back should produce an equivalent Story object with the same title, introduction, and chapters.
**Verification:** Generate random valid Story objects, serialize to JSON, parse back, and compare all fields.
**Validates: Requirements 2.4**

### P2: Latest Story Ordering
**Property:** *For any* set of stories with distinct creation timestamps, the getLatestStory query should return the story with the maximum createdAt value.
**Verification:** Insert multiple stories with different timestamps, query latest, verify it has the highest timestamp.
**Validates: Requirements 4.1**

### P3: Previous Story Data Completeness
**Property:** *For any* set of stories in the database, getPreviousStoryData should return exactly the same number of records as there are stories.
**Verification:** Insert N stories, call getPreviousStoryData, verify the returned array has length N.
**Validates: Requirements 5.1, 5.2**

### P4: Prompt Enhancement Inclusion
**Property:** *For any* non-empty list of previous story data, the enhanced prompt should contain all titles, patient names, and patient numbers from the list.
**Verification:** Generate random list of story data, construct enhanced prompt, verify each title, patient name, and patient number appears in the prompt string.
**Validates: Requirements 2.3**

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

---

## Update: Patient Name and Number Tracking

### Context

The current implementation sometimes generates stories with duplicate patient names and numbers. This update adds tracking for patient identities to ensure uniqueness across generated stories.

### Updated Data Model

#### Stories Table Schema (Updated)

```typescript
// schema.ts - updated stories table
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
  patientName: v.string(),      // NEW: Patient's name
  patientNumber: v.string(),    // NEW: Patient's identification number
  createdAt: v.number(),
})
```

#### Story Interface (Updated)

```typescript
// Located in app-next/types.ts - updated Story interface
export interface Story {
  title: string;
  introduction: string;
  chapters: Chapter[];
  patientName: string;      // NEW: Patient's name
  patientNumber: string;    // NEW: Patient's identification number
}
```

### Updated Core Algorithms

#### 1. Story Generation Flow (Updated)

```
1. Cron triggers generateStory action (retryCount = 0)
2. Action reads CLAUDE_API_KEY from environment
3. Action queries all previous story data using getPreviousStoryData (UPDATED to include patient data)
5. Action imports STORY_PROMPT from convex/prompt.ts
6. Action constructs enhanced prompt with:
   - Previous titles list
   - Previous patient names and numbers list (NEW)
7. Action calls Claude API with enhanced prompt and tool use (forced structured output)
8. Claude returns tool_use block with Story object including patientName and patientNumber (NEW)
9. Validate Story object has required fields, 10 chapters, patientName, and patientNumber (NEW)
10. Insert story into database with timestamp, patientName, and patientNumber (NEW)
11. On failure: schedule retry in 5 minutes (max 3 attempts)
12. After max retries: wait for next daily cron execution
```

**Updated Implementation Details:**
- STORY_SCHEMA now includes patientName and patientNumber fields
- Enhanced prompt includes instruction to avoid repeating previous patient identities
- Previous story data (titles and patient identities) retrieved via single updated query
- Validation checks for presence of patientName and patientNumber fields

#### 2. Get Previous Story Data Query (UPDATED)

```
1. Query all stories from stories table
2. Order by createdAt ascending (oldest to newest)
3. Map to extract title, patientName, and patientNumber fields
4. Return array of objects with { title, patientName, patientNumber } structure
```

### Updated Correctness Properties

#### P5: Previous Story Data Includes Patient Identities (NEW)
**Property:** *For any* set of stories in the database, getPreviousStoryData should return title, patientName, and patientNumber for each story.
**Verification:** Insert N stories with patient identities, call getPreviousStoryData, verify each returned object has all three fields.
**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

#### P6: Prompt Enhancement with Patient Identities (NEW)
**Property:** *For any* non-empty list of previous story data, the enhanced prompt should contain all patient names and numbers from the list.
**Verification:** Generate random list of story data with patient identities, construct enhanced prompt, verify each name and number appears in the prompt string.
**Validates: Requirements 6.4**

### Updated Error Handling

```typescript
// Updated validation in generateStory action
const story = toolUseBlock.input as Story;

// Validate required fields exist (UPDATED)
if (!story.title || !story.introduction || !story.chapters || 
    !story.patientName || !story.patientNumber) {
  console.error('Invalid story structure - missing required fields');
  return;
}

if (!Array.isArray(story.chapters) || story.chapters.length !== 10) {
  console.error('Invalid story structure - chapters must be 10 items');
  return;
}

// Insert with patient identity fields (UPDATED)
await ctx.runMutation(internal.stories.insertStory, {
  title: story.title,
  introduction: story.introduction,
  chapters: story.chapters,
  patientName: story.patientName,
  patientNumber: story.patientNumber,
});
```

### Updated Integration Points

#### Files to Modify

1. **convex/schema.ts** - Add patientName and patientNumber fields to stories table
2. **convex/stories.ts** - Update:
   - STORY_SCHEMA to include patientName and patientNumber
   - getPreviousStoryData internal query to return title, patientName, and patientNumber (UPDATED)
   - generateStory action to retrieve and use patient identities from updated query
   - insertStory mutation to accept and store patient identity fields
3. **types.ts** - Update Story interface to include patientName and patientNumber fields
