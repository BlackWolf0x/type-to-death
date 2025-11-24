# Design Document

## Overview

The Typing Game design implements TypeRacer-style word-by-word typing mechanics within the existing React component structure. The system manages challenge state, validates player input in real-time, provides visual progress feedback, and automatically progresses through difficulty levels. The design emphasizes performance, immediate feedback, and a smooth typing experience that integrates seamlessly with the horror game's tension mechanics.

## Architecture

### Component Structure

```
app/src/typing-game/
├── index.tsx                    # Main component (imports only)
├── store.ts                     # Zustand store for typing game state
├── components/
│   ├── TextDisplay.tsx         # Text container with word rendering
│   └── TypingInput.tsx         # Input field with validation
├── hooks/
│   ├── useTypingGame.ts        # Main game logic hook
│   └── useWordValidation.ts   # Word validation logic
└── utils/
    ├── wordParser.ts           # Text parsing utilities
    └── validation.ts           # Validation functions

Component Hierarchy:
TypingGame (index.tsx)
├── TextDisplay
│   ├── Renders words from store
│   ├── Applies state-based styling
│   └── Shows completed/current/upcoming words
└── TypingInput
    ├── Controlled input from store
    ├── Handles onChange events
    └── Triggers validation
```

### Data Flow

```
data.ts → Load challenges → Initialize first challenge
                                    ↓
                          Display words in container
                                    ↓
                          Player types in input field
                                    ↓
                          Validate against current word
                                    ↓
                    Match? → Yes → Mark word complete
                                → Clear input
                                → Advance to next word
                                → Check if challenge complete
                                    ↓
                    Match? → No → Keep current word
                                → Maintain input value
                                → Show error feedback
```

## Components and Interfaces

### Zustand Store Interface

```typescript
// app/src/typing-game/store.ts
interface TypingGameStore {
  // Challenge management
  challenges: TypingChallenge[];
  currentChallengeIndex: number;
  
  // Word tracking
  words: string[];
  currentWordIndex: number;
  completedWords: boolean[];
  
  // Input management
  inputValue: string;
  
  // Status
  isComplete: boolean;
  isChallengeComplete: boolean;
  
  // Actions
  loadChallenges: () => void;
  setInputValue: (value: string) => void;
  validateAndAdvance: () => void;
  nextChallenge: () => void;
  reset: () => void;
}
```

### Challenge Data Interface

```typescript
interface TypingChallenge {
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

### Word State Enum

```typescript
enum WordState {
  COMPLETED = 'completed',
  CURRENT = 'current',
  UPCOMING = 'upcoming'
}
```

## Data Models

### Challenge Loading

- Load all challenges from `data.ts` on component mount
- Parse challenge text into word arrays (split by whitespace)
- Store challenges in state for sequential access
- Initialize with first challenge (index 0)

### Word Parsing

- Split challenge text by whitespace to create word array
- Preserve punctuation attached to words
- Handle multiple spaces gracefully
- Maintain original word order

### Progress Tracking

- Track completed words using boolean array
- Track current word index (0-based)
- Calculate completion percentage: `completedWords / totalWords`
- Detect challenge completion when all words are typed

## Error Handling

### Input Validation Errors

- **Mismatched input**: Keep current word index, maintain input value for correction
- **Empty input**: Prevent validation, wait for character input
- **Whitespace-only input**: Treat as empty, prevent validation

### Data Loading Errors

- **Missing data.ts**: Display error message, provide fallback challenge
- **Empty challenges array**: Display error message, prevent game start
- **Malformed challenge data**: Skip invalid challenges, log warning

### State Errors

- **Invalid word index**: Reset to 0, log error
- **Invalid challenge index**: Reset to 0, log error
- **Undefined words array**: Reinitialize from current challenge

### Edge Cases

- **Last word completion**: Trigger challenge completion, load next challenge
- **Last challenge completion**: Display completion message, handle end state
- **Rapid typing**: Debounce validation to prevent race conditions
- **Special characters**: Validate exact match including punctuation

## Testing Strategy

### Unit Testing

The typing game will use **Vitest** for unit testing, focusing on:

- **Word parsing logic**: Test splitting text into words correctly
- **Validation logic**: Test word matching with various inputs
- **State transitions**: Test word advancement and completion detection
- **Edge cases**: Test empty input, special characters, last word scenarios

Example unit tests:
```typescript
describe('Word Parsing', () => {
  test('splits text by whitespace', () => {
    const text = "Hello world test";
    const words = parseWords(text);
    expect(words).toEqual(['Hello', 'world', 'test']);
  });
  
  test('preserves punctuation', () => {
    const text = "Hello, world!";
    const words = parseWords(text);
    expect(words).toEqual(['Hello,', 'world!']);
  });
});

describe('Word Validation', () => {
  test('matches exact word', () => {
    expect(validateWord('hello', 'hello')).toBe(true);
  });
  
  test('rejects incorrect word', () => {
    expect(validateWord('hello', 'helo')).toBe(false);
  });
  
  test('is case-sensitive', () => {
    expect(validateWord('Hello', 'hello')).toBe(false);
  });
});
```

### Property-Based Testing

The typing game will use **fast-check** for property-based testing. Fast-check is a TypeScript/JavaScript property-based testing library that generates random test cases to verify properties hold across many inputs.

Installation:
```bash
cd app
pnpm add -D fast-check
```

Each property-based test will run a minimum of 100 iterations to ensure thorough coverage.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Challenge data loading and parsing

*For any* valid challenge data structure, when the typing game initializes, all challenges should be loaded with both text and difficulty properties correctly parsed and accessible.
**Validates: Requirements 7.2, 7.3**

### Property 2: Initial state consistency

*For any* loaded challenge set, the game should start with the first challenge (index 0) and the first word (index 0) as the current target.
**Validates: Requirements 6.1, 8.1**

### Property 3: Word completion advances progress

*For any* word in a challenge, when the player types that word exactly, the system should mark it as completed, clear the input field, and advance to the next word.
**Validates: Requirements 3.1, 3.3, 4.3, 5.2, 6.2**

### Property 4: Incorrect input maintains state

*For any* word in a challenge, when the player types input that does not match the current target word exactly, the progress tracker should remain on the same word and the input should be preserved.
**Validates: Requirements 5.3**

### Property 5: Case-sensitive validation

*For any* word in a challenge, validation should be case-sensitive such that "Hello" and "hello" are treated as different inputs.
**Validates: Requirements 5.4**

### Property 6: Punctuation exact matching

*For any* word containing punctuation, the validation should require exact character-by-character match including all punctuation marks.
**Validates: Requirements 5.5**

### Property 7: Sequential typing enforcement

*For any* challenge, the system should only accept input matching the current target word, preventing players from skipping ahead to future words regardless of what they type.
**Validates: Requirements 6.3, 6.4**

### Property 8: Visual state differentiation

*For any* word in the displayed challenge, the system should apply distinct visual styling based on its state (completed, current, or upcoming), ensuring each state is visually distinguishable.
**Validates: Requirements 4.1, 4.2**

### Property 9: Input field focus retention

*For any* word completion, the input field should maintain focus after being cleared, allowing immediate typing of the next word without manual refocusing.
**Validates: Requirements 3.2**

### Property 10: Challenge progression

*For any* challenge in the sequence, when all words are completed, the system should automatically load the next challenge in the data set order.
**Validates: Requirements 8.2, 8.3**

### Property 11: Input event validation trigger

*For any* character typed in the input field, the system should trigger validation against the current target word.
**Validates: Requirements 2.4, 5.1**

### Property 12: Visual feedback state

*For any* input state, the system should provide appropriate visual feedback indicating whether the current input is correct (matches the beginning of the target word) or incorrect.
**Validates: Requirements 9.1, 9.2, 9.3**

### Property 13: Text display persistence

*For any* active challenge, the displayed text should remain unchanged until the challenge is completed or the game is reset.
**Validates: Requirements 1.5**

### Property 14: Error handling graceful degradation

*For any* invalid or malformed challenge data, the system should handle the error gracefully without crashing, providing fallback content or error messaging.
**Validates: Requirements 7.5**

### Property 15: Input value synchronization

*For any* typing input, the displayed value in the input field should match the typed characters in real-time.
**Validates: Requirements 2.3**

## Implementation Details

### React Architecture

The typing game follows React best practices:

**Component Composition:**
- Small, focused components with single responsibilities
- Presentational components (TextDisplay, TypingInput) separate from logic
- Container pattern: index.tsx orchestrates child components

**State Management:**
- Zustand store for all game state
- Components subscribe to minimal state slices
- Actions encapsulate all state mutations
- No prop drilling - components access store directly

**Hooks Pattern:**
- Custom hooks encapsulate complex logic
- `useTypingGame`: Main game lifecycle and effects
- `useWordValidation`: Validation logic and feedback
- Hooks consume and update Zustand store

**Event Handling:**
- Input events handled in TypingInput component
- Events trigger Zustand actions
- Store updates trigger component re-renders
- Unidirectional data flow maintained

### State Management Approach

Use **Zustand** for typing game state management:
- Create dedicated store at `app/src/typing-game/store.ts`
- Store manages all challenge, word, and input state
- Actions encapsulate state mutations
- Components subscribe to specific state slices for optimal performance

**Why Zustand for typing game:**
- Centralized state management for game logic
- Easy to test state transitions
- Prevents prop drilling between components
- Enables future integration with Unity and blink detection
- Allows other components to observe typing game state

### Word Parsing Algorithm

```typescript
// app/src/typing-game/utils/wordParser.ts
export function parseWords(text: string): string[] {
  return text.split(/\s+/).filter(word => word.length > 0);
}
```

- Split by one or more whitespace characters
- Filter out empty strings from multiple spaces
- Preserve punctuation attached to words

### Validation Logic

```typescript
// app/src/typing-game/utils/validation.ts
export function validateWord(input: string, target: string): boolean {
  return input === target;
}

export function isInputCorrectSoFar(input: string, target: string): boolean {
  return target.startsWith(input);
}
```

- Exact string comparison (case-sensitive)
- No trimming or normalization
- Punctuation must match exactly
- Provide partial validation for visual feedback

### Visual Feedback Strategy

Use Tailwind CSS classes to style words based on state:
- **Completed**: Green text, slightly faded
- **Current**: Bold, highlighted background, distinct color
- **Upcoming**: Default text color

Apply classes conditionally based on word index comparison.

### Performance Optimizations

1. **Zustand selectors**: Use specific selectors to prevent unnecessary re-renders
2. **Component separation**: Isolate TextDisplay and TypingInput to minimize re-render scope
3. **Memoization**: Use `useMemo` for derived state (word styling)
4. **Callback optimization**: Use `useCallback` for event handlers
5. **Efficient rendering**: Only re-render changed word elements
6. **Debouncing**: Not needed for validation (synchronous operation)

### File Organization

All typing game code stays within `app/src/typing-game/`:
- **index.tsx**: Main component that imports and composes sub-components
- **store.ts**: Zustand store with all state and actions
- **components/**: Presentational components (TextDisplay, TypingInput)
- **hooks/**: Custom hooks for game logic
- **utils/**: Pure utility functions (parsing, validation)
- **data.ts**: Challenge data (existing)

This structure ensures:
- Clear separation of concerns
- Easy testing of individual modules
- Maintainable and scalable codebase
- index.tsx remains clean and focused on composition

### Integration Points

#### With Unity (Future)

- Emit events on word completion for monster teleportation
- Emit events on challenge completion for game progression
- Receive game state updates (pause, reset)

#### With Blink Detection (Future)

- Coordinate typing challenges with blink events
- Pause typing during blink-triggered monster movement
- Resume typing after monster animation completes

## Accessibility Considerations

- Maintain keyboard-only navigation
- Ensure sufficient color contrast for word states
- Provide screen reader announcements for progress
- Support high contrast mode
- Ensure focus indicators are visible

## Future Enhancements

- **Typing statistics**: WPM calculation, accuracy tracking
- **Difficulty adaptation**: Adjust based on player performance
- **Sound effects**: Audio feedback for correct/incorrect typing
- **Animations**: Smooth transitions between word states
- **Power-ups**: Temporary typing assists or monster delays
- **Leaderboard integration**: Track and display high scores
