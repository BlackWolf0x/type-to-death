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
    - _Requirements: 2.7_

  - [x] 2.2 Create getPreviousStoryData internal query


    - Query all stories from stories table
    - Order by createdAt ascending (oldest to newest)
    - Map results to extract title, patientName, and patientNumber fields
    - Return array of objects with { title, patientName, patientNumber } structure
    - Make it an internal query (accessible from actions)
    - _Properties: P3_
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 2.3 Update story generation action with previous titles



    - Import Anthropic SDK
    - Import STORY_PROMPT from convex/prompt.ts
    - Import Story and Chapter types from types.ts
    - Read CLAUDE_API_KEY from environment
    - Call getPreviousStoryData internal query to get previous story data
    - Construct enhanced prompt by appending previous titles and patient identities
    - Format: "PREVIOUSLY USED:\nTitles:\n- Title 1\n- Title 2\n...\nPatient Identities:\n- Name: [name], Number: [number]\n..."
    - Call Claude Sonnet API with enhanced prompt and tool use
    - Use JSON schema to enforce Story interface structure
    - Extract story from tool_use block (no manual parsing needed)
    - Add optional retryCount argument (default 0)
    - On failure: schedule retry in 5 minutes using ctx.scheduler.runAfter
    - Max 3 retry attempts before giving up until next cron
    - Call insertStory mutation on success
    - _Properties: P1, P4_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_
    
  - [x] 2.4 Create getLatestStory query
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
- Previous story data (titles and patient identities) retrieved via single query and appended to the prompt before calling Claude
- Format for previous data: "PREVIOUSLY USED:\nTitles:\n- Title 1\n- Title 2\n...\nPatient Identities:\n- Name: [name], Number: [number]\n..."
- Story and Chapter types are defined in root-level `types.ts` for reusability across the app
- Use `internalAction` for generateStory since it's called by cron, not frontend
- Use `internalMutation` for insertStory since it's called by the action
- Use `internalQuery` for getPreviousStoryData since it's called by the action
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

---

## Update: Patient Name and Number Tracking

### Context

This update adds tracking for patient names and numbers to prevent duplicate patient identities across generated stories.

### Updated Tasks

- [x] 5. Update schema to include patient identity fields


  - Add patientName field (string) to stories table in convex/schema.ts
  - Add patientNumber field (string) to stories table in convex/schema.ts
  - _Properties: P5_
  - _Requirements: 6.1, 6.2_

- [x] 6. Update Story interface with patient identity fields


  - Add patientName field (string) to Story interface in types.ts
  - Add patientNumber field (string) to Story interface in types.ts
  - _Requirements: 6.1, 6.2_

- [x] 7. Update stories.ts with patient identity tracking



  - [x] 7.1 Update STORY_SCHEMA to include patient identity fields


    - Add patientName field to STORY_SCHEMA JSON schema
    - Add patientNumber field to STORY_SCHEMA JSON schema
    - Mark both fields as required in the schema
    - _Requirements: 6.5_

  - [x] 7.2 Update getPreviousStoryData query to include patient identities


    - Modify existing getPreviousStoryData query
    - Update map to extract title, patientName, and patientNumber fields
    - Return array of objects with { title, patientName, patientNumber } structure
    - _Properties: P5_
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 7.3 Update generateStory action to use patient identities


    - Use updated getPreviousStoryData query that now includes patient data
    - Construct enhanced prompt with both titles and patient identities sections
    - Format: "PREVIOUSLY USED:\nTitles:\n- Title 1\n...\nPatient Identities:\n- Name: [name], Number: [number]\n..."
    - Update validation to check for patientName and patientNumber fields
    - _Properties: P6_
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

  - [x] 7.4 Update insertStory mutation to accept patient identity fields


    - Add patientName parameter to insertStory mutation
    - Add patientNumber parameter to insertStory mutation
    - Store both fields when inserting story into database
    - _Requirements: 6.6_

- [x] 8. Checkpoint - Verify patient identity tracking


  - Ensure all tests pass, ask the user if questions arise.
  - Deploy to Convex and verify:
    - Schema changes applied (patientName and patientNumber fields exist)
    - Generate a new story and verify patient identity fields are populated
    - Generate multiple stories and verify no duplicate patient identities

### Updated Implementation Notes

- Patient identities are retrieved alongside story titles in a single query before generation
- getPreviousStoryData query now returns: `[{ title: string, patientName: string, patientNumber: string }, ...]`
- Enhanced prompt now includes two sections:
  1. Previously used titles
  2. Previously used patient identities (name and number pairs)
- STORY_SCHEMA JSON schema enforces patientName and patientNumber as required fields
- Validation checks ensure both patient identity fields are present before insertion
- Single query approach is more efficient than separate queries for titles and patient data

### Updated Estimated Effort

- Additional Tasks: 4 (with 4 subtasks)
- Additional Estimated Time: 30-45 minutes
- Complexity: Low (straightforward schema and query additions)
- Risk Level: Low (extends existing patterns)
