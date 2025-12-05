# Convex Image Generation - Implementation Plan

## Tasks Overview

- [x] 1. Create updateStoryImage internal mutation


  - Create new internal mutation in `stories.ts`
  - Accept storyId and storageId as arguments
  - Use ctx.db.patch to update the story document's storageId field
  - _Requirements: 4.1, 4.2, 4.3_

- [-] 2. Create generatePatientPortrait internal action

  - [x] 2.1 Implement action skeleton with argument validation


    - Create new internal action in `stories.ts`
    - Define args: storyId (v.id("stories")), imageGenerationPrompt (v.string())
    - Add early return for empty/whitespace-only prompts with warning log
    - _Requirements: 2.1_

  - [x] 2.2 Implement API key validation

    - Check for RECRAFT_API_KEY environment variable
    - Log error and return early if not set
    - _Properties: P2_
    - _Requirements: 2.2, 2.4_

  - [x] 2.3 Implement Recraft.ai API call

    - Construct POST request to https://external.api.recraft.ai/v1/images/generations
    - Include Authorization header with Bearer token
    - Set request body with prompt, style ("realistic_image"), model ("recraftv3"), size ("1024x1024")
    - Handle API response and extract image URL
    - _Properties: P3_
    - _Requirements: 2.1, 2.3_

  - [x] 2.4 Implement image download and storage

    - Fetch image from returned URL
    - Convert response to Blob
    - Store blob using ctx.storage.store()
    - _Properties: P4_
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 2.5 Implement document update call

    - Call updateStoryImage mutation with storyId and storageId
    - Log success message
    - _Properties: P5_
    - _Requirements: 4.1_


  - [x] 2.6 Implement error handling
    - Wrap all operations in try-catch
    - Log errors with context (step, storyId, error message)
    - Return early on errors without throwing
    - _Properties: P6_
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3. Integrate image generation into story generation flow


  - Modify generateStory action in `stories.ts`
  - After successful insertStory mutation, schedule generatePatientPortrait
  - Use ctx.scheduler.runAfter(0, ...) for immediate async execution
  - Pass storyId and imageGenerationPrompt as parameters
  - _Properties: P1_
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. Add RECRAFT_API_KEY environment variable


  - Document the required environment variable
  - Add to Convex dashboard environment variables
  - _Requirements: 2.2_


- [x] 5. Write property tests for image generation



  - [ ] 5.1 Write property test for pipeline trigger
    - **Property 1: Story-to-Image Pipeline Trigger**
    - Verify scheduler is called with correct action and parameters after story insertion
    - **Validates: Requirements 1.1, 4.2**


  - [ ] 5.2 Write property test for missing API key handling
    - **Property 2: Missing API Key Handling**
    - Verify action terminates gracefully without API key

    - **Validates: Requirements 2.4**

  - [x] 5.3 Write property test for failure isolation


    - **Property 6: Failure Isolation**
    - Verify story generation succeeds even when image generation fails
    - **Validates: Requirements 1.3, 5.1, 5.2, 5.3, 5.4**

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Implementation Notes

- All new code goes in `app-next/convex/stories.ts`
- Use internal actions/mutations to keep image generation private
- The scheduler ensures async execution without blocking story generation
- Error handling is critical - image generation must never break story generation
- Recraft.ai API documentation: https://www.recraft.ai/docs

## Dependencies

- Recraft.ai API account and API key
- Convex storage system (already available)
- Existing story generation infrastructure

## Estimated Effort

- Total Tasks: 6 (with subtasks)
- Estimated Time: 2-3 hours
- Complexity: Medium
- Risk Level: Low (isolated feature, graceful failure handling)
