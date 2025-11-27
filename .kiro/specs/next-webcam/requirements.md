# Next.js Webcam Integration - Requirements

## Introduction

This spec defines the requirements for integrating webcam functionality into the Next.js application using the useWebcam hook. The integration will provide visual feedback for permission requests, error states, and successful webcam streaming across the application's pages.

## Context

The project has a custom `useWebcam` hook already implemented in `app-next/hooks/useWebcam.ts` that handles webcam access, permissions, device enumeration, and error handling. This spec focuses on integrating this hook into the Next.js pages to provide a complete user experience for webcam setup and usage.

The webcam is a critical component for the Type to Death game, as it enables blink detection through Google MediaPipe. Users must grant camera permissions and successfully initialize the webcam before they can play the game.

## Glossary

- **Webcam Hook**: The `useWebcam` custom React hook that manages webcam state and controls
- **Permission State**: The browser's camera permission status (granted, denied, or prompt)
- **Video Stream**: The MediaStream object containing video data from the webcam
- **Device Enumeration**: The process of listing available video input devices
- **Permission Page**: The `/permission` route where users grant webcam access
- **Calibration Page**: The `/calibration` route where users calibrate blink detection
- **Play Page**: The `/play` route where the game is actively played

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

1. WHEN the webcam permission is granted and streaming THEN the Permission Page SHALL provide a "Continue" button
2. WHEN a user clicks "Continue" after successful webcam setup THEN the application SHALL navigate to `/calibration`

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

## Out of Scope

- Blink detection implementation (separate spec)
- MediaPipe integration (separate spec)
- Webcam device selection UI (can use default device for MVP)
- Webcam settings (resolution, frame rate, etc.)
- Recording or capturing webcam frames
- Multiple camera support (use default camera for MVP)
- Webcam stream optimization or compression
- Analytics or telemetry for webcam usage
- Offline mode or fallback without webcam
