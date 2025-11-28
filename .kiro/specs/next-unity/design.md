# Next.js Unity WebGL Integration - Design

## Architecture Overview

This design outlines the integration of Unity WebGL builds into the Next.js application with real-time blink detection. The design focuses on seamless communication between React (blink detection) and Unity (game logic).

**Main Components:**

1. **Play Page (`/play`)** - Entry point for the game
2. **UnityGame Component** - Manages Unity instance and blink detection
3. **react-unity-webgl** - Unity WebGL integration library
4. **useWebcam & useBlinkDetector Hooks** - Blink detection system

## Component Structure

### 1. Play Page Component

**File:** `app-next/app/play/page.tsx`

**Responsibilities:**
- Render the UnityGame component
- Serve as the game entry point

**Implementation:**
```typescript
import { UnityGame } from "@/components/unity";

export default function PlayPage() {
    return <UnityGame />;
}
```

### 2. UnityGame Component

**File:** `app-next/components/unity.tsx`

**Responsibilities:**
- Initialize Unity WebGL instance
- Manage Unity loading state
- Initialize webcam and blink detection
- Send blink events to Unity
- Display loading progress
- Provide debug controls
- Show blink status indicator

**Dependencies:**
- `react-unity-webgl` - Unity integration
- `useWebcam` - Webcam management
- `useBlinkDetector` - Blink detection
- `Button` - shadcn/ui component
- `Eye`, `EyeOff` - Lucide icons

## Data Flow

### Unity Initialization Flow

```
1. Component mounts
2. useUnityContext initializes with build URLs
3. Unity starts loading (loadingProgression updates)
4. Loading screen displays progress
5. Unity finishes loading (isLoaded = true)
6. Game canvas becomes visible
```

### Blink Detection Flow

```
1. Component mounts
2. useWebcam.start() called
3. Webcam starts streaming
4. useBlinkDetector.startDetection() called
5. MediaPipe detects face landmarks
6. EAR calculated from eye landmarks
7. Blink detected when EAR < threshold
8. blinkData.isBlinking becomes true
9. useEffect triggers sendMessage to Unity
10. Unity Monster.OnBlinkDetected() called
```

## Unity Integration

### Unity Context Configuration

```typescript
const { unityProvider, loadingProgression, isLoaded, sendMessage } = useUnityContext({
    loaderUrl: "/game/build.loader.js",
    dataUrl: "/game/build.data",
    frameworkUrl: "/game/build.framework.js",
    codeUrl: "/game/build.wasm",
});
```

**Build Files Location:** `/public/game/`

### React-to-Unity Communication

```typescript
// Send message to Unity GameObject
sendMessage(gameObjectName: string, methodName: string, parameter?: string | number);

// Examples:
sendMessage("Monster", "OnBlinkDetected");
sendMessage("MainMenuManager", "GoToGameScene");
```

**Unity C# Methods:**
- `Monster.OnBlinkDetected()` - Called when user blinks
- `MainMenuManager.GoToGameScene()` - Called to start game

## Component Implementation

### UnityGame Component Structure

```typescript
'use client';

import { useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useWebcam } from "@/hooks/useWebcam";
import { useBlinkDetector } from "@/hooks/useBlinkDetector";
import { Button } from "./ui/button";
import { Eye, EyeOff } from "lucide-react";

export function UnityGame() {
    // Unity context
    const { unityProvider, loadingProgression, isLoaded, sendMessage } = useUnityContext({
        loaderUrl: "/game/build.loader.js",
        dataUrl: "/game/build.data",
        frameworkUrl: "/game/build.framework.js",
        codeUrl: "/game/build.wasm",
    });

    // Webcam and blink detection
    const webcam = useWebcam();
    const blink = useBlinkDetector({ videoRef: webcam.videoRef });

    // Auto-start webcam
    useEffect(() => {
        webcam.start();
    }, []);

    // Auto-start detection when ready
    useEffect(() => {
        if (webcam.isStreaming && blink.isInitialized && !blink.isDetecting) {
            blink.startDetection();
        }
    }, [webcam.isStreaming, blink.isInitialized, blink.isDetecting, blink.startDetection]);

    // Send blink events to Unity
    useEffect(() => {
        if (blink.blinkData.isBlinking) {
            sendMessage("Monster", "OnBlinkDetected");
        }
    }, [blink.blinkData.isBlinking, sendMessage]);

    // Debug controls
    function handleStartGame() {
        sendMessage("MainMenuManager", "GoToGameScene");
    }

    function handleBlink() {
        sendMessage("Monster", "OnBlinkDetected");
    }

    return (
        <>
            {/* Hidden webcam video */}
            <video ref={webcam.setVideoRef} autoPlay playsInline muted className="hidden" />

            {/* Loading screen */}
            {!isLoaded && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-2xl z-20">
                    Loading... {Math.round(loadingProgression * 100)}%
                </div>
            )}

            {/* Unity canvas */}
            <Unity
                unityProvider={unityProvider}
                style={{ visibility: isLoaded ? "visible" : "hidden" }}
                className="fixed inset-0 w-screen h-screen z-0"
            />

            {/* Debug controls */}
            <div className="fixed top-4 left-4 z-10 space-x-2">
                <Button onClick={handleStartGame}>Start</Button>
                <Button onClick={handleBlink}>Manual Blink</Button>
            </div>

            {/* Blink indicator */}
            <div className="fixed bottom-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-black/60 px-4 py-2 text-white">
                {blink.blinkData.isBlinking ? (
                    <EyeOff className="h-5 w-5 text-yellow-400" />
                ) : (
                    <Eye className="h-5 w-5 text-green-400" />
                )}
                <span>Blinks: {blink.blinkData.blinkCount}</span>
            </div>
        </>
    );
}
```

## Correctness Properties

### P1: Unity Loading Progress

*For any* Unity loading state, the loading progress indicator should display the current percentage from 0-100%.

**Validates: Requirements 1.2, 1.3**

### P2: Blink Event Transmission

*For any* detected blink (blinkData.isBlinking = true), the system should call sendMessage("Monster", "OnBlinkDetected") exactly once per blink.

**Validates: Requirements 2.3, 2.4**

### P3: Automatic Initialization

*For any* component mount, the webcam should start automatically, followed by blink detection when the webcam is ready.

**Validates: Requirements 2.1, 2.2**

### P4: Visual Feedback Accuracy

*For any* blink state change, the blink indicator should update to reflect the current state (green eye for open, yellow eye for blinking).

**Validates: Requirements 3.2, 3.3**

### P5: Webcam Privacy

*For any* gameplay session, the webcam video element should have the "hidden" class applied, making it invisible to the user.

**Validates: Requirements 5.1, 5.3**

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Start] [Manual Blink]  ← Debug controls (top-left)   │
│                                                          │
│                                                          │
│                                                          │
│              Unity Game Canvas (fullscreen)             │
│                                                          │
│                                                          │
│                                                          │
│                          [👁️ Blinks: 5] ← Indicator    │
└─────────────────────────────────────────────────────────┘
```

## Edge Cases

### E1: Unity Load Failure

**Scenario:** Unity build files fail to load

**Handling:**
- Loading screen remains visible
- Consider adding error state detection
- Future: Add error message and retry button

### E2: Webcam Not Calibrated

**Scenario:** User navigates to /play without calibrating

**Handling:**
- Blink detection loads saved calibration from localStorage
- If no calibration exists, threshold defaults to 0.2
- Future: Redirect to /calibration if not calibrated

### E3: Webcam Permission Denied

**Scenario:** User denies webcam permission on /play page

**Handling:**
- useWebcam sets error state
- Blink detection won't work
- Future: Show error message and redirect to /calibration

### E4: Multiple Blinks in Quick Succession

**Scenario:** User blinks multiple times rapidly

**Handling:**
- Each blink triggers sendMessage once
- Unity handles multiple rapid calls
- Blink counter increments correctly

## Performance Considerations

1. **Unity + Blink Detection** - Both run in parallel without blocking
2. **Hidden Video Element** - Reduces rendering overhead
3. **useEffect Dependencies** - Carefully managed to avoid unnecessary re-renders
4. **SendMessage Calls** - Only triggered on blink state change, not every frame

## Testing Strategy

### Manual Testing

1. **Unity Loading**
   - Navigate to /play
   - Verify loading progress displays
   - Verify game appears when loaded

2. **Blink Detection**
   - Blink naturally
   - Verify blink indicator changes color
   - Verify blink counter increments
   - Verify monster teleports in Unity

3. **Debug Controls**
   - Click "Start" button
   - Verify scene transition in Unity
   - Click "Manual Blink" button
   - Verify monster teleports

4. **Webcam Privacy**
   - Verify webcam video is not visible
   - Verify blink detection still works

### Edge Case Testing

1. Test without calibration
2. Test with webcam permission denied
3. Test rapid blinking
4. Test Unity load failure (remove build files)

## Future Enhancements

- Error handling for Unity load failures
- Redirect to /calibration if not calibrated
- Unity-to-React communication (game events)
- Game state persistence
- Pause/resume functionality
- Settings menu overlay
- Performance monitoring
- Mobile device support
