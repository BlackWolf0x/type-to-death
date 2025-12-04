# Convex Leaderboard - Design

## Overview

The leaderboard system consists of four main parts:
1. Convex backend for data storage and retrieval (already implemented)
2. A reusable score calculation utility in the lib folder
3. A frontend modal component displaying ranked highscores with user information
4. Game win integration that automatically submits scores with visual feedback

## Architecture

1. **Backend Layer (Convex)**: Handles data persistence, score submission, and leaderboard queries
2. **Utility Layer (lib)**: Contains the reusable calculateScore function
3. **Data Fetching Layer**: Enhanced query to include user information with highscores
4. **UI Layer**: Modal component using shadcn/ui Dialog and ScrollArea
5. **Game Integration Layer**: Automatic score submission on game win with status feedback

## Components and Interfaces

### ModalLeaderboard Component

**Location:** `app-next/components/modal-leaderboard.tsx`

**Responsibilities:**
- Render a dialog trigger button
- Display leaderboard in a modal dialog
- Fetch and display highscores with user data
- Handle loading and empty states
- Provide scrollable content for many entries

**Dependencies:**
- shadcn/ui Dialog components
- shadcn/ui ScrollArea component
- Convex useQuery hook
- getHighscoresWithUsers query

### Score Calculation Utility

**Location:** `app-next/lib/score.ts`

**Responsibilities:**
- Calculate score using the formula: `((Accuracy² × WPM) / Time) × 1000`
- Provide consistent score calculation across frontend and backend

### Game Win Score Submission

**Location:** `app-next/app/play/page.tsx`

**Responsibilities:**
- Automatically submit score when player wins the game
- Track submission status (idle, submitting, success, error)
- Display visual feedback for each status state
- Handle authentication errors with friendly messaging
- Reset status on game restart

**State Management:**
```typescript
const [scoreSubmitStatus, setScoreSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
const [scoreSubmitError, setScoreSubmitError] = useState<string | null>(null);
```

## Data Models

### Highscore with User (Frontend Type)

```typescript
interface HighscoreWithUser {
  _id: Id<"highscores">;
  storyId: Id<"stories">;
  userId: Id<"users">;
  wordPerMinute: number;
  accuracy: number;
  timeTaken: number;
  score: number;
  createdAt: number;
  username: string | null;
}
```

### Leaderboard Entry Display

```typescript
interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  wpm: number;
  accuracy: number;
  timeTaken: number;
}
```

## Core Algorithms

### 1. Score Calculation

```
Input: accuracy (0-100), wordPerMinute (number), timeTaken (seconds)
Output: score (number)

Formula: score = ((accuracy² × wordPerMinute) / timeTaken) × 1000
```

### 2. Leaderboard Ranking

```
1. Fetch all highscores sorted by score descending
2. For each highscore, fetch associated user data
3. Map to display format with rank (index + 1)
4. Return enriched list
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### P1: Score Calculation Consistency
**Property:** *For any* valid accuracy (0-100), wordPerMinute (>0, <500), and timeTaken (>0), the calculateScore function SHALL return `((accuracy² × wordPerMinute) / timeTaken) × 1000`
**Validates: Requirements 2.3, 6.3**

### P2: Best Score Retention
**Property:** *For any* user and story combination, after multiple score submissions, the stored highscore SHALL be the maximum of all submitted scores
**Validates: Requirements 2.4, 2.5, 2.6**

### P3: Leaderboard Sorting
**Property:** *For any* set of highscores, the getHighscores query SHALL return entries sorted by score in descending order (each entry's score >= next entry's score)
**Validates: Requirements 3.1, 3.2**

### P4: User Information Enrichment
**Property:** *For any* highscore entry in the leaderboard, the returned data SHALL include a username field (either the user's username or "Anonymous" if null)
**Validates: Requirements 7.1, 7.2**

### P5: Leaderboard Entry Completeness
**Property:** *For any* leaderboard entry displayed, the rendered output SHALL contain rank, username, score, WPM, accuracy, and time values
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**

### P7: Data Precision Preservation
**Property:** *For any* score submission, the stored WPM, accuracy, and timeTaken values SHALL match the submitted values without rounding
**Validates: Requirements 9.1, 9.2, 9.3**

### P6: Score Submission Feedback
**Property:** *For any* game win event, the UI SHALL display appropriate feedback based on submission status (loading, success, or error)
**Validates: Requirements 8.2, 8.3, 8.4, 8.5**

## Integration Points

### Backend Query Enhancement

The existing `getHighscores` query needs to be enhanced to include user information:

```typescript
// Enhanced query to include user data
export const getHighscoresWithUsers = query({
  args: {},
  handler: async (ctx) => {
    const highscores = await ctx.db
      .query("highscores")
      .withIndex("by_score")
      .order("desc")
      .collect();

    // Enrich with user data
    const enriched = await Promise.all(
      highscores.map(async (hs) => {
        const user = await ctx.db.get(hs.userId);
        return {
          ...hs,
          username: user?.username ?? null,
        };
      })
    );

    return enriched;
  },
});
```

## Edge Cases

### E1: Empty Leaderboard
**Scenario:** No highscores exist in the database
**Handling:** Display an empty state message in the modal

### E2: Missing Username
**Scenario:** User has no username set
**Handling:** Display "Anonymous" as the username

### E3: Large Number of Entries
**Scenario:** Many highscore entries to display
**Handling:** ScrollArea component handles overflow with scrolling

### E4: Unauthenticated Score Submission
**Scenario:** Player wins but is not logged in
**Handling:** Display "Sign in to save your score" error message

### E5: Score Submission Network Error
**Scenario:** Network failure during score submission
**Handling:** Display the error message to the user

## Error Handling

- **Loading State:** Show loading indicator while fetching data
- **Empty State:** Show friendly message when no scores exist
- **Query Error:** Convex handles errors automatically, component shows undefined state

## Testing Strategy

### Manual Testing

1. Open leaderboard modal and verify it displays correctly
2. Submit a score and verify it appears in the leaderboard
3. Verify scores are sorted highest to lowest
4. Verify usernames display correctly (or "Anonymous" if missing)
5. Test scrolling with many entries

### Edge Case Testing

1. Test with empty leaderboard
2. Test with user who has no username
3. Test modal open/close functionality

## Performance Considerations

- Query uses `by_score` index for efficient sorting
- User data fetched in parallel using Promise.all
- ScrollArea provides virtualization benefits for large lists
- No pagination needed per requirements

## Future Enhancements (Out of Scope)

- Filter by story
- Filter by time period (daily, weekly, monthly)
- Real-time updates via subscriptions
- User avatars in leaderboard
- Pagination for very large datasets


---

## Update: Single Highscore Per User

### Context

Changed from tracking one highscore per user per story to tracking only one highscore per user regardless of story.

### Schema Changes

The `by_user_story` index has been replaced with a `by_user` index:

```typescript
// Before
.index("by_user_story", ["userId", "storyId"])

// After
.index("by_user", ["userId"])
```

### Query Changes

The existing highscore lookup now queries by userId only:

```typescript
// Before
const existingHighscore = await ctx.db
    .query("highscores")
    .withIndex("by_user_story", (q) =>
        q.eq("userId", userId).eq("storyId", storyId)
    )
    .unique();

// After
const existingHighscore = await ctx.db
    .query("highscores")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
```

### Updated Correctness Property

#### P2: Best Score Retention (Updated)
**Property:** *For any* user, after multiple score submissions across any stories, the stored highscore SHALL be the maximum of all submitted scores
**Validates: Requirements 2.4, 2.5, 2.6, 10.1, 10.2**
