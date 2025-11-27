# Next.js Webcam Integration - Implementation Plan

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
  - Alert, Button, Card components already installed
  - Located in `app-next/components/ui/`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 4. Implement Permission Page component
  - Created client component at `app-next/app/permission/page.tsx`
  - Imported useWebcam hook with WebcamErrorCode enum
  - Set up page layout with Card container
  - Added page title, description, and privacy note
  - Implemented `getErrorUI()` function mapping all WebcamErrorCode values
  - Added "Grant Camera Access" button connected to start()
  - Added loading state with Loader2 spinner and message
  - Added video preview with videoRef and live indicator
  - Added camera selector dropdown for multiple devices
  - Added "Continue to Calibration" button with router navigation
  - Added "Try Again" button for recoverable errors
  - Added "Stop Camera" button to stop stream
  - Added success Alert with CheckCircle2 icon
  - _Properties: P1, P2, P3, P4, P5_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2_
