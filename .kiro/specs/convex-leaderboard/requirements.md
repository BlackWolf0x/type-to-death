# Convex Leaderboard - Requirements

## Introduction

This feature implements a backend leaderboard system for the Type to Death game using Convex. Players compete on an all-time leaderboard based on their typing performance scores. The system tracks high scores per user per story and provides a sorted leaderboard query.

## Context

The Type to Death game requires a competitive element where players can see how their typing performance compares to others. The leaderboard tracks metrics including words per minute (WPM), accuracy, and time taken, combining them into a single score using a defined formula. Each user maintains only their best score per story.

## Glossary

- **Highscore**: A record of a player's best performance on a specific story
- **WPM (Words Per Minute)**: Typing speed measurement
- **Accuracy**: Percentage of correctly typed characters (0-100)
- **Score**: Calculated performance metric using the formula: `Score = ((Accuracy² × WPM) / Time) × 1000`
- **Story**: A typing challenge from the stories table that players complete
- **User**: An authenticated player in the system

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

## Non-Functional Requirements

### NFR1: Data Integrity

The system SHALL ensure score calculations are consistent and accurate using the defined formula.

### NFR2: Authentication Security

The system SHALL enforce authentication for all score submission operations.

## Constraints

- Backend implementation only (frontend is out of scope)
- Uses existing Convex authentication via `@convex-dev/auth`
- Must integrate with existing `stories` and `users` tables
- No pagination required for leaderboard queries
- No test files or testing scripts to be created

## Dependencies

- Convex backend platform
- `@convex-dev/auth` for authentication
- Existing `stories` table in schema.ts
- Existing `users` table in schema.ts

## Success Metrics

- Authenticated users can submit scores successfully
- Scores are calculated correctly using the defined formula
- Only best scores per user per story are retained
- Leaderboard returns sorted results

## Out of Scope

- Frontend UI components
- Pagination for leaderboard
- Filtering by story or time period
- User profile display in leaderboard
- Test files and testing scripts
