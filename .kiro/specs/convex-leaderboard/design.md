# Convex Leaderboard - Design

## Overview

The leaderboard system consists of two main components:

1. **Schema Extension** - Adds a `highscores` table to the existing Convex schema
2. **Highscores Module** - Contains mutation and query functions for score management

The system integrates with existing authentication (`@convex-dev/auth`) and references the existing `stories` table.

## Architecture

### Component Responsibilities

1. **Schema (schema.ts)** - Defines the highscores table structure with appropriate indexes
2. **Highscores Module (highscores.ts)** - Exposes `submitScore` mutation and `getHighscores` query
3. **Authentication** - Uses existing `@convex-dev/auth` for user verification

### Data Flow

```
Player completes story
        ↓
Frontend calls submitScore mutation
        ↓
Mutation verifies authentication
        ↓
Mutation calculates score
        ↓
Mutation checks for existing highscore
        ↓
Insert new or update if better
        ↓
getHighscores returns sorted leaderboard
```

## Components and Interfaces

### Schema Extension

**File:** `app-next/convex/schema.ts`

**Responsibilities:**
- Define highscores table with all required fields
- Create indexes for efficient queries

**Dependencies:**
- Existing schema with stories and users tables

### Highscores Module

**File:** `app-next/convex/highscores.ts`

**Responsibilities:**
- `submitScore` mutation: Authenticate, calculate score, insert/update record
- `getHighscores` query: Return all highscores sorted by score descending

**Dependencies:**
- `@convex-dev/auth/server` for authentication
- Generated Convex types

## Data Model

### Highscores Table Schema

```typescript
highscores: defineTable({
    storyId: v.id("stories"),
    userId: v.id("users"),
    wordPerMinute: v.number(),
    accuracy: v.number(),
    timeTaken: v.number(),
    score: v.number(),
    createdAt: v.number(),
})
    .index("by_score", ["score"])
    .index("by_user_story", ["userId", "storyId"])
```

### Index Strategy

- `by_score`: Enables efficient sorting for leaderboard queries
- `by_user_story`: Enables efficient lookup of existing user scores per story

## Core Algorithms

### 1. Score Calculation

```
Input: wordPerMinute (WPM), accuracy (0-100), timeTaken (seconds)
Output: score (number)

Formula: Score = ((Accuracy² × WPM) / Time) × 1000

Steps:
1. Square the accuracy value
2. Multiply by WPM
3. Divide by timeTaken
4. Multiply by 1000
```

### 2. Input Validation

```
Input: wordPerMinute, accuracy, timeTaken
Output: void (throws error if invalid)

Validation Rules:
1. accuracy MUST be between 0 and 100 (inclusive)
2. wordPerMinute MUST be less than 500
3. wordPerMinute MUST be greater than 0
4. timeTaken MUST be greater than 0
```

### 3. Submit Score Logic

```
Input: storyId, wordPerMinute, accuracy, timeTaken
Output: void (or error)

Steps:
1. Get authenticated user identity
2. IF identity is null THEN throw "Unauthenticated" error
3. Validate inputs:
   - IF accuracy < 0 OR accuracy > 100 THEN throw "Invalid accuracy" error
   - IF wordPerMinute <= 0 OR wordPerMinute >= 500 THEN throw "Invalid WPM" error
   - IF timeTaken <= 0 THEN throw "Invalid time" error
4. Get userId from identity
5. Calculate score using formula
6. Query existing highscore for (userId, storyId)
7. IF no existing record THEN
     Insert new highscore record
   ELSE IF new score > existing score THEN
     Update existing record with new values
   ELSE
     Do nothing (keep existing better score)
```

### 4. Get Highscores Logic

```
Input: none
Output: Array of highscore records

Steps:
1. Query highscores table
2. Use by_score index
3. Order descending
4. Collect all results
5. Return array
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### P1: Score Calculation Correctness

**Property:** *For any* valid WPM, accuracy, and timeTaken values, the calculated score SHALL equal `((accuracy² × WPM) / timeTaken) × 1000`

**Verification:** Given random valid inputs, compute expected score and compare with function output

**Validates:** Requirements 2.3

### P2: New User Score Creation

**Property:** *For any* authenticated user submitting a score for a story they have no existing score for, a new highscore record SHALL be created

**Verification:** Submit score for new user/story combination, verify record exists in database

**Validates:** Requirements 2.4

### P3: Higher Score Updates Record

**Property:** *For any* existing highscore record and any new submission with a higher score, the record SHALL be updated with the new values

**Verification:** Submit score higher than existing, verify record reflects new values

**Validates:** Requirements 2.5

### P4: Lower Score Preserves Record

**Property:** *For any* existing highscore record and any new submission with a lower or equal score, the existing record SHALL remain unchanged

**Verification:** Submit score lower than existing, verify record retains original values

**Validates:** Requirements 2.6

### P5: Leaderboard Ordering

**Property:** *For any* set of highscore records, the getHighscores query SHALL return records sorted by score in descending order (each record's score >= next record's score)

**Verification:** Query leaderboard, verify each element has score >= subsequent element

**Validates:** Requirements 3.2

### P6: Leaderboard Completeness

**Property:** *For any* set of highscore records in the database, the getHighscores query SHALL return all records

**Verification:** Count records in database, compare with count of returned records

**Validates:** Requirements 3.1

### P7: Input Validation - Accuracy Range

**Property:** *For any* accuracy value outside the range [0, 100], the submitScore mutation SHALL throw an error

**Verification:** Submit with accuracy < 0 or > 100, verify error is thrown

**Validates:** Requirements 2.3 (implicit validation)

### P8: Input Validation - WPM Range

**Property:** *For any* WPM value <= 0 or >= 500, the submitScore mutation SHALL throw an error

**Verification:** Submit with invalid WPM, verify error is thrown

**Validates:** Requirements 2.3 (implicit validation)

### P9: Input Validation - Time Range

**Property:** *For any* timeTaken value <= 0, the submitScore mutation SHALL throw an error

**Verification:** Submit with timeTaken <= 0, verify error is thrown

**Validates:** Requirements 2.3 (implicit validation)

## Integration with Existing Code

### Schema Integration

The highscores table will be added to the existing schema alongside stories and users:

```typescript
// In schema.ts - add to existing schema
highscores: defineTable({
    storyId: v.id("stories"),
    userId: v.id("users"),
    wordPerMinute: v.number(),
    accuracy: v.number(),
    timeTaken: v.number(),
    score: v.number(),
    createdAt: v.number(),
})
    .index("by_score", ["score"])
    .index("by_user_story", ["userId", "storyId"])
```

### Authentication Integration

Uses the existing `@convex-dev/auth` setup:

```typescript
import { getAuthUserId } from "@convex-dev/auth/server";

// In mutation handler
const userId = await getAuthUserId(ctx);
if (!userId) {
    throw new Error("Unauthenticated");
}
```

## Edge Cases

### E1: Zero or Negative Time Taken

**Scenario:** User submits with timeTaken <= 0
**Handling:** Backend validation throws "Invalid time" error. Division by zero/negative is prevented.

### E2: Accuracy Out of Range

**Scenario:** Accuracy value outside 0-100 range
**Handling:** Backend validation throws "Invalid accuracy" error.

### E3: WPM Out of Range

**Scenario:** WPM value <= 0 or >= 500
**Handling:** Backend validation throws "Invalid WPM" error. 500 WPM is an unrealistic upper bound.

### E4: Concurrent Submissions

**Scenario:** Same user submits multiple scores simultaneously
**Handling:** Convex handles this via optimistic concurrency control. Last write wins, but since we only keep higher scores, the best score will be retained.

## Performance Considerations

- `by_score` index enables O(log n) sorting for leaderboard queries
- `by_user_story` index enables O(log n) lookup for existing user scores
- No pagination means all records are returned; acceptable for small-medium leaderboards
- For large leaderboards (10k+ records), pagination should be considered in future

## Testing Strategy

### Manual Testing

1. Submit score as authenticated user - verify record created
2. Submit higher score - verify record updated
3. Submit lower score - verify record unchanged
4. Query leaderboard - verify sorted order
5. Submit as unauthenticated - verify error thrown

### Edge Case Testing

1. Submit with very high WPM values
2. Submit with accuracy at boundaries (0, 100)
3. Submit with very small timeTaken values
4. Multiple users submitting for same story

## Future Enhancements (Out of Scope)

- Pagination for large leaderboards
- Filtering by story or time period
- User profile/username display in leaderboard results
- Per-story leaderboards
- Weekly/monthly leaderboards
- Score history tracking
