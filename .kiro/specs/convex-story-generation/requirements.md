# Convex Story Generation - Requirements

## Introduction

This feature implements automated story generation for the typing game using Claude AI (Sonnet 4.5 model). A cron job runs every 24 hours to generate a new horror story in a specific format, which is stored in the Convex database. The frontend can then query the latest story for use in the typing game.

## Glossary

- **Story**: A horror-themed typing practice content consisting of a title, introduction, and 10 progressive chapters
- **Chapter**: A single typing challenge with text content and difficulty level (easy, medium, hard)
- **Cron Job**: A scheduled task that runs automatically at specified intervals
- **Claude SDK**: Anthropic's API client for interacting with Claude AI models
- **Sonnet 4.5**: Claude's high-performance model with tool use support for structured output

## Requirements

### Requirement 1: Stories Table Schema

**User Story:** As a developer, I want a stories table in the Convex schema, so that generated stories can be persisted and queried.

#### Acceptance Criteria

1. THE schema SHALL define a "stories" table with the following fields:
   - title (string): The story title
   - introduction (string): The atmospheric introduction text
   - chapters (array): Array of chapter objects containing text (string) and difficulty ('easy' | 'medium' | 'hard')
2. THE schema SHALL include a creation timestamp for ordering stories

### Requirement 2: Story Generation Action

**User Story:** As a system, I want to generate stories using Claude AI, so that fresh content is available for the typing game.

#### Acceptance Criteria

1. WHEN the generation action runs, THE system SHALL call Claude API with the prompt from convex/prompt.ts
2. THE system SHALL retrieve all previously generated story titles before calling Claude API
3. THE system SHALL include the list of previous titles in the prompt to avoid repetition
4. THE system SHALL use Claude tool use to enforce the Story interface format
5. IF the Claude API returns an error, THEN THE system SHALL log the error and schedule a retry
6. IF validation fails, THEN THE system SHALL log the error and schedule a retry
7. WHEN generation succeeds, THE system SHALL store the story in the stories table
8. IF generation fails, THEN THE system SHALL retry up to 3 times with 5 minute delays
9. IF all retries fail, THEN THE system SHALL wait for the next daily cron execution

### Requirement 3: Scheduled Generation (Cron Job)

**User Story:** As a product owner, I want stories generated automatically every 24 hours, so that players always have fresh content.

#### Acceptance Criteria

1. THE system SHALL schedule the story generation to run once every 24 hours
2. THE cron job SHALL use the internal action for story generation
3. THE cron job SHALL be defined in a crons.ts file

### Requirement 4: Latest Story Query

**User Story:** As a frontend developer, I want to fetch the latest generated story, so that I can display it in the typing game.

#### Acceptance Criteria

1. WHEN the query is called, THE system SHALL return the most recently created story
2. IF no stories exist, THEN THE system SHALL return null
3. THE query SHALL be a public query accessible from the frontend

### Requirement 5: Previous Story Data Query

**User Story:** As a system, I want to retrieve all previously generated story data, so that I can avoid generating duplicate or similar stories.

#### Acceptance Criteria

1. THE system SHALL provide an internal query to retrieve story titles, patient names, and patient numbers
2. THE query SHALL return title, patientName, and patientNumber fields from each story
3. THE query SHALL order stories by creation date (oldest to newest)
4. THE query SHALL be accessible from internal actions

## Non-Functional Requirements

### NFR1: API Key Security
The Claude API key SHALL be stored as a Convex environment variable (CLAUDE_API_KEY) and never exposed in code.

### NFR2: Error Resilience
The system SHALL handle API failures gracefully with automatic retry logic (max 3 attempts, 5 minute delay).

## Constraints

- Backend work only; no frontend changes
- Must use Claude Sonnet 4.5 model with tool use for structured output
- Prompt is stored in convex/prompt.ts
- Story and Chapter interfaces are defined in types.ts at the app root

## Dependencies

- Convex backend (already configured)
- Claude SDK (@anthropic-ai/sdk) - already installed
- CLAUDE_API_KEY environment variable - already configured in Convex dashboard

## Success Metrics

- Stories are generated successfully every 24 hours
- Generated stories conform to the Story interface
- Latest story query returns valid data

## Out of Scope

- Frontend integration to display generated stories
- Story editing or moderation
- Multiple story generation per day
- Story versioning or history management

---

## Update: Patient Name and Number Tracking

### Context

Currently, the system sometimes generates stories with duplicate patient names and numbers. To ensure variety and uniqueness in generated stories, we need to track and avoid reusing patient names and numbers.

### Updated Requirements

#### Requirement 6: Patient Identity Tracking

**User Story:** As a system, I want to track patient names and numbers used in stories, so that I can avoid generating duplicate patient identities.

##### Acceptance Criteria

1. THE stories table SHALL include a patientName field (string) to store the patient's name
2. THE stories table SHALL include a patientNumber field (string) to store the patient's identification number
3. WHEN generating a story, THE system SHALL retrieve all previously used patient names and numbers
4. THE system SHALL include the list of previous patient names and numbers in the Claude prompt
5. THE Claude API response SHALL include the patient name and number in the structured output
6. THE system SHALL store the patient name and number when inserting a new story

#### Requirement 7: Updated Previous Story Data Query

**User Story:** As a system, I want the existing story data query to include patient identities, so that I can retrieve all necessary information in a single query.

##### Acceptance Criteria

1. THE existing getPreviousStoryData query SHALL be updated to include patientName and patientNumber fields
2. THE query SHALL return title, patientName, and patientNumber for each story
3. THE query SHALL maintain the existing ordering by creation date (oldest to newest)
4. THE query SHALL remain accessible from internal actions
