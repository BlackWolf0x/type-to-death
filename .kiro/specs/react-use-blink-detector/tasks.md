# Blink Detector Hook - Implementation Plan

## Tasks Overview

- [x] 1. Set up project dependencies and type definitions
  - Install @mediapipe/tasks-vision package via pnpm
  - Create TypeScript interfaces for BlinkData and UseBlinkDetectorReturn
  - Define eye landmark index constants
  - _Properties: None (setup task)_
  - _Requirements: 1.1_

- [x] 2. Implement MediaPipe initialization
  - Create useEffect for MediaPipe initialization on mount
  - Load WASM runtime from CDN using FilesetResolver
  - Load face landmark model from Google Storage
  - Configure FaceLandmarker with VIDEO mode, GPU delegate, 1 face
  - Set isInitialized state on success
  - Handle initialization errors and set error state
  - Implement cleanup with mounted flag
  - _Properties: None (initialization)_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Implement webcam integration
  - Instantiate useWebcam hook with video constraints (1280x720, user-facing)
  - Create startTracking function that calls webcam.startWebcam()
  - Create stopTracking function that calls webcam.stopWebcam()
  - Handle startTracking errors and set error state
  - Expose videoRef and isStreaming from internal webcam
  - _Properties: None (integration)_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.2, 7.5_


- [x] 4. Implement Euclidean distance calculation
  - Create distance function that takes two 3D points (x, y, z)
  - Calculate distance using formula: sqrt((x2-x1)² + (y2-y1)² + (z2-z1)²)
  - _Properties: P1_
  - _Requirements: 3.3_

- [x] 5. Implement Eye Aspect Ratio (EAR) calculation
  - Create calculateEAR function that takes landmarks and eye indices
  - Extract 6 landmark points (left, right, top1, top2, bottom1, bottom2)
  - Return 0 if any landmark is missing
  - Calculate vertical1 = distance(top1, bottom1)
  - Calculate vertical2 = distance(top2, bottom2)
  - Calculate horizontal = distance(left, right)
  - Return EAR = (vertical1 + vertical2) / (2.0 * horizontal)
  - _Properties: P2_
  - _Requirements: 3.1, 3.2_

- [x] 6. Implement face landmark processing
  - Create processFaceLandmarks function with useCallback
  - Handle empty faceLandmarks (set all EAR to 0, faceLandmarks to null)
  - Extract first face landmarks from result
  - Calculate leftEAR using LEFT_EYE_INDICES
  - Calculate rightEAR using RIGHT_EYE_INDICES
  - Calculate averageEAR as (leftEAR + rightEAR) / 2.0
  - Update state: leftEAR, rightEAR, averageEAR, faceLandmarks
  - _Properties: P2_
  - _Requirements: 3.2, 3.4, 3.5_

- [x] 7. Implement calibration sample collection
  - In processFaceLandmarks, check if calibrationState is 'open' or 'closed'
  - If calibrating, push averageEAR to calibrationSamplesRef
  - Log sample collection with state and count
  - _Properties: P11_
  - _Requirements: 10.1, 10.2_

- [x] 8. Implement blink detection logic
  - In processFaceLandmarks, return early if not isCalibrated
  - If averageEAR < earThreshold, increment consecutiveFramesRef
  - If consecutiveFramesRef >= CONSEC_FRAMES, set isBlinking to true
  - On transition to blinking (wasBlinkingRef false), increment blinkCount
  - Set wasBlinkingRef to true when blinking
  - If averageEAR >= earThreshold, reset consecutiveFramesRef to 0
  - Set isBlinking to false and wasBlinkingRef to false when not blinking
  - _Properties: P4, P5, P6, P7_
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9. Implement detection loop
  - Create useEffect that depends on faceLandmarker, webcam.isStreaming, webcam.videoRef, processFaceLandmarks
  - Return early if any dependency is not ready or detectionRunning is true
  - Set detectionRunning ref to true
  - Create detectLoop function with requestAnimationFrame
  - Check video.readyState === HAVE_ENOUGH_DATA before processing
  - Only process if video.currentTime has changed
  - Call faceLandmarker.detectForVideo with video and performance.now()
  - Call processFaceLandmarks with result
  - Catch and log detection errors without crashing
  - Schedule next frame with requestAnimationFrame
  - Cleanup: set detectionRunning to false, cancel animation frame
  - _Properties: P3, P10_
  - _Requirements: 2.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.2_

- [x] 10. Implement calibration functions
  - Create startCalibrateOpen: clear samples, set state to 'open'
  - Create saveCalibrateOpen: check samples not empty, average samples, set eyesOpenEAR, reset state
  - Create startCalibrateClosed: clear samples, set state to 'closed'
  - Create saveCalibrateClosed: check samples not empty, average samples, set eyesClosedEAR, calculate threshold
  - In saveCalibrateClosed, if eyesOpenEAR exists, calculate threshold = eyesOpenEAR * 0.4 + avgClosed * 0.6
  - Set isCalibrated to true when threshold is calculated
  - Log calibration values and threshold
  - Handle empty samples with warning log
  - _Properties: P8, P9_
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 10.3, 10.5_

- [x] 11. Implement utility functions
  - Create resetCounter function that sets blinkCount to 0
  - Create resetCalibration function that resets all calibration state
  - In resetCalibration: set isCalibrated false, state 'none', clear EAR values, reset threshold to 0.18, clear samples, reset blinkCount
  - _Properties: None (utility functions)_
  - _Requirements: 5.9, 7.3_

- [x] 12. Implement hook return value
  - Return all blink data: leftEAR, rightEAR, averageEAR, isBlinking, blinkCount, faceLandmarks
  - Return controls: startTracking, stopTracking, resetCounter
  - Return initialization state: isInitialized, error
  - Return calibration state: isCalibrated, calibrationState, eyesOpenEAR, eyesClosedEAR, earThreshold
  - Return calibration functions: startCalibrateOpen, saveCalibrateOpen, startCalibrateClosed, saveCalibrateClosed, resetCalibration
  - Return webcam: videoRef from webcam.videoRef, isStreaming from webcam.isStreaming
  - _Properties: None (interface)_
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 7.4, 7.5_


- [x] 13. Create BlinkCalibrationModal demo component
  - Rename EyeTrackingModal.tsx to BlinkCalibrationModal.tsx
  - Integrate useBlinkDetector hook
  - Display live webcam video feed
  - Show real-time EAR values (left, right, average, threshold)
  - Display status indicators (MediaPipe, Webcam, Calibration state)
  - Implement blink detection visualization (👁️ BLINK! / 👀 Open)
  - Add blink counter with reset button
  - Create Step 1: Eyes Open calibration UI with start/save buttons
  - Create Step 2: Eyes Closed calibration UI with start/save buttons
  - Show visual feedback for recorded EAR values
  - Display success message when calibration complete
  - Add reset calibration button
  - Add start/stop webcam controls
  - Implement modal open/close state tracking
  - Auto-start webcam only when modal opens
  - Auto-stop webcam when modal closes
  - Update MainMenu.tsx import from EyeTrackingModal to BlinkCalibrationModal
  - Delete old EyeTrackingModal.tsx file
  - Update .kiro/steering/import-aliases.md documentation
  - _Properties: None (demo/UI component)_
  - _Requirements: All (integration and demonstration)_


- [x] 14. Refactor BlinkCalibrationModal into modular component structure
  - Create new directory: app/src/components/modal-blink/
  - Create index.tsx as main export (BlinkCalibrationModal wrapper)
  - Create BlinkCalibrationContent.tsx (hook integration and content)
  - Create BlinkCalibrationStatus.tsx (status display component)
  - Create BlinkCalibrationControls.tsx (calibration step components)
  - Separate concerns: modal wrapper, content, status, controls
  - Update MainMenu.tsx import to use new path
  - Delete old app/src/components/modals/BlinkCalibrationModal.tsx
  - _Properties: None (refactoring task)_
  - _Requirements: Code organization and maintainability_


- [x] 15. Enhance BlinkCalibrationModal with canvas overlay and improved UI
  - Add canvas overlay on video for drawing eye landmarks
  - Draw left and right eye outlines using MediaPipe landmark indices
  - Color eyes based on blink state (red when blinking, green when open)
  - Add calibration status banner (warning when not calibrated, success when calibrated)
  - Improve calibration UI with step indicators (1️⃣/✅ for steps)
  - Add visual EAR progress bars for left, right, and average EAR
  - Show threshold and calibration values in stats
  - Add "How It Works" information panel
  - Improve overall styling to match reference example
  - _Properties: None (UI enhancement)_
  - _Requirements: Better user experience and visual feedback_
