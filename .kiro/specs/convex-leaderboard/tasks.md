# Convex Leaderboard - Implementation Plan

## Tasks Overview

- [x] 1. Add highscores table to schema
  - Add highscores table definition to `app-next/convex/schema.ts`
  - Include all required fields: storyId, userId, wordPerMinute, accuracy, timeTaken, score, createdAt
  - Add `by_score` index for leaderboard sorting
  - Add `by_user_story` index for user score lookup
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Create highscores.ts module with submitScore mutation
  - Create new file `app-next/convex/highscores.ts`
  - Import required dependencies from Convex and auth
  - Implement `submitScore` mutation with:
    - Authentication check using `getAuthUserId`
    - Input validation (accuracy 0-100, WPM 0-500, timeTaken > 0)
    - Score calculation: `((accuracy² × WPM) / timeTaken) × 1000`
    - Query for existing highscore using `by_user_story` index
    - Insert new record if no existing score
    - Update record only if new score is higher
  - _Properties: P1, P2, P3, P4, P7, P8, P9_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 3. Add getHighscores query to highscores.ts
  - Implement `getHighscores` query function
  - Query highscores table using `by_score` index
  - Order results descending (highest score first)
  - Return all records without pagination
  - _Properties: P5, P6_
  - _Requirements: 3.1, 3.2, 3.3_

## Implementation Notes

- Task 1 must be completed before Tasks 2-3 (schema dependency)
- Tasks 2 and 3 can be implemented in the same file sequentially
- Use `getAuthUserId` from `@convex-dev/auth/server` for authentication
- Score formula uses accuracy squared to reward precision more heavily

## Dependencies

- Existing `@convex-dev/auth` setup in `app-next/convex/auth.ts`
- Existing `stories` table in schema
- Existing `users` table in schema

## Estimated Effort

- Total Tasks: 3
- Estimated Time: 1-2 hours
- Complexity: Low
- Risk Level: Low
