# Webcam Error Codes

## Overview

This document provides a reference for all error codes used in the `useWebcam` hook. Error codes enable precise error handling without relying on string matching.

**Last Updated:** November 27, 2025

---

## Error Structure

```typescript
interface WebcamError {
    code: WebcamErrorCode;
    message: string;
    originalError?: Error;
}
```

**Usage Example:**

```typescript
const { error, start, clearError } = useWebcam();

if (error) {
    switch (error.code) {
        case WebcamErrorCode.PERMISSION_DENIED:
            showPermissionInstructions();
            break;
        case WebcamErrorCode.DEVICE_NOT_FOUND:
            showConnectCameraMessage();
            break;
        case WebcamErrorCode.DEVICE_IN_USE:
            showCloseOtherAppsMessage();
            break;
    }
}
```

---

## Error Codes Reference

### Browser/Environment Errors

#### `WEBCAM_API_NOT_SUPPORTED`

**When it occurs:** Browser doesn't support MediaDevices API

**Common causes:**
- Very old browser version
- Browser without WebRTC support
- Unsupported browser (IE, old mobile browsers)

**User-facing message:**
> "Your browser does not support camera access. Please use a modern browser."

**Recommended action:**
- Update to latest browser version
- Use Chrome, Firefox, Edge, or Safari

---

#### `WEBCAM_REQUIRES_HTTPS`

**When it occurs:** Attempting to access camera over insecure HTTP connection

**Common causes:**
- Accessing via `http://` instead of `https://`
- Not using localhost for development

**User-facing message:**
> "Camera access requires HTTPS or localhost."

**Recommended action:**
- Access via HTTPS
- For development, use `http://localhost:PORT`

---

### Permission Errors

#### `WEBCAM_PERMISSION_DENIED`

**When it occurs:** User denied camera permission or browser blocked access

**Common causes:**
- User clicked "Block" on permission prompt
- Browser settings have camera disabled
- System-level camera permissions denied

**User-facing message:**
> "Camera permission was denied. Please allow camera access in your browser settings."

**Recommended action:**
1. Click the camera/lock icon in browser's address bar
2. Change camera permission to "Allow"
3. Refresh the page

---

#### `WEBCAM_PERMISSION_DISMISSED`

**When it occurs:** User dismissed the permission prompt without making a choice

**User-facing message:**
> "Camera permission prompt was dismissed. Please try again."

---

### Device Errors

#### `WEBCAM_DEVICE_NOT_FOUND`

**When it occurs:** No camera device detected on the system

**Common causes:**
- No physical camera connected
- Camera drivers not installed
- Camera disabled in device manager

**User-facing message:**
> "No camera device was found. Please connect a camera and try again."

**Recommended action:**
- Ensure camera is properly connected
- Check device manager for camera
- Update camera drivers

---

#### `WEBCAM_DEVICE_IN_USE`

**When it occurs:** Camera is being used by another application

**Common causes:**
- Zoom, Teams, or other video apps running
- Another browser tab using the camera
- System camera app open

**User-facing message:**
> "Camera is in use by another application. Please close other apps using the camera."

**Recommended action:**
- Close other video applications
- Close other browser tabs using camera
- Restart browser

---

#### `WEBCAM_DEVICE_ENUMERATION_FAILED`

**When it occurs:** Failed to list available camera devices

**User-facing message:**
> "Failed to list available cameras"

---

### Constraint Errors

#### `WEBCAM_CONSTRAINTS_NOT_SUPPORTED`

**When it occurs:** Camera doesn't support the requested video constraints

**Common causes:**
- Requested resolution not supported
- Camera doesn't support user-facing mode
- Outdated camera drivers

**User-facing message:**
> "Camera does not support the requested settings. Try a different camera."

---

### Stream Errors

#### `WEBCAM_STREAM_START_FAILED`

**When it occurs:** Generic failure to start camera stream

**User-facing message:**
> "Failed to start camera stream"

---

#### `WEBCAM_STREAM_INTERRUPTED`

**When it occurs:** Camera stream was interrupted after starting

**Common causes:**
- Camera was physically disconnected
- System went to sleep
- Another app took control of camera

**User-facing message:**
> "Camera was disconnected"

---

#### `WEBCAM_UNKNOWN`

**When it occurs:** Catch-all for unrecognized errors

**User-facing message:**
> "An unknown error occurred"

---

## Quick Reference Table

| Error Code | Category | Severity | Can Retry |
|------------|----------|----------|-----------|
| `WEBCAM_API_NOT_SUPPORTED` | Environment | High | No* |
| `WEBCAM_REQUIRES_HTTPS` | Environment | High | No* |
| `WEBCAM_PERMISSION_DENIED` | Permission | High | Yes |
| `WEBCAM_PERMISSION_DISMISSED` | Permission | Medium | Yes |
| `WEBCAM_DEVICE_NOT_FOUND` | Device | High | Yes |
| `WEBCAM_DEVICE_IN_USE` | Device | Medium | Yes |
| `WEBCAM_DEVICE_ENUMERATION_FAILED` | Device | Low | Yes |
| `WEBCAM_CONSTRAINTS_NOT_SUPPORTED` | Constraint | Medium | Yes |
| `WEBCAM_STREAM_START_FAILED` | Stream | High | Yes |
| `WEBCAM_STREAM_INTERRUPTED` | Stream | Medium | Yes |
| `WEBCAM_UNKNOWN` | Unknown | Medium | Yes |

*Requires environment change (HTTPS setup or browser upgrade)

---

## Frontend Implementation Example

```typescript
import { useWebcam, WebcamErrorCode } from '@/hooks/useWebcam';

function CameraSetup() {
    const { error, start, isLoading, isStreaming, videoRef } = useWebcam();

    const getErrorUI = () => {
        if (!error) return null;

        switch (error.code) {
            case WebcamErrorCode.PERMISSION_DENIED:
                return (
                    <div className="error-panel">
                        <h3>Camera Permission Required</h3>
                        <p>Click the camera icon in your browser's address bar and allow access.</p>
                        <button onClick={start}>Try Again</button>
                    </div>
                );

            case WebcamErrorCode.DEVICE_NOT_FOUND:
                return (
                    <div className="error-panel">
                        <h3>No Camera Found</h3>
                        <p>Please connect a camera and try again.</p>
                        <button onClick={start}>Retry</button>
                    </div>
                );

            case WebcamErrorCode.DEVICE_IN_USE:
                return (
                    <div className="error-panel">
                        <h3>Camera In Use</h3>
                        <p>Close other apps using your camera (Zoom, Teams, etc.)</p>
                        <button onClick={start}>Try Again</button>
                    </div>
                );

            default:
                return (
                    <div className="error-panel">
                        <h3>Camera Error</h3>
                        <p>{error.message}</p>
                        <button onClick={start}>Retry</button>
                    </div>
                );
        }
    };

    return (
        <div>
            <video ref={videoRef} autoPlay playsInline muted />
            {error && getErrorUI()}
            {!isStreaming && !error && (
                <button onClick={start} disabled={isLoading}>
                    {isLoading ? 'Starting...' : 'Start Camera'}
                </button>
            )}
        </div>
    );
}
```

---

## Related Documentation

- [useWebcam Hook](../app-next/hooks/useWebcam.ts)
- [Blink Detector Error Codes](./blink-detector-error-codes.md)
