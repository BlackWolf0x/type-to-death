# Next.js Webcam & Blink Detection Integration - Design

## Architecture Overview

This design outlines the integration of the `useWebcam` and `useBlinkDetector` hooks into the Calibration Page (`/calibration`) to provide a complete webcam and blink detection setup experience. The design focuses on creating a clear, user-friendly interface for permission requests, error handling, video preview, and blink calibration.

**Main Components:**

1. **Home Page (`/`)** - Main menu with navigation to calibration and game
2. **Calibration Page (`/calibration`)** - Handles webcam permission, blink calibration, and game readiness
3. **Play Page (`/play`)** - Game page with automatic webcam/calibration verification
4. **GameWebcam Component** - Handles webcam checks, redirects, and blink event forwarding
5. **useWebcam Hook** - Manages webcam state and controls
6. **useBlinkDetector Hook** - Manages MediaPipe face detection and blink detection
7. **shadcn/ui Components** - UI building blocks (Button, Alert, Card, Progress)

## Component Structure

### 1. Home Page Component

**File:** `app-next/app/(home)/page.tsx`

**Responsibilities:**
- Display main menu interface
- Provide navigation to calibration page
- Show authentication modal
- Display username check component

**UI Components:**
- `HomeBanner` - Main banner/hero section
- `UsernameCheck` - Username verification component
- `ModalAuth` - Authentication modal
- `Button` - Eye Calibration navigation button with icon
- `Link` - Next.js navigation to `/calibration`

**Navigation:**
- Eye Calibration button with `SlidersHorizontal` icon
- Links to `/calibration` route
- Positioned in fixed bottom bar with other action buttons

**Dependencies:**
- `@/components/home-banner`
- `@/components/modal-auth`
- `@/components/username-check`
- shadcn/ui `Button` component
- Lucide `SlidersHorizontal` icon
- Next.js `Link` component

### 2. Calibration Page Component

**File:** `app-next/app/calibration/page.tsx`

**Responsibilities:**
- Request webcam access from the user
- Display permission request UI with clear explanation
- Show loading state during webcam and MediaPipe initialization
- Display error messages for various failure scenarios
- Show video preview with eye landmark overlays
- Handle auto-calibration flow with progress indicator
- Display blink detection feedback (counter, eye color changes)
- Provide navigation to play page after successful calibration

**State Management:**
- Uses `useWebcam` hook for webcam state
- Uses `useBlinkDetector` hook for blink detection state
- Local `pageState` for UI flow: 'webcam' → 'calibration' → 'ready'
- Canvas ref for eye landmark drawing

**UI Components:**
- `Card` - Container for all content
- `Button` - Request access, Start Calibration, Recalibrate, Start Game
- `Alert` - Error messages and status messages
- `video` element - Webcam preview (using setVideoRef callback)
- `canvas` element - Eye landmark overlay

**Dependencies:**
- `useWebcam` hook from `@/hooks/useWebcam`
- `useBlinkDetector` hook from `@/hooks/useBlinkDetector`
- shadcn/ui components: `Button`, `Alert`, `Card`
- Lucide icons: `Camera`, `Eye`, `EyeOff`, `Loader2`, `AlertCircle`, `CheckCircle2`, `RefreshCw`, `Play`
- Next.js `useRouter` for navigation

### 2. useWebcam Hook

**File:** `app-next/hooks/useWebcam.ts`

**Responsibilities:**
- Manage webcam MediaStream lifecycle
- Handle permission requests and errors with structured error codes
- Enumerate video devices with automatic device change detection
- Provide video element ref and callback ref for rendering
- Track loading and streaming states
- Support device switching

### 3. Play Page Component

**File:** `app-next/app/play/page.tsx`

**Responsibilities:**
- Load Unity WebGL game
- Integrate GameWebcam component for blink detection
- Display loading states (checking requirements, loading Unity)
- Forward blink events to Unity via sendMessage
- Provide debug UI for manual testing

**State Management:**
- `isReady` - Tracks if webcam/calibration checks passed
- Uses `useUnityContext` for Unity integration
- Receives `onReady` callback from GameWebcam before loading Unity

**Dependencies:**
- `GameWebcam` component
- `react-unity-webgl` for Unity integration
- shadcn/ui `Button` component
- Lucide `Loader2` icon

### 4. GameWebcam Component

**File:** `app-next/components/game-webcam.tsx`

**Responsibilities:**
- Check for stored calibration data in localStorage
- Check camera permission without prompting (via Permissions API)
- Redirect to `/calibration` if checks fail
- Start webcam only after all checks pass
- Signal parent component when ready via `onReady` callback
- Forward blink events to parent via `onBlink` callback
- Display blink counter indicator during gameplay
- Handle webcam errors by redirecting to calibration

**Props:**
```typescript
interface GameWebcamProps {
    onBlink: () => void;    // Called when blink detected
    onReady: () => void;    // Called when checks pass and webcam starts
}
```

**State Management:**
- Uses `useWebcam` hook for webcam control
- Uses `useBlinkDetector` hook for blink detection
- Uses `useRouter` for navigation/redirects
- Refs to prevent duplicate redirects and ready signals

**Dependencies:**
- `useWebcam` hook
- `useBlinkDetector` hook
- Next.js `useRouter`
- Lucide icons: `Eye`, `EyeOff`

### 5. Face Detection Warning Component

**File:** `app-next/components/face-detection-warning.tsx`

**Responsibilities:**
- Display centered warning notice when face is not detected during gameplay
- Show countdown timer starting from 20 seconds
- Redirect to /calibration when countdown reaches zero
- Cancel countdown and hide when face detection resumes

**Props:**
```typescript
interface FaceDetectionWarningProps {
    faceDetected: boolean;
    enabled: boolean; // Only show during active gameplay
}
```

**State Management:**
- `countdown` state: number starting at 20, decremented every second
- `showWarning` state: boolean to control visibility
- Uses `useEffect` with `setInterval` for countdown timer
- Uses `useRouter` for navigation to /calibration

**UI Design:**
- Fixed position, centered on screen (z-50)
- Semi-transparent dark background overlay
- Red-themed warning card matching horror aesthetic
- Large countdown number display
- Clear warning message explaining face detection requirement
- Smooth fade-in/fade-out transitions

**Behavior:**
1. When `faceDetected` becomes false and `enabled` is true:
   - Show warning notice
   - Start 20-second countdown
2. Every second while countdown is active:
   - Decrement countdown by 1
   - Update display
3. When countdown reaches 0:
   - Redirect to /calibration
4. When `faceDetected` becomes true:
   - Cancel countdown
   - Hide warning notice
   - Reset countdown to 20

### 6. useBlinkDetector Hook

**File:** `app-next/hooks/useBlinkDetector.ts`

**Responsibilities:**
- Initialize MediaPipe FaceLandmarker for face detection
- Calculate Eye Aspect Ratio (EAR) from face landmarks using 6-point formula
- Detect blinks using state machine (open → closing → closed → opening → open)
- Apply temporal filtering to prevent false positives (MIN_BLINK_FRAMES, MAX_BLINK_FRAMES, REOPEN_FRAMES)
- Handle manual 2-step calibration with sample collection
- Persist calibration data to localStorage (save on complete, load on init, clear on reset)
- Expose face landmarks for eye drawing
- Track blink count and detection state
- Only count blinks when eyes close AND reopen (prevents squinting false positives)

**Interface:**
```typescript
// Error Codes Enum
enum BlinkDetectorErrorCode {
    MEDIAPIPE_INIT_FAILED = 'BLINK_MEDIAPIPE_INIT_FAILED',
    MEDIAPIPE_WASM_LOAD_FAILED = 'BLINK_MEDIAPIPE_WASM_LOAD_FAILED',
    MEDIAPIPE_MODEL_LOAD_FAILED = 'BLINK_MEDIAPIPE_MODEL_LOAD_FAILED',
    DETECTION_FAILED = 'BLINK_DETECTION_FAILED',
    NO_FACE_DETECTED = 'BLINK_NO_FACE_DETECTED',
    CALIBRATION_NO_SAMPLES = 'BLINK_CALIBRATION_NO_SAMPLES',
    CALIBRATION_INVALID = 'BLINK_CALIBRATION_INVALID',
}

// Hook Return Type
interface UseBlinkDetectorReturn {
    // State
    isInitialized: boolean;
    isDetecting: boolean;
    error: BlinkDetectorError | null;

    // Blink Data
    blinkData: {
        leftEAR: number;
        rightEAR: number;
        averageEAR: number;
        isBlinking: boolean;
        blinkCount: number;
        faceDetected: boolean;
    };

    // Face Landmarks (for drawing)
    faceLandmarks: FaceLandmark[] | null;

    // Calibration
    calibration: {
        phase: 'idle' | 'auto';
        eyesOpenEAR: number | null;
        eyesClosedEAR: number | null;
        threshold: number;
        isCalibrated: boolean;
        samplesCollected: number;
        autoProgress: number;
    };

    // Controls
    startDetection: () => void;
    stopDetection: () => void;
    resetBlinkCount: () => void;
    clearError: () => void;

    // Calibration Controls
    startAutoCalibration: () => void;
    resetCalibration: () => void;
}
```

## Core Algorithms

### 1. Eye Aspect Ratio (EAR) Calculation

The EAR is calculated using the standard 6-point formula for robust blink detection:

```
EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)
```

**Landmark Points:**
- `p1, p4` = horizontal corners (outer, inner)
- `p2, p6` = first vertical pair (top1, bottom1)
- `p3, p5` = second vertical pair (top2, bottom2) - center points for stability

**MediaPipe Landmark Indices:**

Left Eye:
- outerCorner: 33, innerCorner: 133
- top1: 159, bottom1: 145
- top2: 158, bottom2: 153 (center points)

Right Eye:
- outerCorner: 362, innerCorner: 263
- top1: 386, bottom1: 374
- top2: 387, bottom2: 373 (center points)

The center vertical points (top2/bottom2) provide more stable measurements, especially when the face isn't perfectly frontal.

### 2. Blink Detection State Machine

Blinks are detected using a state machine to ensure temporal consistency:

```
States: open → closing → closed → opening → open (blink counted!)
```

**State Transitions:**

1. **open → closing**: EAR drops below threshold
2. **closing → closed**: Eyes remain closed for MIN_BLINK_FRAMES (2 frames)
3. **closed → opening**: EAR rises above threshold
4. **opening → open**: Eyes remain open for REOPEN_FRAMES (2 frames) → **Blink counted**

**Parameters:**
- `MIN_BLINK_FRAMES = 1`: Minimum frames eyes must be closed (~17ms at 60fps)
- `MAX_BLINK_FRAMES = 30`: Maximum frames for valid blink (~500ms at 60fps)
- `REOPEN_FRAMES = 1`: Frames eyes must reopen to confirm blink completed

**Benefits:**
- Filters out noise and partial blinks
- Only counts complete blinks (close + reopen)
- Prevents false positives from squinting or looking down
- Distinguishes blinks from drowsiness (eyes closed too long)

### 3. Threshold Calculation

After manual calibration, the threshold is calculated as:

```
threshold = eyesClosedEAR + (gap * 0.6)
```

Where `gap = eyesOpenEAR - eyesClosedEAR`

This means the system triggers at 60% of the way from closed to open (or 40% closed), providing more sensitive blink detection that triggers earlier in the blink motion.

**Calibration Quality Check:**
- If `gap < 0.1`, a warning is logged suggesting the user close their eyes more firmly during calibration
- Typical good calibration: gap ≥ 0.2

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

### Property 0: Home Page Navigation to Calibration

*For any* user interaction with the "Eye Calibration" button on the home page, the system should navigate to the `/calibration` route.

**Validates: Requirements 5.1**

### Property 1: Permission Request Initiates Webcam

*For any* user interaction with the "Grant Camera Access" button, the system should call the useWebcam hook's start() method and transition to a loading state.

**Validates: Requirements 1.3**

### Property 2: Error Display Completeness

*For any* error returned by the useWebcam or useBlinkDetector hooks, the Calibration Page should display a corresponding error message with title, description, and actionable instructions.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

### Property 3: Loading State Visibility

*For any* time period when isLoading is true or MediaPipe is initializing, the Calibration Page should display a loading indicator.

**Validates: Requirements 3.1, 3.2**

### Property 4: Video Preview Conditional Rendering

*For any* state where isStreaming is true, the Calibration Page should render a video element with the setVideoRef callback attached.

**Validates: Requirements 4.1, 4.2, 4.4**

### Property 5: Page State Transitions

*For any* successful webcam start, the page should automatically transition from 'webcam' to 'calibration' state. *For any* successful calibration, the page should transition to 'ready' state.

**Validates: Requirements 5.1, 5.2**

### Property 6: Manual Calibration Flow

*For any* calibration session, the user completes two steps: (1) click Record for eyes-open (auto-saves after 1.5s), (2) click Record for eyes-closed (auto-saves after 1.5s). The threshold is calculated as eyesClosedEAR + (gap * 0.6) where gap = eyesOpenEAR - eyesClosedEAR.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 7: Calibration Persistence

*For any* completed calibration, the system should persist the calibration data (eyesOpenEAR, eyesClosedEAR, threshold) to localStorage. *For any* page load, the system should restore saved calibration if available. *For any* reset action, the system should clear localStorage.

**Validates: Requirements 6.5, 8.1, 8.2, 8.3, 8.4**

### Property 8: Blink Detection Accuracy and Robustness

*For any* valid blink (eyes close for 2-15 frames then reopen for 2+ frames), the system should detect the blink and increment the counter exactly once. *For any* partial blink, squint, or noise (< 2 frames closed), the system should NOT count it as a blink.

**Validates: Requirements 7.3, 7.4**

### Property 9: Play Page Redirect on Missing Calibration

*For any* navigation to /play when localStorage does not contain calibration data, the system should redirect to /calibration without starting the webcam.

**Validates: Requirements 9.1, 9.2**

### Property 10: Play Page Redirect on Missing Permission

*For any* navigation to /play when camera permission is not granted, the system should redirect to /calibration without prompting for permission.

**Validates: Requirements 9.3, 9.4**

### Property 11: Play Page Unity Loading Delay

*For any* navigation to /play, Unity should not initialize until after webcam and calibration checks pass successfully.

**Validates: Requirements 9.5, 9.7**

### Property 12: Play Page Webcam Error Handling

*For any* webcam error that occurs after checks pass, the Play Page should redirect to /calibration.

**Validates: Requirements 9.6**



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

### 6. Visual Styling Components

**VHSStatic Component**

**File:** `app-next/components/vhs-static.tsx`

**Responsibilities:**
- Render film grain overlay effect using SVG filter
- Provide atmospheric horror aesthetic
- Use GPU-accelerated CSS for performance

**Technical Implementation:**
- Uses SVG `feTurbulence` filter with `baseFrequency="0.65"` and `numOctaves="3"`
- Applied via inline SVG data URL
- Uses `mix-blend-multiply` for authentic film grain blending
- Default opacity of 70%

**CardRain Component**

**File:** `app-next/components/ui/card-rain.tsx`

**Responsibilities:**
- Render animated red rain effect within cards
- Use canvas-based animation for performance
- Automatically resize with card dimensions

**Technical Implementation:**
- 50 red raindrops with varying opacity (0.3-0.8)
- Speed range: 2-5 units per frame
- Length range: 10-30 pixels
- Uses `ResizeObserver` for responsive sizing
- Positioned at 20% opacity within cards

**Enhanced Card Component**

**File:** `app-next/components/ui/card.tsx`

**Enhancements:**
- Red corner brackets (top-left, top-right, bottom-left, bottom-right)
- Red border (`border-red-500/30`)
- Integrated CardRain background

### 7. useBackgroundSegmentation Hook

**File:** `app-next/hooks/useBackgroundSegmentation.ts`

**Responsibilities:**
- Initialize MediaPipe Image Segmenter for person detection
- Segment person from background using confidence masks
- Apply background darkening effect
- Apply VHS-style effects (chromatic aberration, noise, rolling bar)
- Process video frames efficiently using requestAnimationFrame

**Interface:**
```typescript
interface UseBackgroundSegmentationOptions {
    videoRef: RefObject<HTMLVideoElement | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    enabled?: boolean;
    backgroundDarkness?: number; // 0-1, how dark the background should be
    vhsEffect?: boolean; // Enable VHS-style effects
}

interface UseBackgroundSegmentationReturn {
    isInitialized: boolean;
    isProcessing: boolean;
    error: Error | null;
}
```

**Technical Implementation:**
- Uses MediaPipe Image Segmenter with GPU delegate for performance
- Loads selfie segmentation model from CDN
- Outputs confidence masks (0 = background, 1 = person)
- Throttles processing to ~30fps for optimal performance
- Applies effects pixel-by-pixel based on confidence values

**Background Darkening:**
- Multiplies background pixels by (1 - confidence * backgroundDarkness)
- Default darkness: 0.7 (70% darker)
- Smooth blending at person edges using confidence values
- Single-pass processing for efficiency

**VHS Effects:**
- **Chromatic Aberration**: Shifts red channel 4 pixels horizontally with 70/30 blend
- **Random Noise**: Pre-generated buffer of 10,000 noise values (±10 brightness) cycled through
- **Rolling Bar**: Vertical brightness wave scrolling at 8 units/second
- Bar height: 30 pixels with sine wave brightness modulation (±5%)

**Performance Optimizations:**
1. **Frame Throttling**: Processes at ~30fps (every 33ms) instead of 60fps
2. **Pre-generated Noise**: 10,000 random values generated once, cycled through to avoid `Math.random()` per pixel
3. **Bit Shift Operations**: Uses `i << 2` instead of `i * 4` for faster index calculations
4. **Local Variable Caching**: Avoids repeated property lookups in hot loops
5. **Inline Clamping**: Removes `Math.max/Math.min` calls, uses ternary operators
6. **Scanline Processing**: Processes chromatic aberration row-by-row for better cache efficiency
7. **Mounted Ref**: Prevents state updates after component unmount
8. **Reduced Logging**: Silences frame processing errors to avoid console spam
9. **Canvas Size Check**: Only resizes canvas when dimensions change
10. **Single Pass Effects**: Applies background darkening in one loop before VHS effectsnd
- `overflow-hidden` to contain rain animation

## Correctness Properties

### Property 13: Background Image Cycling

*For any* blink detected during the ready state, the system should cycle to the next horror image in the sequence.

**Validates: Requirements 10.2**

### Property 14: Visual Effects Rendering

*For any* calibration page load, the system should render film grain overlay, and when the card is visible, it should display red corner brackets and rain animation.

**Validates: Requirements 10.3, 10.5, 10.6**

### Property 15: Shake Animation Conditional Display

*For any* state where the webcam is not streaming, the calibration card should display a shake animation. *For any* state where the webcam is streaming, the shake animation should stop.

**Validates: Requirements 10.4**

### Property 16: Background Segmentation Initialization

*For any* calibration page load with background segmentation enabled, the system should initialize MediaPipe Image Segmenter and begin processing video frames when the video element is ready.

**Validates: Requirements 11.1, 11.2**

### Property 17: Background Darkening Effect

*For any* video frame processed with background segmentation, pixels with low person confidence (< 0.3) should be darkened by the configured backgroundDarkness amount, while person pixels remain at full brightness.

**Validates: Requirements 11.3**

### Property 18: VHS Effects Application

*For any* video frame processed with vhsEffect enabled, the system should apply chromatic aberration (red channel shift) and random noise effects.

**Validates: Requirements 11.4**

### Property 19: Performance Throttling

*For any* video frame processing loop, the system should throttle frame processing to approximately 30fps (every 33ms) to maintain optimal performance and prevent CPU/memory issues.

**Validates: Requirements 11.5**

### Property 20: Demon Face Overlay Rendering

*For any* face with detected landmarks, the system should render demon horns on the forehead using forehead landmark positions, and when the mouth is open, render demon teeth and fangs that follow the curved shape of the mouth using lip landmark positions.

**Validates: Requirements 12.1, 12.2, 12.3**

### Property 24: Calibration Page Demon Feature Visibility

*For any* calibration page state where calibration is not complete, the system should only display eye overlays without horns or teeth. *For any* calibration page state where calibration is complete, the system should display all demon features including eyes, horns, and teeth.

**Validates: Requirements 12.4, 12.5**

### Property 21: Face Detection Warning Display

*For any* gameplay state where the webcam is active and faceDetected is false, the system should display a centered warning notice with a 20-second countdown timer.

**Validates: Requirements 13.1, 13.2, 13.5**

### Property 22: Face Detection Warning Countdown

*For any* active countdown, the system should decrement the timer every second. *For any* countdown that reaches zero, the system should redirect to /calibration.

**Validates: Requirements 13.3, 13.6**

### Property 23: Face Detection Warning Cancellation

*For any* state where face detection resumes (faceDetected becomes true) while the countdown is active, the system should immediately cancel the countdown and hide the warning notice.

**Validates: Requirements 13.4**

## Future Enhancements

- Device selection UI for multiple cameras
- Camera settings (resolution, frame rate)
- Picture-in-picture mode for video preview
- Webcam stream recording/capture
- Performance monitoring and optimization
- Accessibility improvements (keyboard navigation, screen reader support)
- Mobile device support and testing
- Animated film grain (seed animation)
- Adjustable rain intensity based on game state
- Glitch effects during critical moments
- Scanline overlay for CRT monitor effect
- Vignette effect around card edges
