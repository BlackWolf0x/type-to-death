# Next.js Unity WebGL Integration - Implementation Plan

## Tasks Overview

- [x] 1. Install react-unity-webgl package
  - Installed `react-unity-webgl@10.1.6` using Bun
  - Package provides Unity WebGL integration for React
  - _Properties: None (setup task)_
  - _Requirements: 1.1_

- [x] 2. Create Play Page
  - Created `app-next/app/play/page.tsx`
  - Renders UnityGame component
  - Serves as game entry point
  - _Properties: None (routing)_
  - _Requirements: 1.1_

- [x] 3. Create UnityGame Component
  - Created `app-next/components/unity.tsx`
  - Marked as client component with 'use client'
  - Initialized useUnityContext with build URLs
  - Configured Unity build paths (/game/build.*)
  - Added Unity canvas with fullscreen styling
  - Added loading screen with progress indicator
  - Implemented visibility toggle based on isLoaded
  - _Properties: P1_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4. Integrate Webcam and Blink Detection
  - Imported useWebcam and useBlinkDetector hooks
  - Added useEffect to auto-start webcam on mount
  - Added useEffect to auto-start detection when ready
  - Added hidden video element with setVideoRef callback
  - Configured blink detector with webcam videoRef
  - _Properties: P3, P5_
  - _Requirements: 2.1, 2.2, 2.5, 5.1, 5.2, 5.3_

- [x] 5. Implement Blink Event Communication
  - Added useEffect to watch blinkData.isBlinking
  - Implemented sendMessage call to Unity on blink
  - Configured message target: "Monster", "OnBlinkDetected"
  - Added dependency array to prevent duplicate calls
  - _Properties: P2_
  - _Requirements: 2.3, 2.4_

- [x] 6. Add Visual Feedback
  - Created blink status indicator (bottom-right)
  - Added Eye icon (green) for eyes open state
  - Added EyeOff icon (yellow) for blinking state
  - Added blink counter display
  - Styled with bg-black/60 backdrop and white text
  - Positioned with z-10 to stay above Unity canvas
  - _Properties: P4_
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7. Add Debug Controls
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

## Estimated Effort

- Total Tasks: 7
- Completed: 7
- Status: ✅ Complete
