# Convex Image Generation - Requirements

## Introduction

This feature extends the story generation system to automatically generate patient portrait images using the Recraft.ai API. After a story is generated and inserted into the database, the system will call a new action to generate an image based on the `imageGenerationPrompt` field, store the resulting image in Convex storage, and update the story document with the storage ID.

## Context

The current story generation flow uses Claude AI to generate horror stories for the typing game. Each story includes an `imageGenerationPrompt` field that describes the patient's appearance. This feature will use that prompt to generate a visual portrait via Recraft.ai, enhancing the case files with patient imagery.

## Glossary

- **Story**: A horror narrative document stored in the `stories` table containing patient information, chapters, and metadata
- **imageGenerationPrompt**: A text field in the story document describing the patient's appearance for image generation
- **storageId**: A Convex storage identifier (`Id<"_storage">`) referencing a stored file
- **Recraft.ai**: An AI image generation service with a REST API for creating images from text prompts
- **Convex Storage**: Convex's built-in file storage system for storing and serving binary files

## Requirements

### Requirement 1: Trigger Image Generation After Story Creation

**User Story:** As a system administrator, I want patient portrait images to be automatically generated after each story is created, so that case files have visual representations without manual intervention.

#### Acceptance Criteria

1. WHEN a story is successfully inserted into the database, THE generateStory action SHALL call the generatePatientPortrait action with the storyId and imageGenerationPrompt parameters
2. THE generatePatientPortrait action SHALL be called asynchronously to avoid blocking the story generation flow
3. IF the story insertion fails, THEN THE system SHALL NOT attempt to generate a portrait image

### Requirement 2: Generate Image via Recraft.ai API

**User Story:** As a system administrator, I want patient portraits generated using Recraft.ai, so that the images match the horror aesthetic of the game.

#### Acceptance Criteria

1. WHEN generatePatientPortrait is called, THE action SHALL send a POST request to the Recraft.ai API with the imageGenerationPrompt
2. THE action SHALL use the RECRAFT_API_KEY environment variable for authentication
3. THE action SHALL configure the API request with appropriate image generation parameters (style, size, model)
4. IF the RECRAFT_API_KEY environment variable is not set, THEN THE action SHALL log an error and terminate without throwing

### Requirement 3: Store Generated Image in Convex Storage

**User Story:** As a developer, I want generated images stored in Convex storage, so that they can be served efficiently and persist with the application data.

#### Acceptance Criteria

1. WHEN the Recraft.ai API returns a successful response with image data, THE action SHALL download the image from the returned URL
2. THE action SHALL store the downloaded image blob using ctx.storage.store()
3. THE action SHALL obtain a valid storageId from the storage operation

### Requirement 4: Update Story Document with Storage ID

**User Story:** As a developer, I want the story document updated with the image storage ID, so that the frontend can display the patient portrait.

#### Acceptance Criteria

1. WHEN the image is successfully stored, THE action SHALL update the corresponding story document's storageId field
2. THE action SHALL use the storyId parameter to identify which document to update
3. THE storageId field SHALL contain a valid Convex storage identifier

### Requirement 5: Error Handling and Resilience

**User Story:** As a system administrator, I want robust error handling for image generation, so that failures do not affect the core story generation functionality.

#### Acceptance Criteria

1. IF the Recraft.ai API request fails, THEN THE action SHALL log the error with relevant details
2. IF the image download fails, THEN THE action SHALL log the error and terminate gracefully
3. IF the storage operation fails, THEN THE action SHALL log the error and terminate gracefully
4. THE image generation failure SHALL NOT cause the story generation to fail or retry
5. THE action SHALL handle network timeouts and API rate limits gracefully

## Non-Functional Requirements

### NFR1: Performance
- Image generation should complete within 60 seconds under normal conditions
- The action should not block other Convex operations

### NFR2: Security
- API keys must be stored as environment variables, never in code
- The action should validate inputs before making external API calls

### NFR3: Observability
- All significant events (start, success, failure) should be logged
- Error logs should include sufficient context for debugging

## Constraints

- Must use Convex internal actions for external API calls
- Must use Convex internal mutations for database updates
- Image generation is dependent on Recraft.ai API availability
- Storage costs will increase with each generated image

## Dependencies

- Recraft.ai API (https://www.recraft.ai/docs)
- Convex storage system
- Existing story generation flow in `stories.ts`
- RECRAFT_API_KEY environment variable

## Success Metrics

- Patient portraits are generated for new stories without manual intervention
- Image generation failures do not impact story generation success rate
- Generated images are accessible via Convex storage URLs

## Out of Scope

- Regenerating images for existing stories without portraits
- Image editing or modification after generation
- Multiple image variations per story
- Image caching or CDN optimization
- User-facing image generation controls
