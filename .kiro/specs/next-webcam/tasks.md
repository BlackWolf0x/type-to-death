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
  - Added auto-calibration with 10-second sample collection
  - Added threshold calculation with variance detection
  - Added localStorage persistence for calibration data
  - Added structured error codes (BlinkDetectorErrorCode enum)
  - Added face landmark exposure for eye drawing
  - Added blink counting with consecutive frame detection
  - Used refs to avoid stale closure issues in detection loop
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
  - Added auto-calibration UI with progress bar
  - Added video preview with canvas overlay for eye landmarks
  - Added eye landmark drawing (green when open, red when blinking)
  - Added face detection indicator
  - Added EAR value display
  - Added calibration stats display (eyes open, eyes closed, threshold)
  - Added blink counter display
  - Added "Start Calibration" button
  - Added "Recalibrate" button
  - Added "Start Game" button with navigation to /play
  - _Properties: P1, P2, P3, P4, P5, P6, P7, P8_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4_

- [x] 7. Fix blink detection stale closure issues
  - Converted detection loop to useEffect-based pattern
  - Used refs for all mutable values (calibrationRef, blinkCountRef, etc.)
  - Fixed video element reference timing with fresh ref reads per frame
  - Added threshold sensitivity tuning (97% for low-variance calibrations)
  - Removed debug logging after verification
  - _Properties: P7, P8_
  - _Requirements: 7.3, 7.4_

## Implementation Notes

- The calibration page combines webcam permission and blink calibration into a single flow
- Auto-calibration replaces manual "eyes open" / "eyes closed" steps for better UX
- Threshold calculation uses 97% of max EAR for low-variance calibrations to catch quick blinks
- All calibration data persists to localStorage for returning users
- Eye landmarks are drawn on a canvas overlay for real-time visual feedback

## Estimated Effort

- Total Tasks: 7
- Completed: 7
- Status: ✅ Complete
