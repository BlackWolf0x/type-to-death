# Next.js Webcam & Blink Detection Integration - Requirements

## Introduction

This spec defines the requirements for integrating webcam functionality and blink detection into the Next.js application. The integration provides visual feedback for permission requests, error states, webcam streaming, and blink calibration across the application's pages.

## Context

The project has custom hooks implemented:
- `useWebcam` hook in `app-next/hooks/useWebcam.ts` - handles webcam access, permissions, device enumeration, and error handling
- `useBlinkDetector` hook in `app-next/hooks/useBlinkDetector.ts` - handles MediaPipe face detection, EAR calculation, and blink detection with auto-calibration

The webcam and blink detection are critical components for the Type to Death game. Users must grant camera permissions, calibrate blink detection, and successfully initialize both systems before they can play the game.

## Glossary

- **Webcam Hook**: The `useWebcam` custom React hook that manages webcam state and controls
- **Blink Detector Hook**: The `useBlinkDetector` custom React hook that manages MediaPipe face detection and blink detection
- **Permission State**: The browser's camera permission status (granted, denied, or prompt)
- **Video Stream**: The MediaStream object containing video data from the webcam
- **Device Enumeration**: The process of listing available video input devices
- **EAR (Eye Aspect Ratio)**: A metric calculated from eye landmarks to detect blinks
- **Manual Calibration**: Two-step process where user records eyes-open and eyes-closed EAR values
- **Calibration Page**: The `/calibration` route where users grant webcam access and calibrate blink detection
- **Play Page**: The `/play` route where the game is actively played
- **localStorage**: Browser storage API used to persist calibration data between sessions

## Requirements

### Requirement 1: Permission Request Page

**User Story:** As a user, I want to be prompted to grant webcam access on a dedicated page, so that I understand why camera access is needed and can grant permission in a clear context.

#### Acceptance Criteria

1. WHEN a user navigates to `/permission` THEN the Permission Page SHALL display a clear explanation of why webcam access is required
2. WHEN a user navigates to `/permission` THEN the Permission Page SHALL display a button to request webcam access
3. WHEN a user clicks the request access button THEN the Permission Page SHALL call the useWebcam hook's start() method
4. WHEN the webcam permission is granted THEN the Permission Page SHALL display a success message with the video preview
5. WHEN the webcam permission is denied THEN the Permission Page SHALL display an error message explaining how to grant permission manually

### Requirement 2: Error State Handling

**User Story:** As a user, I want to see clear error messages when webcam access fails, so that I can understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN the webcam hook returns an error THEN the Permission Page SHALL display the error message visually
2. WHEN the error is "Camera permission denied" THEN the Permission Page SHALL display instructions for granting permission in the browser
3. WHEN the error is "No camera found" THEN the Permission Page SHALL display a message indicating no camera is available
4. WHEN the error is "Camera constraints not supported" THEN the Permission Page SHALL display a message about browser compatibility
5. WHEN the error is "MediaDevices API not supported" THEN the Permission Page SHALL display a message about browser compatibility
6. WHEN the error is "Camera access requires HTTPS or localhost" THEN the Permission Page SHALL display a message about secure context requirements

### Requirement 3: Loading State Feedback

**User Story:** As a user, I want to see loading indicators when the webcam is initializing, so that I know the system is working and not frozen.

#### Acceptance Criteria

1. WHEN the useWebcam hook's isLoading state is true THEN the Permission Page SHALL display a loading spinner or indicator
2. WHEN the useWebcam hook's isLoading state is true THEN the Permission Page SHALL disable the request access button
3. WHEN the webcam starts successfully THEN the Permission Page SHALL hide the loading indicator
4. WHEN the webcam fails to start THEN the Permission Page SHALL hide the loading indicator and show the error

### Requirement 4: Video Preview Display

**User Story:** As a user, I want to see a preview of my webcam feed after granting permission, so that I can verify the camera is working correctly.

#### Acceptance Criteria

1. WHEN the webcam is streaming THEN the Permission Page SHALL display a video element showing the webcam feed
2. WHEN the webcam is streaming THEN the video element SHALL use the webcamRef from the useWebcam hook
3. WHEN the webcam is streaming THEN the video element SHALL have appropriate styling and dimensions
4. WHEN the webcam is not streaming THEN the video element SHALL be hidden or not rendered
5. WHEN the webcam is streaming THEN the Permission Page SHALL display a "Continue" button to proceed to calibration

### Requirement 5: Navigation Flow

**User Story:** As a user, I want to be guided through the webcam setup process with clear navigation, so that I can complete the setup and proceed to the next step.

#### Acceptance Criteria

1. WHEN the webcam permission is granted and streaming THEN the Calibration Page SHALL automatically advance to calibration
2. WHEN calibration is complete THEN the Calibration Page SHALL display a "Start Game" button
3. WHEN a user navigates to /play without calibration data THEN the system SHALL redirect to /calibration
4. WHEN a user navigates to /play without camera permission THEN the system SHALL redirect to /calibration
5. WHEN a user navigates to /play with valid calibration and permission THEN the system SHALL start the webcam and load the game

### Requirement 6: Blink Detection Calibration

**User Story:** As a user, I want to calibrate blink detection for my eyes, so that the game can accurately detect when I blink.

#### Acceptance Criteria

1. WHEN the user starts eyes-open calibration THEN the system SHALL collect EAR samples while recording
2. WHEN the user clicks "Save" for eyes-open THEN the system SHALL store the average EAR value
3. WHEN the user starts eyes-closed calibration THEN the system SHALL collect EAR samples while recording
4. WHEN the user clicks "Save" for eyes-closed THEN the system SHALL calculate threshold as (eyesOpenEAR * 0.4 + eyesClosedEAR * 0.6)
5. WHEN both calibration steps complete THEN the system SHALL mark calibration as complete AND save calibration data to localStorage
6. WHEN the user wants to recalibrate THEN the Calibration Page SHALL provide a "Start Over" button

### Requirement 8: Calibration Persistence

**User Story:** As a returning user, I want my calibration data to be saved, so that I don't have to recalibrate every time I play.

#### Acceptance Criteria

1. WHEN calibration completes THEN the system SHALL save eyesOpenEAR, eyesClosedEAR, and threshold to localStorage
2. WHEN the page loads THEN the system SHALL restore calibration data from localStorage if available
3. WHEN calibration data exists in localStorage THEN the Calibration Page SHALL skip directly to the ready state
4. WHEN the user clicks "Start Over" THEN the system SHALL clear calibration data from localStorage

### Requirement 7: Real-time Blink Feedback

**User Story:** As a user, I want to see visual feedback when I blink, so that I can verify the blink detection is working correctly.

#### Acceptance Criteria

1. WHEN blink detection is active THEN the Calibration Page SHALL display eye landmark overlays on the video
2. WHEN a blink is detected THEN the eye overlays SHALL change color (green to red)
3. WHEN blink detection is active THEN the Calibration Page SHALL display a blink counter
4. WHEN the user blinks THEN the blink counter SHALL increment

### Requirement 9: Play Page Webcam Integration

**User Story:** As a player, I want the game to automatically check my webcam and calibration before loading, so that I don't encounter errors during gameplay.

#### Acceptance Criteria

1. WHEN the Play Page loads THEN the system SHALL check for stored calibration data in localStorage
2. WHEN calibration data is missing THEN the Play Page SHALL redirect to /calibration without prompting for camera access
3. WHEN calibration data exists THEN the system SHALL check camera permission without prompting
4. WHEN camera permission is not granted THEN the Play Page SHALL redirect to /calibration
5. WHEN both calibration and permission are valid THEN the Play Page SHALL start the webcam and load Unity
6. WHEN the webcam fails to start THEN the Play Page SHALL redirect to /calibration
7. WHEN Unity is loading THEN the Play Page SHALL display a loading indicator
8. WHEN all checks pass THEN the Play Page SHALL display blink detection feedback during gameplay
9. WHEN the game has not started THEN the blink counter SHALL display an infinity symbol (∞)
10. WHEN the game starts THEN the blink counter SHALL reset to 0
11. WHEN the game has not started THEN blink events SHALL NOT be sent to Unity
12. WHEN the game starts THEN blink events SHALL be sent to Unity for each detected blink

## Non-Functional Requirements

### NFR1: User Experience
The webcam integration SHALL provide clear, user-friendly feedback at every stage of the permission and setup process.

### NFR2: Performance
The webcam video preview SHALL render smoothly without impacting page performance or causing layout shifts.

### NFR3: Accessibility
All webcam-related UI elements SHALL be keyboard accessible and provide appropriate ARIA labels for screen readers.

### NFR4: Browser Compatibility
The webcam integration SHALL work on all modern browsers that support the MediaDevices API (Chrome, Firefox, Safari, Edge).

### NFR5: Security
The webcam integration SHALL only work in secure contexts (HTTPS or localhost) as required by browser security policies.

## Constraints

- Must use the existing `useWebcam` hook from `app-next/hooks/useWebcam.ts`
- Must use Next.js 16 App Router for page components
- Must use shadcn/ui components for UI elements (Button, etc.)
- Must follow the established import alias pattern (`@/`)
- Must maintain consistency with existing project styling and conventions
- Must work with Bun as the package manager

## Dependencies

- `useWebcam` hook (already implemented)
- Next.js 16 App Router
- shadcn/ui components (Button, potentially Alert, Card, etc.)
- React 19
- TypeScript
- Tailwind CSS v4

## Success Metrics

- Users can successfully grant webcam permission on the Permission Page
- Error messages are clear and actionable
- Loading states provide appropriate feedback
- Video preview displays correctly when webcam is streaming
- Navigation flow guides users through the setup process
- Webcam stream persists across page navigation
- All pages handle webcam errors gracefully

### Requirement 10: Horror-Themed Visual Styling

**User Story:** As a player, I want the calibration page to have a horror-themed aesthetic, so that I feel immersed in the game's atmosphere before gameplay begins.

#### Acceptance Criteria

1. WHEN the calibration page loads THEN the system SHALL display a background image with horror theme
2. WHEN the user blinks during the ready state THEN the system SHALL cycle through horror-themed background images
3. WHEN the calibration page is visible THEN the system SHALL display a film grain overlay effect
4. WHEN the webcam is not streaming THEN the calibration card SHALL display a shake animation
5. WHEN the calibration card is rendered THEN the system SHALL display red corner brackets for visual emphasis
6. WHEN the calibration card is rendered THEN the system SHALL display a subtle red rain animation effect

### Requirement 11: Background Segmentation and Visual Effects

**User Story:** As a player, I want the webcam video to have atmospheric visual effects that separate me from the background, so that the calibration experience feels more immersive and horror-themed.

#### Acceptance Criteria

1. WHEN the calibration page displays webcam video THEN the system SHALL initialize MediaPipe Image Segmenter for person detection
2. WHEN the video is processing THEN the system SHALL segment the person from the background using confidence masks
3. WHEN background segmentation is active THEN the system SHALL darken the background while keeping the person at full brightness
4. WHEN VHS effects are enabled THEN the system SHALL apply chromatic aberration and random noise to the video
5. WHEN processing video frames THEN the system SHALL throttle to 30fps to maintain performance and prevent CPU/memory issues

### Requirement 12: Demon Face Overlay Features

**User Story:** As a player, I want to see demon features overlaid on my face during gameplay, so that I feel transformed into a demon character and immersed in the horror theme.

#### Acceptance Criteria

1. WHEN face landmarks are detected THEN the system SHALL draw demon horns on the forehead using forehead landmark positions
2. WHEN the mouth is open THEN the system SHALL draw demon teeth and fangs that follow the curved shape of the mouth
3. WHEN face overlay features are rendered THEN the system SHALL provide a reusable hook that can be used across multiple components

### Requirement 13: Face Detection Warning During Gameplay

**User Story:** As a player, I want to be warned when my face is not detected during gameplay, so that I cannot cheat by hiding my face from the camera and I am redirected to recalibrate if I don't fix the issue.

#### Acceptance Criteria

1. WHEN the webcam is active during gameplay AND no face is detected THEN the system SHALL display a warning notice in the center of the screen
2. WHEN no face is detected THEN the warning notice SHALL display a countdown timer starting from 20 seconds
3. WHEN the countdown reaches zero AND face is still not detected THEN the system SHALL redirect the user to the /calibration page
4. WHEN face detection resumes before the countdown reaches zero THEN the system SHALL cancel the countdown and hide the warning notice
5. WHEN the warning notice is displayed THEN the system SHALL show a clear message explaining that face detection is required
6. WHEN the countdown is active THEN the system SHALL update the countdown display every second

## Out of Scope

- Webcam device selection UI (can use default device for MVP)
- Webcam settings (resolution, frame rate, etc.)
- Recording or capturing webcam frames
- Multiple camera support (use default camera for MVP)
- Webcam stream optimization or compression
- Analytics or telemetry for webcam usage
- Offline mode or fallback without webcam
- Cloud-based calibration sync across devices
