# Convex Story Generation - Implementation Plan

## Tasks Overview

- [x] 1. Update schema with stories table
  - Add stories table definition to convex/schema.ts
  - Include title (string), introduction (string), chapters (array), createdAt (number)
  - Use v.union for difficulty enum validation
  - _Requirements: 1.1, 1.2_

- [x] 2. Create stories.ts with generation action and query

  - [x] 2.1 Create internal mutation to insert stories
    - Create insertStory internal mutation
    - Accept story object and add createdAt timestamp
    - _Requirements: 2.5_

  - [x] 2.2 Create story generation action with retry logic
    - Import Anthropic SDK
    - Import STORY_PROMPT from convex/prompt.ts
    - Import Story and Chapter types from types.ts
    - Read CLAUDE_API_KEY from environment
    - Call Claude Sonnet API with tool use for structured output
    - Use JSON schema to enforce Story interface structure
    - Extract story from tool_use block (no manual parsing needed)
    - Add optional retryCount argument (default 0)
    - On failure: schedule retry in 5 minutes using ctx.scheduler.runAfter
    - Max 3 retry attempts before giving up until next cron
    - Call insertStory mutation on success
    - _Properties: P1_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
    
  - [x] 2.3 Create getLatestStory query
    - Query stories table ordered by createdAt descending
    - Return first result or null if empty
    - Make it a public query
    - _Properties: P2_
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Create crons.ts with daily schedule
  - Import cronJobs from convex/server
  - Import internal API reference
  - Schedule generateStory to run daily (every 24 hours)
  - Export crons as default
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Checkpoint - Verify deployment
  - Ensure all tests pass, ask the user if questions arise.
  - Deploy to Convex and verify:
    - Schema changes applied (stories table exists)
    - Cron job registered in dashboard
    - Manual action trigger works

## Implementation Notes

- The prompt is stored in `convex/prompt.ts` and imported into stories.ts
- Story and Chapter types are defined in root-level `types.ts` for reusability across the app
- Use `internalAction` for generateStory since it's called by cron, not frontend
- Use `internalMutation` for insertStory since it's called by the action
- Use `query` (public) for getLatestStory since frontend needs access
- Claude Sonnet 4.5 model ID: "claude-sonnet-4-5-20250929"
- Tool use with JSON schema eliminates parsing errors
- Retry logic: max 3 attempts, 5 minute delay (300,000ms) between retries
- Uses `ctx.scheduler.runAfter()` to schedule retries

## Dependencies

- Convex backend already configured
- Claude SDK already installed
- CLAUDE_API_KEY already set in Convex environment

## Estimated Effort

- Total Tasks: 4 (with 3 subtasks)
- Estimated Time: 1-2 hours
- Complexity: Low
- Risk Level: Low (straightforward API integration)
