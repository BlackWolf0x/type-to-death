# Convex Leaderboard - Requirements

## Introduction

This feature implements a complete leaderboard system for the Type to Death game, including both the Convex backend and a frontend modal component. Players compete on an all-time leaderboard based on their typing performance scores. The system tracks high scores per user per story and provides a sorted leaderboard display.

## Context

The Type to Death game requires a competitive element where players can see how their typing performance compares to others. The leaderboard tracks metrics including words per minute (WPM), accuracy, and time taken, combining them into a single score using a defined formula. Each user maintains only their best score per story. The frontend displays this data in a scrollable modal dialog.

## Glossary

- **Highscore**: A record of a player's best performance on a specific story
- **WPM (Words Per Minute)**: Typing speed measurement
- **Accuracy**: Percentage of correctly typed characters (0-100)
- **Score**: Calculated performance metric using the formula: `Score = ((Accuracy² × WPM) / Time) × 1000`
- **Story**: A typing challenge from the stories table that players complete
- **User**: An authenticated player in the system
- **Leaderboard Modal**: A dialog component displaying ranked highscores

## Requirements

### Requirement 1: Highscore Data Storage

**User Story:** As a system administrator, I want highscores stored in a structured table, so that player performance data is persisted and queryable.

#### Acceptance Criteria

1. THE highscores table SHALL contain a storyId field referencing the stories table
2. THE highscores table SHALL contain a userId field identifying the player
3. THE highscores table SHALL contain a wordPerMinute field storing typing speed as a number
4. THE highscores table SHALL contain an accuracy field storing accuracy percentage as a number
5. THE highscores table SHALL contain a timeTaken field storing duration in seconds as a number
6. THE highscores table SHALL contain a score field storing the calculated score as a number
7. THE highscores table SHALL contain a createdAt field storing the timestamp as a number

### Requirement 2: Score Submission

**User Story:** As a player, I want to submit my typing performance after completing a story, so that my score is recorded on the leaderboard.

#### Acceptance Criteria

1. WHEN a user submits a score THEN THE system SHALL verify the user is authenticated
2. IF a user is not authenticated THEN THE system SHALL reject the submission with an error
3. WHEN a score is submitted THEN THE system SHALL calculate the score using the formula: `Score = ((Accuracy² × WPM) / Time) × 1000`
4. WHEN a user has no existing score for the story THEN THE system SHALL create a new highscore record
5. WHEN a user's new score exceeds their existing score for the story THEN THE system SHALL update the highscore record
6. WHEN a user's new score is less than or equal to their existing score THEN THE system SHALL retain the existing record unchanged

### Requirement 3: Leaderboard Retrieval

**User Story:** As a player, I want to view the all-time leaderboard, so that I can see how my performance compares to other players.

#### Acceptance Criteria

1. WHEN the leaderboard is requested THEN THE system SHALL return all highscore records
2. THE system SHALL sort highscore records by score in descending order (highest first)
3. THE system SHALL return highscore records without pagination

### Requirement 4: Leaderboard Modal Display

**User Story:** As a player, I want to view the leaderboard in a modal dialog, so that I can see rankings without leaving the current page.

#### Acceptance Criteria

1. WHEN a user clicks the leaderboard trigger THEN THE modal SHALL open displaying the leaderboard
2. THE modal SHALL display a header with the title "Leaderboard"
3. THE modal SHALL use a scrollable area to display all entries without pagination
4. WHEN the modal is open THEN THE user SHALL be able to close it via a close button or clicking outside

### Requirement 5: Leaderboard Entry Display

**User Story:** As a player, I want to see detailed information for each leaderboard entry, so that I can understand player performance.

#### Acceptance Criteria

1. WHEN displaying a leaderboard entry THEN THE system SHALL show the player's rank position
2. WHEN displaying a leaderboard entry THEN THE system SHALL show the player's username
3. WHEN displaying a leaderboard entry THEN THE system SHALL show the player's score (formatted)
4. WHEN displaying a leaderboard entry THEN THE system SHALL show the player's WPM
5. WHEN displaying a leaderboard entry THEN THE system SHALL show the player's accuracy percentage
6. WHEN displaying a leaderboard entry THEN THE system SHALL show the player's time taken (formatted)
7. THE leaderboard entries SHALL be displayed in a grid layout for readability

### Requirement 6: Score Calculation Utility

**User Story:** As a developer, I want the score calculation function to be reusable, so that it can be used consistently across the application.

#### Acceptance Criteria

1. THE calculateScore function SHALL be located in the lib folder for reusability
2. THE calculateScore function SHALL accept accuracy, wordPerMinute, and timeTaken as parameters
3. THE calculateScore function SHALL return the calculated score using the formula: `((Accuracy² × WPM) / Time) × 1000`

### Requirement 7: Leaderboard Data Enrichment

**User Story:** As a player, I want to see usernames on the leaderboard, so that I can identify other players.

#### Acceptance Criteria

1. WHEN fetching leaderboard data THEN THE system SHALL include user information for each entry
2. IF a user has no username THEN THE system SHALL display "Anonymous" as the username
3. THE system SHALL query user data efficiently alongside highscore data

### Requirement 8: Game Win Score Submission

**User Story:** As a player, I want my score automatically submitted when I win the game, so that I can compete on the leaderboard without manual action.

#### Acceptance Criteria

1. WHEN a player completes a story successfully THEN THE system SHALL automatically submit the score
2. WHILE the score is being submitted THEN THE system SHALL display a loading indicator with "Saving score..."
3. WHEN the score submission succeeds THEN THE system SHALL display a success message with trophy icon
4. IF the score submission fails due to authentication THEN THE system SHALL display "Sign in to save your score"
5. IF the score submission fails for other reasons THEN THE system SHALL display the error message
6. WHEN the player restarts the game THEN THE system SHALL reset the submission status

### Requirement 9: Data Precision

**User Story:** As a player, I want my performance metrics stored with full precision, so that leaderboard rankings are accurate.

#### Acceptance Criteria

1. WHEN submitting a score THEN THE system SHALL store WPM with full decimal precision (no rounding)
2. WHEN submitting a score THEN THE system SHALL store accuracy with full decimal precision (no rounding)
3. WHEN submitting a score THEN THE system SHALL store timeTaken with full decimal precision (no rounding)
4. WHEN displaying time on the leaderboard THEN THE system SHALL format it in a human-readable format (MM:SS)

## Non-Functional Requirements

### NFR1: Data Integrity

The system SHALL ensure score calculations are consistent and accurate using the defined formula.

### NFR2: Authentication Security

The system SHALL enforce authentication for all score submission operations.

### NFR3: UI Consistency

The leaderboard modal SHALL follow the existing design patterns using shadcn/ui components.

### NFR4: Scrollable Content

The leaderboard modal SHALL handle large numbers of entries gracefully using a scroll area.

## Constraints

- Uses existing Convex authentication via `@convex-dev/auth`
- Must integrate with existing `stories` and `users` tables
- No pagination required for leaderboard queries
- Must use shadcn/ui Dialog and ScrollArea components
- No test files or testing scripts to be created

## Dependencies

- Convex backend platform
- `@convex-dev/auth` for authentication
- Existing `stories` table in schema.ts
- Existing `users` table in schema.ts
- shadcn/ui Dialog component
- shadcn/ui ScrollArea component

## Success Metrics

- Authenticated users can submit scores successfully
- Scores are calculated correctly using the defined formula
- Only best scores per user per story are retained
- Leaderboard returns sorted results with user information
- Modal displays all entries in a scrollable, readable format
- calculateScore function is reusable from lib folder

## Out of Scope

- Pagination for leaderboard
- Filtering by story or time period
- Real-time leaderboard updates
- Test files and testing scripts


---

## Update: Single Highscore Per User

### Context

The original implementation stored one highscore per user per story. This has been changed to store only one highscore per user, regardless of which story they played.

### Updated Requirements

#### Requirement 10: Single User Highscore

**User Story:** As a player, I want only my best overall score tracked, so that the leaderboard reflects my best performance regardless of which story I played.

##### Acceptance Criteria

1. THE system SHALL maintain only one highscore record per user
2. WHEN a user submits a score THEN THE system SHALL compare against their existing highscore regardless of story
3. THE highscores table index SHALL use only userId (not userId + storyId combination)
