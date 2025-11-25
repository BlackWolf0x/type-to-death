# Blink Detector Hook - Requirements

## Introduction

The blink detector hook provides real-time blink detection functionality using Google MediaPipe's Face Landmark Detection. This hook integrates with the existing `useWebcam` hook to access webcam video streams and processes facial landmarks to detect when a user blinks. The hook is designed to support the core gameplay mechanic of "Type to Death" where monster behavior is triggered by player blinks.

## Context

This feature is part of the "Type to Death" game where:
- A monster teleports closer to the player each time they blink
- Blink detection must be accurate and responsive
- The system uses the player's webcam to track facial movements
- Blink events need to be communicated to other parts of the application (Unity game)

The hook will leverage Google MediaPipe's Face Landmark Detection model, which provides 468 3D facial landmarks including eye landmarks that can be used to calculate Eye Aspect Ratio (EAR) for blink detection.

## Glossary

- **MediaPipe**: Google's open-source framework for building multimodal machine learning pipelines
- **Face Landmark Detection**: MediaPipe solution that detects 468 3D facial landmarks
- **FaceLandmarker**: The MediaPipe class that processes video frames and returns facial landmarks
- **EAR (Eye Aspect Ratio)**: A metric calculated from eye landmark positions to determine if an eye is open or closed, using the formula (vertical1 + vertical2) / (2.0 * horizontal)
- **Blink**: A rapid closing and opening of the eyelids, detected when EAR drops below a threshold for consecutive frames
- **Landmark**: A specific point on the face tracked by MediaPipe (e.g., eye corners, eyelids), identified by numeric indices
- **useWebcam Hook**: Existing custom React hook that manages webcam access and video streaming
- **Calibration**: The process of measuring a user's specific eyes-open and eyes-closed EAR values to calculate a personalized threshold
- **EAR Threshold**: The calculated value (40% open + 60% closed) below which an eye is considered closed
- **Consecutive Frames**: The number of frames an eye must remain closed before registering as a blink (default: 1)
- **Calibration State**: The current calibration phase: 'none', 'open' (collecting open samples), or 'closed' (collecting closed samples)

## Requirements

### Requirement 1: MediaPipe Integration

**User Story:** As a developer, I want to integrate Google MediaPipe Face Landmark Detection, so that I can detect facial landmarks from webcam video frames.

#### Acceptance Criteria

1. WHEN the hook initializes, THE system SHALL load the MediaPipe Face Landmark Detection model using the @mediapipe/tasks-vision package installed via pnpm
2. WHEN the model loads successfully, THE system SHALL create a FaceLandmarker instance configured for VIDEO running mode with GPU delegation
3. THE system SHALL configure the FaceLandmarker to detect 1 face with face blendshapes and transformation matrices disabled
4. WHEN the model fails to load, THE system SHALL set an error state with a descriptive message
5. THE system SHALL set isInitialized to true when the FaceLandmarker is ready

### Requirement 2: Webcam Integration

**User Story:** As a developer, I want the blink detector to internally manage webcam access using the useWebcam hook, so that webcam functionality is encapsulated within the blink detector.

#### Acceptance Criteria

1. THE hook SHALL internally instantiate the useWebcam hook with video constraints (1280x720 ideal resolution, user-facing camera)
2. THE hook SHALL expose a videoRef from the internal useWebcam instance for rendering the video element
3. THE hook SHALL expose an isStreaming state from the internal useWebcam instance
4. THE hook SHALL provide startTracking and stopTracking functions that control the internal webcam
5. WHEN the video stream is not ready, THE system SHALL wait until video.readyState equals HAVE_ENOUGH_DATA before processing frames

### Requirement 3: Eye Aspect Ratio Calculation

**User Story:** As a developer, I want the system to calculate Eye Aspect Ratio (EAR) from facial landmarks, so that eye openness can be quantified.

#### Acceptance Criteria

1. THE system SHALL use MediaPipe face mesh landmark indices for left eye (33, 133, 159, 145, 160, 144) and right eye (362, 263, 386, 374, 385, 380)
2. WHEN facial landmarks are detected, THE system SHALL calculate EAR using the formula: (vertical1 + vertical2) / (2.0 * horizontal)
3. THE system SHALL calculate Euclidean distance in 3D space (x, y, z) for landmark pairs
4. THE system SHALL expose leftEAR, rightEAR, and averageEAR values as state
5. WHEN no face is detected, THE system SHALL set all EAR values to 0

### Requirement 4: Blink Detection Logic

**User Story:** As a developer, I want to detect when a user blinks based on EAR thresholds, so that I can count blinks and trigger game events.

#### Acceptance Criteria

1. WHEN the averageEAR drops below the earThreshold for CONSEC_FRAMES consecutive frames, THE system SHALL set isBlinking to true
2. WHEN isBlinking transitions from false to true, THE system SHALL increment the blinkCount by 1
3. WHEN the averageEAR rises above the earThreshold, THE system SHALL reset the consecutive frame counter and set isBlinking to false
4. THE system SHALL use a default CONSEC_FRAMES value of 1 to catch fast blinks
5. THE system SHALL only perform blink detection when isCalibrated is true

### Requirement 5: Manual Calibration System

**User Story:** As a user, I want to calibrate the blink detector to my specific eye characteristics, so that detection accuracy is optimized for my face.

#### Acceptance Criteria

1. THE hook SHALL provide startCalibrateOpen and saveCalibrateOpen functions for calibrating eyes-open EAR
2. THE hook SHALL provide startCalibrateClosed and saveCalibrateClosed functions for calibrating eyes-closed EAR
3. WHEN startCalibrateOpen is called, THE system SHALL begin collecting averageEAR samples and set calibrationState to 'open'
4. WHEN saveCalibrateOpen is called, THE system SHALL average all collected samples and store as eyesOpenEAR
5. WHEN startCalibrateClosed is called, THE system SHALL begin collecting averageEAR samples and set calibrationState to 'closed'
6. WHEN saveCalibrateClosed is called, THE system SHALL average all collected samples, store as eyesClosedEAR, and calculate the threshold
7. THE system SHALL calculate earThreshold as: eyesOpenEAR * 0.4 + eyesClosedEAR * 0.6
8. WHEN both eyesOpenEAR and eyesClosedEAR are set, THE system SHALL set isCalibrated to true
9. THE hook SHALL provide a resetCalibration function that clears all calibration data and resets blinkCount

### Requirement 6: State Exposure

**User Story:** As a developer, I want access to all relevant blink detection state, so that I can build UI and game logic around the detector.

#### Acceptance Criteria

1. THE hook SHALL expose leftEAR, rightEAR, and averageEAR as numeric state values
2. THE hook SHALL expose isBlinking as a boolean indicating current blink state
3. THE hook SHALL expose blinkCount as a numeric counter of total blinks detected
4. THE hook SHALL expose faceLandmarks as the raw landmark array from MediaPipe (or null if no face detected)
5. THE hook SHALL expose isInitialized as a boolean indicating MediaPipe readiness
6. THE hook SHALL expose error as a string or null for error messages
7. THE hook SHALL expose isStreaming as a boolean indicating webcam stream status
8. THE hook SHALL expose calibration state: isCalibrated, calibrationState, eyesOpenEAR, eyesClosedEAR, earThreshold

### Requirement 7: Detection Control Functions

**User Story:** As a developer, I want functions to control the blink detector lifecycle, so that I can start, stop, and reset detection as needed.

#### Acceptance Criteria

1. THE hook SHALL provide a startTracking async function that starts the internal webcam
2. THE hook SHALL provide a stopTracking function that stops the internal webcam
3. THE hook SHALL provide a resetCounter function that resets blinkCount to 0
4. WHEN startTracking fails, THE system SHALL set the error state and re-throw the error
5. THE hook SHALL expose videoRef for rendering the video element in the UI

### Requirement 8: Real-Time Frame Processing

**User Story:** As a developer, I want continuous frame processing while the webcam is streaming, so that blinks are detected in real-time.

#### Acceptance Criteria

1. WHEN faceLandmarker is initialized and webcam is streaming, THE system SHALL start a requestAnimationFrame loop
2. THE system SHALL call faceLandmarker.detectForVideo with the current video element and performance.now() timestamp
3. THE system SHALL only process frames when video.currentTime has changed since the last frame
4. WHEN the video element is not ready (readyState !== HAVE_ENOUGH_DATA), THE system SHALL skip processing and continue the loop
5. WHEN the detection loop unmounts or dependencies change, THE system SHALL cancel the animation frame
6. THE system SHALL use a detectionRunning ref to prevent multiple concurrent detection loops

### Requirement 9: Error Handling

**User Story:** As a developer, I want comprehensive error handling, so that I can gracefully handle failures and provide user feedback.

#### Acceptance Criteria

1. WHEN MediaPipe initialization fails, THE system SHALL log the error and set the error state
2. WHEN face detection fails on a frame, THE system SHALL log the error to console but continue processing subsequent frames
3. WHEN startTracking fails, THE system SHALL set the error state with the failure message
4. THE system SHALL handle missing facial landmarks gracefully by setting EAR values to 0
5. WHEN calibration is attempted with no samples collected, THE system SHALL log a warning and return early

### Requirement 10: Calibration Sample Collection

**User Story:** As a developer, I want the system to collect multiple EAR samples during calibration, so that calibration values are accurate and stable.

#### Acceptance Criteria

1. WHEN calibrationState is 'open' or 'closed', THE system SHALL collect averageEAR samples into calibrationSamplesRef
2. THE system SHALL log each collected sample with the calibration state and total sample count
3. WHEN saveCalibrateOpen or saveCalibrateClosed is called with no samples, THE system SHALL log a warning and return without saving
4. WHEN saving calibration values, THE system SHALL average all collected samples
5. WHEN saving calibration values, THE system SHALL clear calibrationSamplesRef and set calibrationState to 'none'

## Non-Functional Requirements

### NFR1: Performance
- Frame processing should not block the main thread
- Detection latency should be under 100ms from blink to callback invocation
- Memory usage should remain stable during extended detection sessions
- CPU usage should be reasonable for real-time gameplay

### NFR2: Accuracy
- Blink detection should have minimal false positives (< 5% under normal conditions)
- Blink detection should have minimal false negatives (< 10% under normal conditions)
- Detection should work across different lighting conditions
- Detection should work with various face angles (within MediaPipe's capabilities)

### NFR3: Browser Compatibility
- Must work in modern browsers that support MediaPipe (Chrome, Edge, Firefox, Safari)
- Must handle browsers without WebGL support gracefully
- Must work with the existing useWebcam hook's browser requirements

### NFR4: Developer Experience
- Hook API should follow React hooks conventions
- Hook should be easy to integrate with minimal configuration
- Error messages should be clear and actionable
- TypeScript types should be comprehensive and accurate

## Constraints

- Must use Google MediaPipe Face Landmark Detection (no alternative face detection libraries)
- Must integrate with the existing useWebcam hook (cannot create a separate webcam implementation)
- Must work in browser environment (WebGL required for MediaPipe GPU acceleration)
- Must not require server-side processing (all detection happens client-side)
- Must be implemented as a React custom hook
- MediaPipe package must be installed via pnpm as @mediapipe/tasks-vision
- Must load WASM files from CDN (https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm)
- Must load model file from Google Storage (https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task)

## Dependencies

- **@mediapipe/tasks-vision**: NPM package for MediaPipe Face Landmark Detection (installed via pnpm)
- **useWebcam Hook**: Existing hook for webcam access and video streaming
- **React**: Hook lifecycle and state management
- **TypeScript**: Type definitions and interfaces
- **Browser APIs**: requestAnimationFrame, video element APIs, WebGL (for GPU acceleration)

## Success Metrics

- Blink detection works reliably during gameplay
- No noticeable performance impact on game rendering
- Integration with Unity game events is seamless
- Developers can integrate the hook with minimal code
- Error states are handled gracefully with clear user feedback
- Detection accuracy meets gameplay requirements (players feel the mechanic is fair)

## Out of Scope

- Eye gaze tracking (only blink detection)
- Facial expression recognition beyond blinks
- Multiple face detection (only single user)
- Recording or storing video data
- Custom machine learning model training
- Offline model support (requires internet for WASM and model file CDN)
- Mobile device optimization (focus on desktop browsers first)
- Automatic calibration (manual calibration only)
- Calibration UI components (hook provides functions, UI is separate)
- Persistence of calibration values across sessions
- Advanced blink statistics or analytics
- Integration with Unity (handled separately by game component)
- Callback functions for blink events (consumers can watch blinkCount state changes)
