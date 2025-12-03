# Next.js Unity WebGL Integration - Requirements

## Introduction

This spec defines the requirements for integrating Unity WebGL builds into the Next.js application with real-time blink detection. The integration enables the Type to Death game to run in the browser with webcam-based blink detection controlling gameplay.

## Context

The project uses:
- Unity 6.1 WebGL build for the game
- `react-unity-webgl` package for Unity integration
- `useWebcam` and `useBlinkDetector` hooks for blink detection
- Calibration data persisted from `/calibration` page

The game requires real-time communication between React (blink detection) and Unity (game logic), with blinks triggering monster teleportation in the Unity scene.

## Glossary

- **Unity WebGL**: Browser-compatible Unity build that runs in the browser
- **react-unity-webgl**: React library for embedding Unity WebGL builds
- **Unity Provider**: Context object that manages Unity instance lifecycle
- **SendMessage**: Method to call Unity C# functions from JavaScript
- **Monster**: Unity GameObject that responds to blink events
- **MainMenuManager**: Unity GameObject that manages scene transitions
- **Story Introduction**: The narrative text displayed before gameplay begins, providing context and setting
- **Intro Screen**: The overlay that displays the story title and introduction before the game starts

## Requirements

### Requirement 1: Unity WebGL Loading

**User Story:** As a user, I want to see the Unity game load in my browser, so that I can play the game without downloading anything.

#### Acceptance Criteria

1. WHEN the user navigates to `/play` THEN the Unity WebGL build SHALL start loading
2. WHEN Unity is loading THEN the page SHALL display a loading progress indicator
3. WHEN Unity finishes loading THEN the loading indicator SHALL disappear
4. WHEN Unity is loaded THEN the game canvas SHALL be visible and interactive
5. THE Unity canvas SHALL fill the entire viewport (fullscreen)
6. WHEN Unity sends "GameIsReady" event THEN the system SHALL automatically start the game
7. WHEN transitioning to game scene THEN the loading text SHALL fade out first (300ms)
8. WHEN transitioning to game scene THEN the loading overlay SHALL fade out after (1000ms duration, 600ms delay)

### Requirement 8: Story Introduction Screen

**User Story:** As a player, I want to see the story introduction after the game loads, so that I understand the context and setting before gameplay begins.

#### Acceptance Criteria

1. WHEN requirements are checked and Unity is fully loaded THEN the system SHALL display the intro screen
2. WHEN the intro screen appears THEN it SHALL show the story title in red text
3. WHEN the intro screen appears THEN it SHALL show the story introduction text
4. THE introduction text SHALL be scrollable if it exceeds viewport height
5. WHEN the intro screen appears THEN a "Begin" button SHALL be visible
6. WHEN the "Begin" button is clicked THEN the intro screen SHALL fade out
7. WHEN the "Begin" button is clicked THEN Unity SHALL transition to the game scene
8. WHEN the player restarts the game THEN the intro screen SHALL NOT appear again
9. THE intro screen SHALL only appear on the first play session
10. THE intro screen SHALL use story data from data.ts
11. THE loading screen SHALL fade out before the intro screen appears
12. THE intro screen SHALL appear after both requirements check and Unity loading are complete
13. WHEN the intro screen appears THEN it SHALL display gameplay tips (blink warning, headphones, fullscreen)
14. WHEN the intro screen appears THEN it SHALL provide a fullscreen toggle button
15. WHEN the fullscreen button is clicked THEN the browser SHALL enter or exit fullscreen mode
16. WHEN in fullscreen mode THEN the button text SHALL change to "Exit Fullscreen"
17. WHEN not in fullscreen mode THEN the button text SHALL show "Enter Fullscreen"

### Requirement 2: Blink Detection Integration

**User Story:** As a user, I want my real blinks to control the game, so that I can play using natural eye movements.

#### Acceptance Criteria

1. WHEN the play page loads THEN the webcam SHALL start automatically
2. WHEN the webcam is streaming THEN blink detection SHALL start automatically
3. WHEN the user blinks THEN the system SHALL send a blink event to Unity
4. WHEN a blink event is sent THEN Unity SHALL call the Monster's OnBlinkDetected method
5. THE blink detection SHALL use the calibration saved from the calibration page

### Requirement 3: Visual Feedback

**User Story:** As a user, I want to see when my blinks are detected, so that I know the system is working correctly.

#### Acceptance Criteria

1. WHEN blink detection is active THEN the page SHALL display a blink status indicator
2. WHEN the user's eyes are open THEN the indicator SHALL show a green eye icon
3. WHEN the user blinks THEN the indicator SHALL show a yellow closed eye icon
4. WHEN blink detection is active THEN the page SHALL display the total blink count
5. THE blink indicator SHALL be visible but not obstruct gameplay

### Requirement 4: Debug Controls

**User Story:** As a developer, I want manual controls to test Unity integration, so that I can verify the game works without relying on blink detection.

#### Acceptance Criteria

1. THE play page SHALL provide a "Start" button to trigger scene transitions
2. THE play page SHALL provide a "Manual Blink" button to simulate blinks
3. WHEN the "Start" button is clicked THEN Unity SHALL call MainMenuManager.GoToGameScene
4. WHEN the "Manual Blink" button is clicked THEN Unity SHALL call Monster.OnBlinkDetected
5. THE debug controls SHALL be visible but not obstruct gameplay

### Requirement 5: Webcam Privacy

**User Story:** As a user, I want the webcam feed to be hidden during gameplay, so that I'm not distracted by my own video.

#### Acceptance Criteria

1. WHEN the play page loads THEN the webcam video element SHALL be hidden
2. THE webcam SHALL continue streaming for blink detection
3. THE webcam feed SHALL NOT be visible to the user during gameplay

### Requirement 6: Game Over and Restart

**User Story:** As a player, I want to see a game over screen when I lose and be able to restart the game, so that I can try again without refreshing the page.

#### Acceptance Criteria

1. WHEN Unity sends "GameLost" event THEN the system SHALL display a game over overlay
2. WHEN the game over overlay appears THEN it SHALL show "You Died" text in red
3. WHEN the game over overlay appears THEN the typing game SHALL hide and reset
4. WHEN the game over overlay appears THEN the blink counter SHALL show infinity (∞)
5. WHEN the game over overlay appears THEN a "Try Again" button SHALL be visible
6. WHEN the "Try Again" button is clicked THEN the system SHALL send "RestartScene" message to Unity GameManager
7. WHEN the game restarts THEN the typing game SHALL reappear and reload the story
8. WHEN the game restarts THEN the blink counter SHALL reset to 0 and start counting
9. WHEN the game restarts THEN the game over overlay SHALL fade out
10. THE restart functionality SHALL be reusable for future win screens

### Requirement 7: Win State and Victory Screen

**User Story:** As a player, I want to see a victory screen when I complete all typing challenges, so that I know I've won and can play again.

#### Acceptance Criteria

1. WHEN the typing game story is complete THEN the system SHALL send "GameWon" message to Unity GameManager
2. WHEN the story completes THEN the system SHALL display a win overlay
3. WHEN the win overlay appears THEN it SHALL show "You Survived!" text in green
4. WHEN the win overlay appears THEN it SHALL be centered without a dark background overlay
5. WHEN the win overlay appears THEN it SHALL have a semi-transparent dark card background
6. WHEN the win overlay appears THEN a "Play Again" button SHALL be visible
7. WHEN the "Play Again" button is clicked THEN the system SHALL use the reusable restart function
8. WHEN the game restarts from win screen THEN the typing game SHALL reset and reload
9. WHEN the game restarts from win screen THEN the win overlay SHALL fade out
10. THE win overlay SHALL use z-30 to appear above all game elements
11. WHEN the story completes THEN the typing game SHALL hide and reset
12. WHEN the story completes THEN the blink counter SHALL show infinity (∞)
13. WHEN the game restarts from win screen THEN the blink counter SHALL reset to 0

## Non-Functional Requirements

### NFR1: Performance
The Unity game SHALL maintain 60 FPS while blink detection runs in parallel.

### NFR2: Responsiveness
Blink events SHALL be sent to Unity within 100ms of detection.

### NFR3: Reliability
The webcam and blink detection SHALL automatically recover from errors without user intervention.

### NFR4: User Experience
The loading screen SHALL provide clear progress feedback during Unity initialization.

### NFR5: Compatibility
The integration SHALL work on all browsers that support WebGL and MediaDevices API.

## Constraints

- Must use `react-unity-webgl` package for Unity integration
- Must use existing `useWebcam` and `useBlinkDetector` hooks
- Unity build files must be in `/public/game/` directory
- Must follow Next.js 16 App Router conventions
- Must use client components ('use client') for Unity integration

## Dependencies

- `react-unity-webgl` package (v10.1.6)
- `useWebcam` hook from `@/hooks/useWebcam`
- `useBlinkDetector` hook from `@/hooks/useBlinkDetector`
- Unity 6.1 WebGL build
- Calibration data from `/calibration` page
- shadcn/ui Button component
- Lucide icons (Eye, EyeOff)
- Story data from `@/typing-game/data.ts`

## Success Metrics

- Unity game loads successfully in the browser
- Blink detection works during gameplay
- Blinks trigger monster teleportation in Unity
- Loading progress is clearly communicated
- Debug controls work for testing
- Webcam feed is hidden but functional
- Game maintains smooth performance

### Requirement 9: Unity Instance Cleanup

**User Story:** As a user, I want the Unity game to properly clean up when I navigate away, so that I don't encounter errors or memory leaks.

#### Acceptance Criteria

1. WHEN the user navigates away from the play page THEN the Unity instance SHALL be unloaded
2. WHEN Unity is being unloaded THEN the FMOD audio context SHALL be closed before unloading
3. WHEN audio cleanup fails THEN the error SHALL be silently caught and ignored
4. WHEN Unity unload fails THEN the error SHALL be silently caught and ignored
5. THE cleanup SHALL happen automatically on component unmount
6. THE cleanup SHALL prevent FMOD audio worklet errors after navigation

## Out of Scope

- Unity game logic implementation (separate Unity spec)
- Calibration UI (handled by `/calibration` page)
- Webcam permission handling (handled by calibration page)
- Multiple Unity scenes management
- Unity-to-React communication (events from Unity to React)
- Game state persistence
- Leaderboards or scoring
