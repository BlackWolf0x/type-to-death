# Typing Game Performance Optimization - Implementation Plan

## Tasks Overview

- [x] 1. Isolate stats display to prevent re-render cascade
  - Extract StatsDisplay as memoized component in TypingGame
  - Remove stats subscriptions from parent component
  - _Properties: P1_
  - _Requirements: 1.2_

- [x] 2. Optimize TextDisplay component rendering
  - [x] 2.1 Create CompletedWords memoized component
    - Extract completed words rendering logic
    - Memoize with React.memo
    - _Properties: P1_
    - _Requirements: 1.3_
  
  - [x] 2.2 Create FutureWords memoized component
    - Extract future words rendering logic
    - Memoize with React.memo
    - _Properties: P1_
    - _Requirements: 1.3_
  
  - [x] 2.3 Move currentWordContent useMemo before early return
    - Ensure all hooks called before conditional returns
    - Fix hook ordering to prevent React errors
    - _Properties: P2_
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 2.4 Remove unused useCallback import
    - Clean up imports
    - _Requirements: NFR2_

- [x] 3. Memoize TypingInput component
  - Wrap component in React.memo
  - Memoize ref callback with useCallback
  - _Properties: P1_
  - _Requirements: 1.1_

- [x] 4. Defer keystroke recording to reduce blocking
  - Wrap recordKeystroke call in queueMicrotask
  - Separate typing state update from stats update
  - _Properties: P3_
  - _Requirements: 1.4_

- [x] 5. Add guard for undefined currentWord
  - Check if currentWord exists before processing
  - Return early if game has ended
  - _Properties: P5_
  - _Requirements: 4.1, 4.2_

- [x] 6. Throttle blink data updates in GameWebcam
  - Add ref to track previous blink data
  - Only call onBlinkDataChange when data actually changes
  - Prevent unnecessary object creation
  - _Properties: P1_
  - _Requirements: 1.1_

- [x] 7. Create GameWebcamSimple component
  - [x] 7.1 Create new component file
    - Copy structure from GameWebcam
    - Remove background segmentation hook
    - Remove face overlay hook
    - Remove canvas elements
    - _Requirements: 2.1, 2.2_
  
  - [x] 7.2 Implement hidden video element
    - Use hidden attribute instead of off-screen positioning
    - Maintain webcam and blink detector hooks
    - _Properties: P4_
    - _Requirements: 2.3, 2.4_
  
  - [x] 7.3 Add throttled blink data updates
    - Implement ref comparison for blink data
    - Only update when values change
    - _Requirements: 2.1_

- [x] 8. Update play page to use GameWebcamSimple
  - Replace GameWebcam import with GameWebcamSimple
  - Update component usage
  - _Requirements: 2.1_

- [x] 9. Throttle background segmentation framerate
  - Change throttle from 33ms (30fps) to 66ms (15fps)
  - Update comment to explain performance benefit
  - _Requirements: 2.1, NFR1_

## Implementation Notes

- All changes maintain backward compatibility with existing game features
- Blink detection accuracy is preserved in lightweight mode
- Component memoization follows React best practices
- State updates are batched to minimize main thread blocking

## Estimated Effort

- Total Tasks: 9 (all completed)
- Estimated Time: 2-3 hours
- Complexity: Medium
- Risk Level: Low (non-breaking changes, incremental improvements)

## Dependencies

- React 18+ for memo and hooks
- Zustand for state management
- MediaPipe for blink detection
- Existing typing game components
