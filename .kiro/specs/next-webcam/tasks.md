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
  - Implemented EAR (Eye Aspect Ratio) calculation
  - Added manual 2-step calibration (eyes open → eyes closed)
  - Threshold calculated as: eyesOpenEAR * 0.4 + eyesClosedEAR * 0.6
  - Added structured error codes (BlinkDetectorErrorCode enum)
  - Added face landmark exposure for eye drawing
  - Added blink counting with consecutive frame detection
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

## Estimated Effort

- Total Tasks: 9
- Completed: 9
- Status: ✅ Complete
