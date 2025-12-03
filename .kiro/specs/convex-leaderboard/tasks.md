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
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 3. Add getHighscores query to highscores.ts
  - Implement `getHighscores` query function
  - Query highscores table using `by_score` index
  - Order results descending (highest score first)
  - Return all records without pagination
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Create calculateScore utility function
  - Create `app-next/lib/score.ts` with calculateScore function
  - Accept accuracy, wordPerMinute, and timeTaken as parameters
  - Return calculated score using formula: `((accuracy² × WPM) / timeTaken) × 1000`
  - Export function for use across the application
  - _Properties: P1_
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 5. Add getHighscoresWithUsers query
  - Add new query to `app-next/convex/highscores.ts`
  - Fetch all highscores sorted by score descending
  - Enrich each entry with user data (username)
  - Return username as null if user not found
  - _Properties: P3, P4_
  - _Requirements: 3.1, 3.2, 7.1, 7.2, 7.3_

- [x] 6. Create ModalLeaderboard component
  - Create `app-next/components/modal-leaderboard.tsx`
  - Use shadcn/ui Dialog component for modal structure
  - Add DialogTrigger with leaderboard button
  - Add DialogContent with title "Leaderboard"
  - Use ScrollArea for scrollable content
  - Display grid layout for leaderboard entries
  - Show rank, username (or "Anonymous"), score, WPM, accuracy for each entry
  - Handle loading state while fetching data
  - Handle empty state when no scores exist
  - _Properties: P4, P5_
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.2_

- [x] 7. Integrate score submission on game win
  - Update `app-next/app/play/page.tsx` to submit score when game is won
  - Add state for tracking submission status (idle, submitting, success, error)
  - Call submitScore mutation with storyId, wpm, accuracy, timeTaken
  - Display loading indicator while submitting
  - Display success message with trophy icon on success
  - Display error message on failure (with friendly message for unauthenticated users)
  - Reset submission status on game restart
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 8. Add time display and preserve decimal precision
  - Update `app-next/components/modal-leaderboard.tsx` to display time column
  - Format time as MM:SS for readability
  - Ensure score submission uses raw decimal values (no rounding)
  - Update grid layout to accommodate time column
  - Display WPM and accuracy with 1 decimal place precision
  - _Properties: P5, P7_
  - _Requirements: 5.6, 9.1, 9.2, 9.3, 9.4_

- [x] 9. Add leaderboard access to game win screen
  - Add ModalLeaderboard component to win screen in `app-next/app/play/page.tsx`
  - Position leaderboard button alongside existing buttons (Main Menu, Restart Game)
  - Ensure modal opens correctly from win screen
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

## Implementation Notes

- Tasks 1-3 are already completed (backend implementation)
- Task 4 extracts existing calculateScore function to lib for reusability
- Task 5 enhances the query to include user information
- Task 6 creates the frontend modal component
- Use existing modal patterns from `modal-auth.tsx` as reference
- ScrollArea component already exists in `app-next/components/ui/scroll-area.tsx`

## Dependencies

- Existing `@convex-dev/auth` setup in `app-next/convex/auth.ts`
- Existing `stories` table in schema
- Existing `users` table in schema
- shadcn/ui Dialog component (already installed)
- shadcn/ui ScrollArea component (already installed)

## Estimated Effort

- Total Tasks: 9 (all completed)
- Estimated Time: 2-3 hours total
- Complexity: Low
- Risk Level: Low
