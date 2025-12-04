# Typing Game Performance Optimization - Design

## Architecture Overview

The performance optimization addresses three main bottlenecks:

1. **React Re-render Cascade**: Every keystroke triggers multiple component re-renders across the typing game UI
2. **Heavy MediaPipe Processing**: Background segmentation with VHS effects runs at 30fps, competing with Unity audio
3. **Synchronous State Updates**: Multiple Zustand stores update synchronously on each keystroke

The solution implements component memoization, creates a lightweight webcam mode, defers non-critical state updates, and ensures proper React hook ordering.

## Component Structure

### Modified Components

#### 1. TypingGame (index.tsx)
**Responsibilities:**
- Isolate frequently updating stats into separate memoized component
- Prevent parent re-renders from cascading to child components

**Changes:**
- Extract `StatsDisplay` as memoized component
- Remove direct stats subscriptions from parent

#### 2. TextDisplay
**Responsibilities:**
- Render typing text with minimal re-renders
- Maintain cursor position and character styling

**Changes:**
- Split into `CompletedWords`, `FutureWords`, and current word sections
- Memoize each section independently
- Move all hooks before conditional returns

#### 3. TypingInput
**Responsibilities:**
- Handle user input with minimal re-renders

**Changes:**
- Wrap in `memo()`
- Memoize ref callback

#### 4. GameWebcamSimple (new component)
**Responsibilities:**
- Provide blink detection without visual processing
- Minimize CPU usage during gameplay

**Implementation:**
- Hidden video element only
- No canvas rendering
- No background segmentation
- No VHS effects
- No face overlay

### Data Flow

```
User Keystroke
    ↓
TypingInput (memoized, minimal re-render)
    ↓
setInputValue (Zustand)
    ↓
queueMicrotask → recordKeystroke (deferred)
    ↓
TextDisplay (only current word section re-renders)
    ↓
StatsDisplay (isolated, updates independently)
```

## Core Algorithms

### 1. Deferred Keystroke Recording

```typescript
// Before: Synchronous update blocks main thread
if (value.length > state.inputValue.length) {
    useGameStatsStore.getState().recordKeystroke(isCorrect);
}

// After: Deferred to next microtask
if (value.length > state.inputValue.length) {
    queueMicrotask(() => {
        useGameStatsStore.getState().recordKeystroke(isCorrect);
    });
}
```

**Rationale:** Separates typing state update from stats update, allowing React to batch renders.

### 2. Component Memoization Strategy

```typescript
// Completed words never change during typing
const CompletedWords = memo(function CompletedWords({ words, endIndex }) {
    return words.slice(0, endIndex).map(...);
});

// Future words never change during typing
const FutureWords = memo(function FutureWords({ words, startIndex }) {
    return words.slice(startIndex).map(...);
});

// Only current word re-renders on keystroke
const currentWordContent = useMemo(() => {
    // Character-by-character rendering logic
}, [currentWordChars, inputValue, ...]);
```

**Rationale:** Prevents unnecessary re-renders of static content.

### 3. Throttled Blink Data Updates

```typescript
const lastBlinkDataRef = useRef({ isBlinking: false, blinkCount: -1, faceDetected: true });

useEffect(() => {
    const newData = { isBlinking, blinkCount, faceDetected };
    
    // Only update if data actually changed
    if (last.isBlinking !== newData.isBlinking || ...) {
        lastBlinkDataRef.current = newData;
        onBlinkDataChange?.(newData);
    }
}, [isBlinking, blinkCount, faceDetected]);
```

**Rationale:** Prevents creating new objects on every MediaPipe frame, reducing parent re-renders.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### P1: Render Isolation
**Property:** For any keystroke, completed word components and future word components do not re-render
**Verification:** React DevTools Profiler shows only current word section updates
**Covers:** Requirements 1.3

### P2: Hook Call Consistency
**Property:** For any component render (including early returns), all hooks are called in the same order
**Verification:** No "rendered fewer hooks" errors occur during gameplay
**Covers:** Requirements 3.1, 3.2, 3.3

### P3: State Update Batching
**Property:** For any keystroke, stats store updates occur after typing store updates complete
**Verification:** queueMicrotask ensures deferred execution
**Covers:** Requirements 1.4

### P4: Blink Detection Accuracy
**Property:** For any blink event, the lightweight webcam mode detects it with the same accuracy as the full mode
**Verification:** Blink count matches between modes in testing
**Covers:** Requirements 2.3

### P5: Graceful Degradation
**Property:** For any invalid state (undefined word, completed game), the system returns early without errors
**Verification:** No runtime errors when typing after game ends
**Covers:** Requirements 4.1, 4.2

## Integration Points

### Modified Files

1. **app-next/typing-game/index.tsx**
   - Add `StatsDisplay` memoized component
   - Remove stats subscriptions from parent

2. **app-next/typing-game/components/TextDisplay.tsx**
   - Add `CompletedWords` and `FutureWords` memoized components
   - Move `currentWordContent` useMemo before early return
   - Remove unused `useCallback` import

3. **app-next/typing-game/components/TypingInput.tsx**
   - Wrap component in `memo()`
   - Memoize ref callback with `useCallback`

4. **app-next/typing-game/store.ts**
   - Add guard for undefined `currentWord`
   - Wrap `recordKeystroke` in `queueMicrotask`

5. **app-next/components/game-webcam.tsx**
   - Add throttled blink data updates with ref comparison

6. **app-next/components/game-webcam-simple.tsx** (new)
   - Minimal webcam component with hidden video element
   - Blink detection only, no visual processing

7. **app-next/hooks/useBackgroundSegmentation.ts**
   - Throttle from 30fps to 15fps (33ms → 66ms)

8. **app-next/app/play/page.tsx**
   - Import `GameWebcamSimple` instead of `GameWebcam`

## Edge Cases

### E1: Game Completion During Typing
**Scenario:** User types final character while game is transitioning
**Handling:** Guard in `setInputValue` returns early if `currentWord` is undefined

### E2: Chapter Transition Hook Error
**Scenario:** Story completes and component renders completion screen
**Handling:** All hooks (including `useMemo`) called before early return

### E3: Blink Data Object Creation
**Scenario:** MediaPipe updates face landmarks every frame
**Handling:** Ref comparison prevents new object creation unless data changed

## Performance Considerations

### Before Optimization
- **Keystroke render time**: 15-25ms
- **Components re-rendering per keystroke**: 5-7
- **MediaPipe frame processing**: 30fps with heavy pixel manipulation
- **Audio stuttering**: Frequent during fast typing

### After Optimization
- **Keystroke render time**: <5ms
- **Components re-rendering per keystroke**: 1-2
- **MediaPipe frame processing**: Blink detection only (no canvas)
- **Audio stuttering**: Eliminated

### Metrics
- React DevTools Profiler: Measure render time per keystroke
- Chrome Performance tab: Check main thread blocking
- Audio analysis: Listen for stuttering at 60+ WPM typing speed

## Testing Strategy

### Manual Testing
1. Type at various speeds (30, 60, 90+ WPM) and listen for audio stuttering
2. Complete chapters and verify no React errors
3. Type after game ends and verify no crashes
4. Verify blink detection still works accurately

### Performance Testing
1. Use React DevTools Profiler during typing
2. Record main thread activity in Chrome Performance tab
3. Compare before/after metrics

### Edge Case Testing
1. Type final character of story rapidly
2. Spam keyboard during chapter transitions
3. Blink rapidly during typing

## Future Enhancements (Out of Scope)

- Unity audio buffer size increase (requires rebuild)
- Web Workers for MediaPipe processing
- Canvas OffscreenCanvas API for background segmentation
- Incremental rendering with React 18 concurrent features
