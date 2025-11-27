# Blink Detector Error Codes

## Overview

This document provides a comprehensive reference for all error codes used in the blink detection system (`useBlinkDetector` hook). Error codes enable precise error handling without relying on string matching.

**Last Updated:** November 27, 2025

---

## Error Structure

All errors from `useBlinkDetector` follow this structure:

```typescript
interface BlinkDetectorError {
    code: BlinkDetectorErrorCode;
    message: string;
    originalError?: Error;
}
```

**Usage Example:**

```typescript
const { error } = useBlinkDetector();

if (error) {
    switch (error.code) {
        case BlinkDetectorErrorCode.CAMERA_PERMISSION_DENIED:
            // Handle permission denied
            break;
        case BlinkDetectorErrorCode.MEDIAPIPE_INIT_FAILED:
            // Handle initialization failure
            break;
        // ... other cases
    }
}
```

---

## Error Categories

### MediaPipe Initialization Errors

These errors occur during the initialization of the MediaPipe Face Landmark Detection system.

#### `MEDIAPIPE_INIT_FAILED`

**When it occurs:** General MediaPipe initialization failure

**Common causes:**
- Network connectivity issues
- Browser compatibility problems
- CDN unavailable
- WebGL not supported

**User-facing message:**
> "Failed to Load Detection System - The blink detection system failed to initialize."

**Recommended action:**
- Check internet connection
- Try a different browser (Chrome recommended)
- Disable ad blockers or security extensions
- Ensure WebGL is enabled

---

#### `MEDIAPIPE_WASM_LOAD_FAILED`

**When it occurs:** Failed to load MediaPipe WASM runtime from CDN

**Common causes:**
- CDN (jsdelivr.net) is blocked or unavailable
- Network firewall blocking WASM files
- Ad blocker interfering with CDN requests

**User-facing message:**
> "Failed to Load Detection System - WASM runtime could not be loaded."

**Recommended action:**
- Check if jsdelivr.net is accessible
- Temporarily disable ad blockers
- Check network firewall settings
- Try a different network

**Technical details:**
- WASM URL: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm`

---

#### `MEDIAPIPE_MODEL_LOAD_FAILED`

**When it occurs:** Failed to load the face landmark detection model

**Common causes:**
- Google Storage (googleapis.com) is blocked
- Model file download interrupted
- Insufficient bandwidth

**User-facing message:**
> "Failed to Load Detection System - Face detection model could not be loaded."

**Recommended action:**
- Check if storage.googleapis.com is accessible
- Ensure stable internet connection
- Try refreshing the page
- Check network firewall settings

**Technical details:**
- Model URL: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`
- Model size: ~10MB

---

### Camera Access Errors

These errors occur when attempting to access the user's webcam.

#### `CAMERA_PERMISSION_DENIED`

**When it occurs:** User denied camera permission or browser blocked access

**Common causes:**
- User clicked "Block" on permission prompt
- Browser settings have camera disabled
- System-level camera permissions denied

**User-facing message:**
> "Camera Permission Denied - Camera access was blocked."

**Recommended action:**
1. Click the 🔒 or 🎥 icon in browser's address bar
2. Change camera permission to "Allow"
3. Refresh the page or click "Try Again"

**Browser-specific instructions:**

**Chrome/Edge:**
- Click the camera icon in the address bar
- Select "Always allow" and click "Done"

**Firefox:**
- Click the camera icon in the address bar
- Select "Allow" from the dropdown

**Safari:**
- Go to Safari → Settings → Websites → Camera
- Find the website and select "Allow"

---

#### `CAMERA_NOT_FOUND`

**When it occurs:** No camera device detected on the system

**Common causes:**
- No physical camera connected
- Camera drivers not installed
- Camera disabled in device manager
- Another application is using the camera exclusively

**User-facing message:**
> "No Camera Found - No camera device was detected on your system."

**Recommended action:**
- Ensure camera is properly connected (for external cameras)
- Check if camera is enabled in device manager
- Close other applications using the camera (Zoom, Teams, etc.)
- Restart the browser
- Update camera drivers

---

#### `CAMERA_REQUIRES_HTTPS`

**When it occurs:** Attempting to access camera over insecure HTTP connection

**Common causes:**
- Accessing the application via `http://` instead of `https://`
- Not using localhost for development

**User-facing message:**
> "Secure Connection Required - Camera access requires HTTPS or localhost."

**Recommended action:**
- Access via HTTPS: `https://yourdomain.com`
- For development, use: `http://localhost:PORT`
- Configure SSL certificate for local development

**Technical details:**
- Modern browsers require secure context for `getUserMedia()`
- Exceptions: `localhost`, `127.0.0.1`, `::1`

---

#### `CAMERA_API_NOT_SUPPORTED`

**When it occurs:** Browser doesn't support MediaDevices API

**Common causes:**
- Very old browser version
- Browser without WebRTC support
- Unsupported browser (IE, old mobile browsers)

**User-facing message:**
> "Browser Not Supported - Your browser doesn't support camera access."

**Recommended action:**
- Update to latest browser version
- Use a modern browser:
  - Chrome (recommended)
  - Firefox
  - Edge
  - Safari

**Minimum browser versions:**
- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 79+

---

#### `CAMERA_CONSTRAINTS_NOT_SUPPORTED`

**When it occurs:** Camera doesn't support the requested video constraints

**Common causes:**
- Requested resolution not supported (1280x720)
- Camera doesn't support user-facing mode
- Outdated camera drivers

**User-facing message:**
> "Camera Settings Not Supported - Your camera doesn't support the required settings."

**Recommended action:**
- Try a different camera
- Update camera drivers
- Use a more modern webcam

**Technical details:**
- Requested constraints: 1280x720, user-facing camera
- Fallback: System will attempt lower resolutions

---

#### `CAMERA_ACCESS_FAILED`

**When it occurs:** Generic camera access failure (catch-all)

**Common causes:**
- Unknown camera error
- System-level restrictions
- Hardware malfunction

**User-facing message:**
> "Failed to start tracking - Camera access failed."

**Recommended action:**
- Restart the browser
- Check system camera settings
- Try a different camera
- Restart the computer

---

### Calibration Errors

These errors occur during the calibration process.

#### `CALIBRATION_NO_SAMPLES`

**When it occurs:** User attempts to save calibration without collecting samples

**Common causes:**
- Clicking "Save" immediately after "Start"
- No face detected during calibration
- Camera not streaming during calibration

**User-facing message:**
> "No calibration samples collected for eyes [open/closed] state"

**Recommended action:**
- Ensure face is visible to camera
- Wait 2-3 seconds before clicking "Save"
- Keep eyes in the correct state (open or closed)
- Ensure good lighting

**Technical details:**
- Samples are collected every frame during calibration
- Minimum recommended: 30-60 samples (1-2 seconds)

---

### Detection Errors

#### `DETECTION_FAILED`

**When it occurs:** Face detection fails on a single frame

**Common causes:**
- Temporary processing error
- Face moved out of frame
- Poor lighting conditions

**User-facing message:**
> "Detection error" (logged to console, doesn't stop detection)

**Recommended action:**
- No user action needed (detection continues)
- Ensure face remains visible
- Improve lighting conditions

**Technical details:**
- This error is logged but doesn't stop the detection loop
- Detection automatically continues on next frame

---

## Error Handling Best Practices

### 1. Check Error Code, Not Message

```typescript
// ✅ Correct - Use error code
if (error?.code === BlinkDetectorErrorCode.CAMERA_PERMISSION_DENIED) {
    showPermissionInstructions();
}

// ❌ Wrong - String matching
if (error?.message.includes('permission')) {
    showPermissionInstructions();
}
```

### 2. Provide Specific User Guidance

```typescript
const getErrorGuidance = (error: BlinkDetectorError) => {
    switch (error.code) {
        case BlinkDetectorErrorCode.CAMERA_PERMISSION_DENIED:
            return {
                title: "Camera Permission Denied",
                instructions: [
                    "Click the camera icon in your browser's address bar",
                    "Select 'Allow' for camera access",
                    "Click 'Try Again' below"
                ],
                canRetry: true
            };
        // ... other cases
    }
};
```

### 3. Log Original Error for Debugging

```typescript
if (error) {
    console.error(`Blink Detector Error [${error.code}]:`, error.message);
    if (error.originalError) {
        console.error('Original error:', error.originalError);
    }
}
```

### 4. Categorize Errors for Analytics

```typescript
const getErrorCategory = (code: BlinkDetectorErrorCode): string => {
    if (code.startsWith('MEDIAPIPE_')) return 'initialization';
    if (code.startsWith('CAMERA_')) return 'camera';
    if (code.startsWith('CALIBRATION_')) return 'calibration';
    return 'unknown';
};

// Track in analytics
analytics.track('blink_detector_error', {
    code: error.code,
    category: getErrorCategory(error.code),
    message: error.message
});
```

---

## Error Recovery Strategies

### Automatic Recovery

Some errors can be automatically recovered:

```typescript
const { error, startTracking } = useBlinkDetector();

useEffect(() => {
    if (error?.code === BlinkDetectorErrorCode.DETECTION_FAILED) {
        // Detection continues automatically, no action needed
        console.log('Temporary detection error, continuing...');
    }
}, [error]);
```

### User-Initiated Recovery

Most errors require user action:

```typescript
const handleRetry = async () => {
    try {
        await startTracking();
    } catch (err) {
        // Error will be set in hook state
        console.error('Retry failed:', err);
    }
};
```

### Graceful Degradation

For non-critical errors:

```typescript
if (error?.code === BlinkDetectorErrorCode.CALIBRATION_NO_SAMPLES) {
    // Use default threshold instead of calibrated
    console.warn('Using default threshold, calibration failed');
}
```

---

## Testing Error Scenarios

### Simulating Errors in Development

```typescript
// In useBlinkDetector.ts (development only)
if (import.meta.env.DEV && window.simulateError) {
    setError({
        code: window.simulateError,
        message: 'Simulated error for testing'
    });
}

// In browser console:
window.simulateError = BlinkDetectorErrorCode.CAMERA_PERMISSION_DENIED;
```

### Manual Testing Checklist

- [ ] Block camera permission → `CAMERA_PERMISSION_DENIED`
- [ ] Disconnect camera → `CAMERA_NOT_FOUND`
- [ ] Use HTTP (not localhost) → `CAMERA_REQUIRES_HTTPS`
- [ ] Block CDN in network tab → `MEDIAPIPE_WASM_LOAD_FAILED`
- [ ] Click save immediately → `CALIBRATION_NO_SAMPLES`
- [ ] Use old browser → `CAMERA_API_NOT_SUPPORTED`

---

## Quick Reference Table

| Error Code | Category | Severity | User Action Required | Can Retry |
|------------|----------|----------|---------------------|-----------|
| `MEDIAPIPE_INIT_FAILED` | Init | High | Yes | Yes |
| `MEDIAPIPE_WASM_LOAD_FAILED` | Init | High | Yes | Yes |
| `MEDIAPIPE_MODEL_LOAD_FAILED` | Init | High | Yes | Yes |
| `CAMERA_PERMISSION_DENIED` | Camera | High | Yes | Yes |
| `CAMERA_NOT_FOUND` | Camera | High | Yes | Yes |
| `CAMERA_REQUIRES_HTTPS` | Camera | High | Yes | No* |
| `CAMERA_API_NOT_SUPPORTED` | Camera | High | Yes | No* |
| `CAMERA_CONSTRAINTS_NOT_SUPPORTED` | Camera | Medium | Yes | Yes |
| `CAMERA_ACCESS_FAILED` | Camera | High | Yes | Yes |
| `CALIBRATION_NO_SAMPLES` | Calibration | Low | No | N/A |
| `DETECTION_FAILED` | Detection | Low | No | N/A |

*Requires environment change (HTTPS setup or browser upgrade)

---

## Related Documentation

- [useBlinkDetector Hook](../app/src/hooks/useBlinkDetector.ts)
- [Blink Calibration Feature](../app/src/features/blink-calibration/)
- [useWebcam Hook](../app/src/hooks/useWebcam.ts)
- [Blink Detector Spec](.kiro/specs/react-use-blink-detector/)

---

## Changelog

### 2025-11-27
- Initial error code system implementation
- Added 11 distinct error codes
- Created comprehensive documentation
- Updated `useBlinkDetector` and `BlinkCalibrationRequestError` components
