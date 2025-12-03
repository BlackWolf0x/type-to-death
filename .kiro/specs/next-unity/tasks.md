# Next.js Unity WebGL Integration - Implementation Plan

## Tasks Overview

- [x] 1. Install react-unity-webgl package
  - Installed `react-unity-webgl@10.1.6` using Bun
  - Package provides Unity WebGL integration for React
  - _Properties: None (setup task)_
  - _Requirements: 1.1_

- [x] 2. Create Play Page with Unity Integration
  - Created `app-next/app/play/page.tsx` as client component
  - Moved Unity integration directly into page for easy access to Unity context
  - Initialized useUnityContext with build URLs
  - Configured Unity build paths (/game/build.*)
  - Added Unity canvas with fullscreen styling
  - Added loading screen with progress indicator
  - Implemented visibility toggle based on isLoaded
  - Deleted separate `app-next/components/unity.tsx` component
  - _Properties: P1_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Integrate Webcam and Blink Detection
  - Imported useWebcam and useBlinkDetector hooks into play page
  - Added useEffect to auto-start webcam on mount
  - Added useEffect to auto-start detection when ready
  - Added hidden video element with setVideoRef callback
  - Configured blink detector with webcam videoRef
  - _Properties: P3, P5_
  - _Requirements: 2.1, 2.2, 2.5, 5.1, 5.2, 5.3_

- [x] 4. Implement Blink Event Communication
  - Added useEffect to watch blinkData.isBlinking
  - Implemented sendMessage call to Unity on blink
  - Configured message target: "Monster", "OnBlinkDetected"
  - Added dependency array to prevent duplicate calls
  - _Properties: P2_
  - _Requirements: 2.3, 2.4_

- [x] 5. Add Visual Feedback
  - Created blink status indicator (bottom-right)
  - Added Eye icon (green) for eyes open state
  - Added EyeOff icon (yellow) for blinking state
  - Added blink counter display
  - Styled with bg-black/60 backdrop and white text
  - Positioned with z-10 to stay above Unity canvas
  - _Properties: P4_
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Add Debug Controls
  - Created debug button container (top-left)
  - Added "Start" button with handleStartGame function
  - Added "Manual Blink" button with handleBlink function
  - Implemented sendMessage calls for both buttons
  - Configured MainMenuManager.GoToGameScene for Start
  - Configured Monster.OnBlinkDetected for Manual Blink
  - _Properties: None (debug feature)_
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

## Implementation Notes

- Unity build files must be placed in `/public/game/` directory
- The webcam video element is hidden but continues streaming for blink detection
- Blink detection uses calibration saved from `/calibration` page
- Loading screen shows percentage from 0-100% during Unity initialization
- All UI elements use z-index to layer above Unity canvas (z-0)
- Debug controls remain visible for testing and development

## Unity Setup Requirements

The Unity build must include:
1. `build.loader.js` - Unity loader script
2. `build.data` - Game data
3. `build.framework.js` - Unity framework
4. `build.wasm` - WebAssembly binary

Unity C# scripts must implement:
1. `Monster.OnBlinkDetected()` - Method to handle blink events
2. `MainMenuManager.GoToGameScene()` - Method to transition scenes

- [x] 7. Implement Unity Event Listening and Auto-Start
  - Added addEventListener and removeEventListener from useUnityContext
  - Created handleGameIsReady callback to set unityReady state
  - Added useEffect to listen for "GameIsReady" event from Unity
  - Added useEffect to auto-start game when unityReady becomes true
  - Removed manual Start button (game now starts automatically)
  - Added smooth loading screen transitions:
    - Text fades out immediately (300ms duration)
    - Overlay fades out after 600ms delay (1000ms duration)
  - Added separate textVisible state for independent text fade control
  - Loading screen shows "Checking requirements..." then "Loading game..."
  - _Properties: P1, P2_
  - _Requirements: 1.6, 1.7, 1.8_

## Implementation Notes

- Unity build files must be placed in `/public/game/` directory
- The webcam video element is hidden but continues streaming for blink detection
- Blink detection uses calibration saved from `/calibration` page
- Loading screen shows percentage from 0-100% during Unity initialization
- All UI elements use z-index to layer above Unity canvas (z-0)
- Debug controls remain visible for testing and development
- **Unity must send "GameIsReady" event when ready to start the game**
- Game starts automatically when Unity is ready (no manual button needed)
- Loading screen has layered fade: text disappears first, then overlay

## Unity Setup Requirements

The Unity build must include:
1. `build.loader.js` - Unity loader script
2. `build.data` - Game data
3. `build.framework.js` - Unity framework
4. `build.wasm` - WebAssembly binary

Unity C# scripts must implement:
1. `Monster.OnBlinkDetected()` - Method to handle blink events
2. `MainMenuManager.GoToGameScene()` - Method to transition scenes
3. **Send "GameIsReady" event when Unity is ready** - Use SendToReact("GameIsReady")

- [x] 8. Implement Game Over and Restart Functionality
  - Added addEventListener for "GameLost" event from Unity
  - Created handleGameLost callback to set gameLost state
  - Added gameLost state to track game over condition
  - When game lost: hide typing game, reset typing game store, show infinity for blinks
  - Created game over overlay with "You Died" text (red, large font)
  - Added "Try Again" button below game over text
  - Implemented handleRestartGame function (reusable for win screen):
    - Sends sendMessage("GameManager", "RestartScene") to Unity
    - Resets typing game store
    - Reloads story with loadStory()
    - Hides game over overlay
    - Shows typing game and starts blink counting
  - Exported useTypingGameStore from typing-game index for external access
  - Game over overlay fades in/out with 700ms transition
  - _Properties: P2, P6_
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

## Implementation Notes

- Unity build files must be placed in `/public/game/` directory
- The webcam video element is hidden but continues streaming for blink detection
- Blink detection uses calibration saved from `/calibration` page
- Loading screen shows percentage from 0-100% during Unity initialization
- All UI elements use z-index to layer above Unity canvas (z-0)
- Debug controls remain visible for testing and development
- **Unity must send "GameIsReady" event when ready to start the game**
- **Unity must send "GameLost" event when player loses**
- Game starts automatically when Unity is ready (no manual button needed)
- Loading screen has layered fade: text disappears first, then overlay
- Game over overlay uses z-30 to appear above all other elements
- Restart functionality is reusable for win screen implementation

## Unity Setup Requirements

The Unity build must include:
1. `build.loader.js` - Unity loader script
2. `build.data` - Game data
3. `build.framework.js` - Unity framework
4. `build.wasm` - WebAssembly binary

Unity C# scripts must implement:
1. `Monster.OnBlinkDetected()` - Method to handle blink events
2. `MainMenuManager.GoToGameScene()` - Method to transition scenes
3. **Send "GameIsReady" event when Unity is ready** - Use SendToReact("GameIsReady")
4. **Send "GameLost" event when player loses** - Use SendToReact("GameLost")
5. **GameManager.RestartScene()** - Method to restart the game scene

- [x] 9. Implement Win State and Victory Screen
  - Added isStoryComplete subscription from typing game store
  - Added gameWon state to track victory condition
  - Added useEffect to watch isStoryComplete and send "GameWon" to Unity
  - Sends sendMessage("GameManager", "GameWon") when story completes
  - Created win overlay with centered card (no full-screen dark background)
  - Win card has semi-transparent dark background (bg-black/80)
  - Displays "You Survived!" text in green (text-green-500)
  - Added "Play Again" button with green styling
  - Updated handleRestartGame to reset gameWon state
  - Updated auto-start logic to prevent restart when gameWon is true
  - Win overlay fades in/out with 700ms transition
  - Uses z-30 to appear above all game elements
  - _Properties: P2, P7_
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

## Implementation Notes

- Unity build files must be placed in `/public/game/` directory
- The webcam video element is hidden but continues streaming for blink detection
- Blink detection uses calibration saved from `/calibration` page
- Loading screen shows percentage from 0-100% during Unity initialization
- All UI elements use z-index to layer above Unity canvas (z-0)
- Debug controls remain visible for testing and development
- **Unity must send "GameIsReady" event when ready to start the game**
- **Unity must send "GameLost" event when player loses**
- **React sends "GameWon" to Unity when typing game completes**
- Game starts automatically when Unity is ready (no manual button needed)
- Loading screen has layered fade: text disappears first, then overlay
- Game over overlay uses z-30 to appear above all other elements
- Win overlay uses z-30 with centered card (no full-screen overlay)
- Restart functionality is reusable for both game over and win screens

## Unity Setup Requirements

The Unity build must include:
1. `build.loader.js` - Unity loader script
2. `build.data` - Game data
3. `build.framework.js` - Unity framework
4. `build.wasm` - WebAssembly binary

Unity C# scripts must implement:
1. `Monster.OnBlinkDetected()` - Method to handle blink events
2. `MainMenuManager.GoToGameScene()` - Method to transition scenes
3. **Send "GameIsReady" event when Unity is ready** - Use SendToReact("GameIsReady")
4. **Send "GameLost" event when player loses** - Use SendToReact("GameLost")
5. **GameManager.RestartScene()** - Method to restart the game scene
6. **GameManager.GameWon()** - Method to receive win notification from React

- [x] 10. Fix Win State to Hide Typing Game and Reset Blink Counter
  - Updated win state useEffect to set gameStarted to false when story completes
  - Updated win state useEffect to call resetTypingGame() when story completes
  - This hides the typing game and shows infinity (∞) for blink counter
  - Updated GameWebcam to reset hasResetForGame ref when gameStarted becomes false
  - This allows blink counter to reset to 0 on subsequent game restarts
  - Ensures proper state reset for both game over and win scenarios
  - _Properties: P2, P7_
  - _Requirements: 7.11, 7.12, 7.13_

- [x] 11. Implement Story Introduction Screen
  - Add showIntro and introSeen state variables
  - Add introScrollRef for scrollable intro text container
  - Import story data from @/typing-game/data.ts
  - Add useEffect to show intro when isReady and not introSeen
  - Update Unity auto-start logic to require introSeen state
  - Create handleStartGame callback to hide intro and set introSeen
  - Add intro screen overlay with fade transition (700ms)
  - Display story.title in red (text-red-500) with large font
  - Display story.introduction in scrollable container (max-h-[50vh])
  - Add "Begin" button with red styling to start game
  - Update showLoading logic to hide when intro is visible
  - Ensure intro only appears on first play, skipped on restart
  - _Properties: P8, P9_
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

- [x] 12. Update Intro Screen to Display After Game Loads
  - Modify intro screen display logic to wait for both isReady AND unityReady
  - Update useEffect to show intro only after Unity is fully loaded
  - Add smooth transition: loading screen fades out, then intro fades in
  - Move GoToGameScene call to trigger only when "Begin" button is clicked
  - Separate game start logic from intro display logic
  - Ensure intro screen still skips on restart (introSeen persists)
  - Loading screen fades out with text disappearing first (600ms), then overlay (300ms delay)
  - Intro screen appears 300ms after loading screen starts fading
  - _Properties: P8_
  - _Requirements: 8.1, 8.7, 8.11, 8.12_

## Implementation Notes

- Unity build files must be placed in `/public/game/` directory
- The webcam video element is hidden but continues streaming for blink detection
- Blink detection uses calibration saved from `/calibration` page
- Loading screen shows percentage from 0-100% during Unity initialization
- All UI elements use z-index to layer above Unity canvas (z-0)
- Debug controls remain visible for testing and development
- **Unity must send "GameIsReady" event when ready to start the game**
- **Unity must send "GameLost" event when player loses**
- **React sends "GameWon" to Unity when typing game completes**
- Game starts automatically when Unity is ready (no manual button needed)
- Loading screen has layered fade: text disappears first, then overlay
- Game over overlay uses z-30 to appear above all other elements
- Win overlay uses z-30 with centered card (no full-screen overlay)
- Restart functionality is reusable for both game over and win screens
- **Blink counter resets properly on every game restart (both from game over and win screens)**
- **Typing game hides and resets on both game over and win states**

## Unity Setup Requirements

The Unity build must include:
1. `build.loader.js` - Unity loader script
2. `build.data` - Game data
3. `build.framework.js` - Unity framework
4. `build.wasm` - WebAssembly binary

Unity C# scripts must implement:
1. `Monster.OnBlinkDetected()` - Method to handle blink events
2. `MainMenuManager.GoToGameScene()` - Method to transition scenes
3. **Send "GameIsReady" event when Unity is ready** - Use SendToReact("GameIsReady")
4. **Send "GameLost" event when player loses** - Use SendToReact("GameLost")
5. **GameManager.RestartScene()** - Method to restart the game scene
6. **GameManager.GameWon()** - Method to receive win notification from React

- [x] 13. Enhance intro screen UI with gameplay tips and fullscreen toggle
  - Add Eye icon with "Do not blink, Do not look down" tip card
  - Add Headphones icon with "Headphones Recommended" tip card
  - Add Fullscreen icon with "Fullscreen Recommended" tip card
  - Implement fullscreen toggle button with Enter/Exit states
  - Add toggleFullscreen handler using Fullscreen API
  - Add fullscreen change event listener to track state
  - Update button text dynamically based on fullscreen state
  - Wrap story title and introduction in Card component with disableRain prop
  - Adjust spacing and icon sizes for better visual balance
  - Remove unused useRef import
  - _Requirements: 8.2, 8.3, 8.5_

- [x] 14. Implement Unity cleanup on navigation
  - Add unload to useUnityContext destructuring
  - Create cleanup effect that runs on component unmount
  - Attempt to close FMOD audio context before unloading Unity
  - Access Unity's audio context via window.unityInstance.Module.audioContext
  - Call audioContext.close() with error catching
  - Call unload() to destroy Unity instance
  - Wrap all cleanup in try-catch to silently handle errors
  - Use async cleanup function to properly handle promises
  - Prevent "table index is out of bounds" FMOD error on navigation
  - _Properties: P14_
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

## Estimated Effort

- Total Tasks: 14
- Completed: 14
- Status: ✅ Complete
