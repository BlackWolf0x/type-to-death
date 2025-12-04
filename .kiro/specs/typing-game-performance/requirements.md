# Typing Game Performance Optimization - Requirements

## Introduction

This feature addresses audio stuttering issues during typing gameplay caused by excessive React re-renders and heavy MediaPipe processing competing with Unity WebGL's audio thread. The optimization ensures smooth audio playback while maintaining all game functionality.

## Glossary

- **Unity WebGL Audio**: FMOD audio system running in Unity's WebGL build, sharing the main browser thread
- **MediaPipe**: Google's ML framework used for face detection and background segmentation
- **Main Thread Blocking**: JavaScript execution that prevents the browser from processing audio buffers
- **React Re-render**: Component update cycle triggered by state changes
- **Zustand Store**: State management library used for global application state

## Requirements

### Requirement 1: Reduce React Re-renders During Typing

**User Story:** As a player, I want smooth audio playback while typing, so that the game experience is not disrupted by stuttering sounds.

#### Acceptance Criteria

1. WHEN a keystroke occurs, THE typing game components SHALL minimize re-render cascades to prevent main thread blocking
2. WHEN stats update (WPM, accuracy, timer), THE typing display components SHALL NOT re-render unnecessarily
3. WHEN the typing input changes, THE completed and future word components SHALL NOT re-render
4. THE system SHALL batch state updates to reduce synchronous Zustand store updates

### Requirement 2: Optimize MediaPipe Processing

**User Story:** As a player, I want the webcam features to not interfere with game audio, so that I can focus on typing without audio distractions.

#### Acceptance Criteria

1. WHEN the game is running, THE system SHALL provide a lightweight webcam mode that only performs blink detection
2. THE lightweight mode SHALL NOT render background segmentation, VHS effects, or face overlays
3. THE blink detection SHALL continue to function accurately without visual processing
4. THE webcam video element SHALL be hidden from view without affecting MediaPipe processing

### Requirement 3: Prevent Hook Ordering Errors

**User Story:** As a player, I want the game to transition smoothly between chapters, so that I don't encounter errors when completing typing challenges.

#### Acceptance Criteria

1. WHEN a chapter completes, THE TextDisplay component SHALL maintain consistent hook call order
2. WHEN the story completes, THE component SHALL render the completion screen without React errors
3. THE system SHALL call all hooks before any conditional early returns

### Requirement 4: Handle Edge Cases Gracefully

**User Story:** As a player, I want the game to handle unexpected states without crashing, so that my gameplay experience is reliable.

#### Acceptance Criteria

1. WHEN the game ends, THE typing store SHALL guard against undefined word access
2. WHEN typing input is received after game completion, THE system SHALL ignore the input without errors
3. THE system SHALL prevent state updates on unmounted components

## Non-Functional Requirements

### NFR1: Performance
- Audio stuttering SHALL be eliminated or reduced to imperceptible levels
- Frame drops during typing SHALL be minimized
- MediaPipe processing SHALL not block the main thread for more than 16ms per frame

### NFR2: Maintainability
- Component memoization SHALL be clearly documented
- Performance optimizations SHALL not compromise code readability
- State update patterns SHALL follow React best practices

### NFR3: Compatibility
- Optimizations SHALL work across Chrome, Firefox, and Safari
- Unity WebGL audio SHALL function correctly with all changes
- Existing game features SHALL remain fully functional

## Constraints

- Must maintain existing blink detection accuracy
- Cannot modify Unity build (audio settings are baked in)
- Must work within browser main thread limitations
- Cannot introduce new dependencies

## Dependencies

- React 18+ (for memo and concurrent features)
- Zustand state management
- MediaPipe Face Landmarker
- Unity WebGL with FMOD audio

## Success Metrics

- Audio stuttering eliminated during normal typing speed (60+ WPM)
- React DevTools Profiler shows <5ms render time per keystroke
- No console errors during chapter transitions
- Blink detection maintains >95% accuracy

## Out of Scope

- Unity audio buffer size changes (requires rebuild)
- Alternative audio systems
- Complete removal of MediaPipe (needed for blink detection)
- Server-side processing
