# Next.js Webcam & Blink Detection Integration - Implementation Plan

## Tasks Overview

- [x] 1. Improve useWebcam hook with structured error codes
  - Added `WebcamErrorCode` enum with 11 distinct error codes
  - Created `WebcamError` interface with code, message, and originalError
  - Implemented `mapErrorToWebcamError()` for DOM exception mapping
  - Added `clearError()` method for retry flows
  - Added `switchDevice()` for camera switching
  - Added `currentDeviceId` state tracking
  - Added `mountedRef` to prevent state updates after unmount
  - Added device change listener for automatic device list updates
  - Added track ended listener for disconnect detection
  - Renamed `webcamRef` to `videoRef` for clarity
  - Changed `start()` to return `Promise<boolean>` for success checking
  - Added `setVideoRef` callback ref for dynamic video element mounting
  - _Properties: P2_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 2. Create webcam error codes documentation
  - Created `docs-ai/webcam-error-codes.md`
  - Documented all 11 error codes with causes and solutions
  - Added frontend implementation examples
  - Added quick reference table
  - _Properties: P2_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 3. Install required shadcn/ui components
  - Alert, Button, Card components installed
  - Located in `app-next/components/ui/`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 4. Implement useBlinkDetector hook
  - Created `app-next/hooks/useBlinkDetector.ts`
  - Integrated MediaPipe FaceLandmarker for face detection
  - Implemented EAR (Eye Aspect Ratio) calculation with 6-point formula
  - Added center vertical landmark points (158/153 left, 387/373 right) for stability
  - Added manual 2-step calibration (eyes open → eyes closed)
  - Threshold calculated as: closed + (gap * 0.3) for 30% closed trigger point
  - Added structured error codes (BlinkDetectorErrorCode enum)
  - Added face landmark exposure for eye drawing
  - Implemented state machine blink detection (open → closing → closed → opening → open)
  - Added temporal filtering: MIN_BLINK_FRAMES=2, MAX_BLINK_FRAMES=15, REOPEN_FRAMES=2
  - Blink only counted when eyes close AND reopen (prevents false positives)
  - Detection loop starts immediately and polls for video readiness
  - _Properties: P6, P7, P8_
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4_

- [x] 5. Create blink detector error codes documentation
  - Created `docs-ai/blink-detector-error-codes.md`
  - Documented all error codes with causes and solutions
  - _Properties: P6_
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 6. Implement Calibration Page
  - Created `app-next/app/calibration/page.tsx`
  - Implemented three-state flow: webcam → calibration → ready
  - Added webcam permission request UI with error handling
  - Added manual 2-step calibration UI:
    - Step 1: Record eyes open EAR with Record/Save buttons
    - Step 2: Record eyes closed EAR with Record/Save buttons
  - Added video preview with canvas overlay for eye landmarks
  - Added eye landmark drawing (green when open, red when blinking)
  - Added face detection indicator and EAR value display
  - Added calibration stats display (eyes open, eyes closed, threshold)
  - Added blink counter display in ready state
  - Added "Start Over" button to reset calibration
  - Added "Start Game" button with navigation to /play
  - _Properties: P1, P2, P3, P4, P5, P6, P7, P8_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4_

- [x] 7. Rewrite blink detector to match working implementation
  - Rewrote hook to match old React app implementation exactly
  - Changed from auto-calibration to manual 2-step calibration
  - Simplified API: direct properties instead of nested blinkData object
  - Fixed detection loop to poll for video readiness each frame
  - Threshold formula: eyesOpenEAR * 0.4 + eyesClosedEAR * 0.6
  - Detection starts immediately when MediaPipe is ready
  - _Properties: P7, P8_
  - _Requirements: 7.3, 7.4_

- [x] 8. Add localStorage persistence for calibration data
  - Added `loadCalibration()` to restore saved data on hook initialization
  - Added `saveCalibration()` called when calibration completes (in `saveCalibrateClosed`)
  - Added `clearCalibration()` called when user resets calibration
  - Hook initializes `isCalibrated`, `eyesOpenEAR`, `eyesClosedEAR`, and `earThreshold` from localStorage
  - Calibration page auto-skips to ready state if stored calibration exists
  - Storage key: `'blink-calibration'`
  - _Properties: P7_
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 9. Suppress MediaPipe/TensorFlow INFO console messages
  - Added global console.error override at module load time
  - Filters out messages containing "INFO:" to prevent Next.js error overlay
  - MediaPipe WASM logs "INFO: Created TensorFlow Lite XNNPACK delegate for CPU" via console.error
  - Next.js dev overlay incorrectly treats these INFO messages as errors
  - Override applied in `useBlinkDetector.ts` before hook definition
  - _Properties: P6_
  - _Requirements: 6.1_

## Implementation Notes

- The calibration page combines webcam permission and blink calibration into a single flow
- Manual 2-step calibration: user records eyes-open EAR, then eyes-closed EAR
- Threshold calculation: eyesOpenEAR * 0.4 + eyesClosedEAR * 0.6
- All calibration data persists to localStorage for returning users
- Returning users skip directly to ready state if calibration exists
- Eye landmarks are drawn on a canvas overlay for real-time visual feedback

- [x] 10. Create GameWebcam component for Play Page
  - Created `app-next/components/game-webcam.tsx`
  - Checks for stored calibration data in localStorage
  - Checks camera permission via Permissions API (without prompting)
  - Redirects to /calibration if either check fails
  - Starts webcam only after all checks pass
  - Signals parent via `onReady()` callback when ready
  - Forwards blink events via `onBlink()` callback
  - Displays blink counter indicator during gameplay
  - Handles webcam errors by redirecting to calibration
  - _Properties: P9, P10, P11, P12_
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.8_

- [x] 11. Update Play Page to use GameWebcam component
  - Modified `app-next/app/play/page.tsx`
  - Added `isReady` state to track when checks pass
  - Unity only loads after `onReady()` callback fires
  - Displays "Checking requirements..." loading state before ready
  - Displays Unity loading progress after ready
  - Forwards blink events from GameWebcam to Unity via sendMessage
  - Prevents Unity WebGL context errors during redirect
  - _Properties: P11_
  - _Requirements: 9.5, 9.7_

- [x] 12. Improve blink detection robustness
  - Updated EAR calculation to use proper 6-point formula with center vertical points
  - Added landmark indices: top2/bottom2 (158/153 for left, 387/373 for right)
  - Implemented state machine for blink detection: open → closing → closed → opening → open
  - Added temporal filtering parameters:
    - MIN_BLINK_FRAMES = 2 (minimum frames eyes must be closed)
    - MAX_BLINK_FRAMES = 15 (maximum frames for valid blink, ~250ms at 60fps)
    - REOPEN_FRAMES = 2 (frames eyes must reopen to confirm blink)
  - Blink only counted when eyes close AND reopen (prevents false positives from squinting)
  - Updated threshold calculation: closed + (gap * 0.3) instead of weighted average
  - Added calibration gap warning when gap < 0.1
  - Removed unused refs (wasBlinkingRef, consecutiveFramesRef)
  - _Properties: P7, P8_
  - _Requirements: 7.3, 7.4_

## Implementation Notes

- The calibration page combines webcam permission and blink calibration into a single flow
- Manual 2-step calibration: user records eyes-open EAR, then eyes-closed EAR
- Threshold calculation: closed + (gap * 0.3) for 30% closed trigger point
- State machine ensures blinks are only counted when eyes close AND reopen
- Temporal filtering prevents false positives from noise and partial blinks
- All calibration data persists to localStorage for returning users
- Returning users skip directly to ready state if calibration exists
- Eye landmarks are drawn on a canvas overlay for real-time visual feedback
- **Play page automatically verifies calibration and permission before loading Unity**
- **GameWebcam component handles all webcam checks and redirects**
- **Unity loading is delayed until all checks pass to prevent WebGL context errors**

- [x] 13. Implement game start state management
  - Added `gameStarted` state to Play Page to track when game begins
  - Updated GameWebcam to accept `gameStarted` prop
  - Modified blink counter display to show ∞ before game starts
  - Implemented blink count reset when game starts via `resetBlinkCount()`
  - Added `hasResetForGame` ref to ensure reset only happens once
  - Modified blink event forwarding to only send events after game starts
  - Updated Start button to hide after game begins
  - _Properties: P11, P12_
  - _Requirements: 9.9, 9.10, 9.11, 9.12_

## Estimated Effort

- Total Tasks: 13
- Completed: 13
- Status: ✅ Complete
