# Next.js Webcam Integration - Design

## Architecture Overview

This design outlines the integration of the `useWebcam` hook into the Permission Page (`/permission`) to provide a complete webcam setup experience. The design focuses on creating a clear, user-friendly interface for permission requests, error handling, and video preview.

**Main Components:**

1. **Permission Page (`/permission`)** - Handles initial webcam permission request and setup
2. **useWebcam Hook** - Existing hook that manages webcam state and controls
3. **shadcn/ui Components** - UI building blocks (Button, Alert, Card, Spinner)

## Component Structure

### 1. Permission Page Component

**File:** `app-next/app/permission/page.tsx`

**Responsibilities:**
- Request webcam access from the user
- Display permission request UI with clear explanation
- Show loading state during webcam initialization
- Display error messages for various failure scenarios
- Show video preview when webcam is successfully streaming
- Provide navigation to calibration page after successful setup

**State Management:**
- Uses `useWebcam` hook for all webcam-related state
- Local state for UI-specific concerns (if needed)

**UI Components:**
- `Card` - Container for permission request content
- `Button` - Request access button, Continue button
- `Alert` - Error messages and informational messages
- `Spinner` - Loading indicator during initialization
- `video` element - Webcam preview (using webcamRef from hook)

**Dependencies:**
- `useWebcam` hook from `@/hooks/useWebcam`
- shadcn/ui components: `Button`, `Alert`, `Card`, `Spinner`
- Next.js `useRouter` for navigation

### 2. useWebcam Hook (Implemented)

**File:** `app-next/hooks/useWebcam.ts`

**Responsibilities:**
- Manage webcam MediaStream lifecycle
- Handle permission requests and errors with structured error codes
- Enumerate video devices with automatic device change detection
- Provide video element ref for rendering
- Track loading and streaming states
- Support device switching

**Interface:**
```typescript
// Error Codes Enum
enum WebcamErrorCode {
    // Browser/Environment Errors
    API_NOT_SUPPORTED = 'WEBCAM_API_NOT_SUPPORTED',
    REQUIRES_HTTPS = 'WEBCAM_REQUIRES_HTTPS',

    // Permission Errors
    PERMISSION_DENIED = 'WEBCAM_PERMISSION_DENIED',
    PERMISSION_DISMISSED = 'WEBCAM_PERMISSION_DISMISSED',

    // Device Errors
    DEVICE_NOT_FOUND = 'WEBCAM_DEVICE_NOT_FOUND',
    DEVICE_IN_USE = 'WEBCAM_DEVICE_IN_USE',
    DEVICE_ENUMERATION_FAILED = 'WEBCAM_DEVICE_ENUMERATION_FAILED',

    // Constraint Errors
    CONSTRAINTS_NOT_SUPPORTED = 'WEBCAM_CONSTRAINTS_NOT_SUPPORTED',

    // Stream Errors
    STREAM_START_FAILED = 'WEBCAM_STREAM_START_FAILED',
    STREAM_INTERRUPTED = 'WEBCAM_STREAM_INTERRUPTED',

    // Unknown
    UNKNOWN = 'WEBCAM_UNKNOWN',
}

// Structured Error Type
interface WebcamError {
    code: WebcamErrorCode;
    message: string;
    originalError?: Error;
}

// Hook Return Type
interface UseWebcamReturn {
    // State
    isStreaming: boolean;
    isLoading: boolean;
    error: WebcamError | null;
    devices: MediaDeviceInfo[];
    permissionState: PermissionState | null;
    currentDeviceId: string | null;

    // Controls
    start: () => Promise<boolean>;
    stop: () => void;
    switchDevice: (deviceId: string) => Promise<boolean>;
    refreshDevices: () => Promise<MediaDeviceInfo[]>;
    clearError: () => void;

    // Ref
    videoRef: RefObject<HTMLVideoElement | null>;
}
```

## Data Models

### Permission Page State

```typescript
// From useWebcam hook
const {
    isStreaming,      // boolean - Is webcam currently streaming
    isLoading,        // boolean - Is webcam initializing
    error,            // WebcamError | null - Structured error with code
    permissionState,  // 'granted' | 'denied' | 'prompt' | null
    currentDeviceId,  // string | null - Currently active device ID
    start,            // () => Promise<boolean> - Start webcam, returns success
    stop,             // () => void - Stop webcam stream
    clearError,       // () => void - Clear error state for retry
    videoRef,         // RefObject<HTMLVideoElement> - Video element ref
} = useWebcam();
```

### Error Handling with Error Codes

The hook now uses structured error codes instead of string matching:

```typescript
import { WebcamErrorCode, type WebcamError } from '@/hooks/useWebcam';

// Error UI mapping by error code
const getErrorUI = (error: WebcamError) => {
    switch (error.code) {
        case WebcamErrorCode.PERMISSION_DENIED:
            return {
                title: 'Camera Access Denied',
                description: 'You need to grant camera permission to use this feature.',
                action: 'Please click the camera icon in your browser\'s address bar and allow camera access.'
            };
        case WebcamErrorCode.DEVICE_NOT_FOUND:
            return {
                title: 'No Camera Found',
                description: 'No camera device was detected on your system.',
                action: 'Please connect a camera and refresh the page.'
            };
        case WebcamErrorCode.DEVICE_IN_USE:
            return {
                title: 'Camera In Use',
                description: 'Your camera is being used by another application.',
                action: 'Please close other apps using the camera (Zoom, Teams, etc.) and try again.'
            };
        case WebcamErrorCode.CONSTRAINTS_NOT_SUPPORTED:
            return {
                title: 'Camera Not Compatible',
                description: 'Your camera doesn\'t support the required settings.',
                action: 'Try using a different camera or browser.'
            };
        case WebcamErrorCode.API_NOT_SUPPORTED:
            return {
                title: 'Browser Not Supported',
                description: 'Your browser doesn\'t support camera access.',
                action: 'Please use a modern browser like Chrome, Firefox, Safari, or Edge.'
            };
        case WebcamErrorCode.REQUIRES_HTTPS:
            return {
                title: 'Secure Connection Required',
                description: 'Camera access requires a secure connection (HTTPS).',
                action: 'Please access this site via HTTPS or localhost.'
            };
        case WebcamErrorCode.STREAM_INTERRUPTED:
            return {
                title: 'Camera Disconnected',
                description: 'The camera stream was interrupted.',
                action: 'Please reconnect your camera and try again.'
            };
        default:
            return {
                title: 'Camera Error',
                description: error.message,
                action: 'Please try again or use a different camera.'
            };
    }
};
```

## Page Layouts

### Permission Page Layout

```
┌─────────────────────────────────────────┐
│  Permission Page                         │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Card: Webcam Permission Request   │ │
│  │                                     │ │
│  │  [Icon] Camera Access Required     │ │
│  │                                     │ │
│  │  We need access to your camera     │ │
│  │  for blink detection during the    │ │
│  │  game.                              │ │
│  │                                     │ │
│  │  [Button: Request Camera Access]   │ │
│  │                                     │ │
│  │  OR (if loading)                   │ │
│  │  [Spinner] Initializing camera...  │ │
│  │                                     │ │
│  │  OR (if error)                     │ │
│  │  [Alert: Error Message]            │ │
│  │                                     │ │
│  │  OR (if streaming)                 │ │
│  │  [Video Preview]                   │ │
│  │  [Button: Continue to Calibration] │ │
│  │                                     │ │
│  └────────────────────────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Permission Request Initiates Webcam

*For any* user interaction with the "Request Camera Access" button, the system should call the useWebcam hook's start() method and transition to a loading state.

**Validates: Requirements 1.3**

### Property 2: Error Display Completeness

*For any* error returned by the useWebcam hook, the Permission Page should display a corresponding error message with title, description, and actionable instructions.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

### Property 3: Loading State Visibility

*For any* time period when isLoading is true, the Permission Page should display a loading indicator and disable interactive buttons.

**Validates: Requirements 3.1, 3.2**

### Property 4: Video Preview Conditional Rendering

*For any* state where isStreaming is true, the Permission Page should render a video element with the webcamRef attached; when isStreaming is false, the video element should not be rendered.

**Validates: Requirements 4.1, 4.2, 4.4**

### Property 5: Navigation Guard

*For any* attempt to navigate to the calibration page, the navigation should only succeed if the webcam is successfully streaming (isStreaming === true).

**Validates: Requirements 5.4**



## UI Component Selection

### Required shadcn/ui Components

1. **Button** - Already installed
   - Used for: "Request Camera Access", "Continue to Calibration"
   - Variants: default, outline

2. **Alert** - Need to install
   - Used for: Error messages, informational messages
   - Command: `bunx --bun shadcn@latest add alert`

3. **Card** - Need to install
   - Used for: Container for permission request, calibration content
   - Command: `bunx --bun shadcn@latest add card`

4. **Spinner** - Need to install (if available) or use existing pattern
   - Used for: Loading indicator during webcam initialization
   - Command: `bunx --bun shadcn@latest add spinner`
   - Alternative: Use Lucide React's `Loader2` icon with animation

## Implementation Details

### Permission Page Implementation

```typescript
'use client';

import { useWebcam, WebcamErrorCode, type WebcamError } from '@/hooks/useWebcam';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Camera, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Error UI mapping by error code
const getErrorUI = (error: WebcamError) => {
    switch (error.code) {
        case WebcamErrorCode.PERMISSION_DENIED:
            return {
                title: 'Camera Access Denied',
                description: 'You need to grant camera permission to use this feature.',
                action: 'Please click the camera icon in your browser\'s address bar and allow camera access.'
            };
        case WebcamErrorCode.DEVICE_NOT_FOUND:
            return {
                title: 'No Camera Found',
                description: 'No camera device was detected on your system.',
                action: 'Please connect a camera and refresh the page.'
            };
        case WebcamErrorCode.DEVICE_IN_USE:
            return {
                title: 'Camera In Use',
                description: 'Your camera is being used by another application.',
                action: 'Please close other apps using the camera and try again.'
            };
        case WebcamErrorCode.CONSTRAINTS_NOT_SUPPORTED:
            return {
                title: 'Camera Not Compatible',
                description: 'Your camera doesn\'t support the required settings.',
                action: 'Try using a different camera or browser.'
            };
        case WebcamErrorCode.API_NOT_SUPPORTED:
            return {
                title: 'Browser Not Supported',
                description: 'Your browser doesn\'t support camera access.',
                action: 'Please use a modern browser like Chrome, Firefox, Safari, or Edge.'
            };
        case WebcamErrorCode.REQUIRES_HTTPS:
            return {
                title: 'Secure Connection Required',
                description: 'Camera access requires a secure connection (HTTPS).',
                action: 'Please access this site via HTTPS or localhost.'
            };
        case WebcamErrorCode.STREAM_INTERRUPTED:
            return {
                title: 'Camera Disconnected',
                description: 'The camera stream was interrupted.',
                action: 'Please reconnect your camera and try again.'
            };
        default:
            return {
                title: 'Camera Error',
                description: error.message,
                action: 'Please try again or use a different camera.'
            };
    }
};

export default function PermissionPage() {
    const router = useRouter();
    const { isStreaming, isLoading, error, start, clearError, videoRef } = useWebcam();

    const handleRequestAccess = async () => {
        clearError();
        await start();
    };

    const handleContinue = () => {
        if (isStreaming) {
            router.push('/calibration');
        }
    };

    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="h-6 w-6" />
                        Camera Access Required
                    </CardTitle>
                    <CardDescription>
                        We need access to your camera for blink detection during the game.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Error State */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{getErrorUI(error).title}</AlertTitle>
                            <AlertDescription>
                                {getErrorUI(error).description}
                                <p className="mt-2 font-medium">
                                    {getErrorUI(error).action}
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="ml-2">Initializing camera...</span>
                        </div>
                    )}

                    {/* Initial State - Request Button */}
                    {!isStreaming && !isLoading && !error && (
                        <Button 
                            onClick={handleRequestAccess} 
                            className="w-full"
                            size="lg"
                        >
                            Request Camera Access
                        </Button>
                    )}

                    {/* Streaming State - Video Preview */}
                    {isStreaming && (
                        <>
                            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <Alert>
                                <Camera className="h-4 w-4" />
                                <AlertTitle>Camera Active</AlertTitle>
                                <AlertDescription>
                                    Your camera is working correctly. You can proceed to calibration.
                                </AlertDescription>
                            </Alert>
                            <Button 
                                onClick={handleContinue} 
                                className="w-full"
                                size="lg"
                            >
                                Continue to Calibration
                            </Button>
                        </>
                    )}

                    {/* Error State - Retry Button */}
                    {error && (
                        <Button 
                            onClick={handleRequestAccess} 
                            variant="outline"
                            className="w-full"
                        >
                            Try Again
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
```



## Edge Cases

### E1: User Denies Permission Then Grants It

**Scenario:** User clicks "Request Camera Access", denies permission in browser prompt, then wants to grant it later

**Handling:** 
- Show error message with instructions to grant permission via browser settings
- Provide "Try Again" button that calls start() again
- Browser will remember the denial, so user must manually change permission in browser settings

### E2: Camera Disconnected During Use

**Scenario:** User's camera is disconnected while the webcam is streaming

**Handling:**
- The MediaStream will end, triggering the stream's ended event
- The useWebcam hook should detect this and update isStreaming to false
- Pages should display an error message and provide a way to reconnect

### E3: Multiple Cameras Available

**Scenario:** User has multiple cameras connected

**Handling:**
- For MVP, use the default camera (first available)
- Future enhancement: Add device selection UI using the devices array from useWebcam

### E4: Page Refresh During Streaming

**Scenario:** User refreshes the page while webcam is streaming

**Handling:**
- MediaStream is lost on page refresh (browser behavior)
- Permission Page will show initial state, requiring user to click "Request Camera Access" again

### E6: Browser Doesn't Support MediaDevices API

**Scenario:** User accesses the site from an old browser without MediaDevices API support

**Handling:**
- useWebcam hook detects lack of support and sets error
- Show error message with browser compatibility information
- Suggest upgrading to a modern browser

### E7: Non-HTTPS Context (Production)

**Scenario:** Site is accessed via HTTP in production (not localhost)

**Handling:**
- useWebcam hook detects insecure context and sets error
- Show error message explaining HTTPS requirement
- Provide instructions to access via HTTPS

## Performance Considerations

1. **Video Element Rendering** - Use CSS `object-cover` to maintain aspect ratio without layout shifts
2. **Stream Cleanup** - useWebcam hook handles cleanup on unmount to prevent memory leaks
3. **Auto-Start Optimization** - Use `autoStart` option to avoid manual start() calls
4. **Conditional Rendering** - Only render video element when isStreaming is true
5. **Client Components** - All pages using useWebcam must be client components ('use client')

## Testing Strategy

### Manual Testing

1. **Permission Flow**
   - Navigate to /permission
   - Click "Request Camera Access"
   - Grant permission in browser prompt
   - Verify video preview appears
   - Click "Continue to Calibration"
   - Verify navigation to /calibration

2. **Error Handling**
   - Deny camera permission → Verify error message
   - Disconnect camera → Verify error message
   - Access from HTTP → Verify secure context error
   - Use old browser → Verify compatibility error

3. **Loading States**
   - Verify loading spinner appears during initialization
   - Verify button is disabled during loading
   - Verify loading state clears after success/error

4. **Video Preview**
   - Verify video displays correctly on Permission Page
   - Verify video maintains aspect ratio

### Edge Case Testing

1. Test camera disconnection during streaming
2. Test page refresh during streaming
3. Test multiple cameras (if available)
4. Test browser permission denial and retry

## Future Enhancements

- Device selection UI for multiple cameras
- Camera settings (resolution, frame rate)
- Picture-in-picture mode for video preview
- Webcam stream recording/capture
- Performance monitoring and optimization
- Accessibility improvements (keyboard navigation, screen reader support)
- Mobile device support and testing
