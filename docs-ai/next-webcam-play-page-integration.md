# Next.js Webcam Play Page Integration

**Date:** 2025-11-27  
**Status:** ✅ Complete

## Overview

This document describes the integration of webcam and blink detection into the Play Page (`/play`) with automatic verification and redirect logic to ensure users have proper calibration and permissions before the game loads.

## Problem Solved

Previously, the Play Page would load Unity immediately and attempt to start the webcam, which caused several issues:

1. **Permission Prompts on Wrong Page** - Users were prompted for camera access on the game page instead of the calibration page
2. **Unity WebGL Errors** - When redirecting to calibration, Unity's WebGL context would error during cleanup (`Cannot read properties of undefined (reading 'GLctx')`)
3. **No Calibration Check** - The page didn't verify calibration data existed before attempting to use blink detection
4. **Poor User Experience** - Users could reach the game without completing setup

## Solution Architecture

### GameWebcam Component

Created a new component (`app-next/components/game/GameWebcam.tsx`) that encapsulates all webcam verification logic:

**Responsibilities:**
1. Check for stored calibration data in localStorage
2. Check camera permission via Permissions API (without prompting)
3. Redirect to `/calibration` if either check fails
4. Start webcam only after all checks pass
5. Signal parent component when ready via `onReady` callback
6. Forward blink events to parent via `onBlink` callback
7. Display blink counter indicator
8. Handle webcam errors by redirecting to calibration

**Key Features:**
- Uses refs to prevent duplicate redirects (`hasRedirected`)
- Uses refs to prevent duplicate ready signals (`hasSignaledReady`)
- Checks permission without prompting using `navigator.permissions.query()`
- Only calls `webcam.start()` after all checks pass

### Play Page Updates

Modified the Play Page (`app-next/app/play/page.tsx`) to delay Unity loading:

**Flow:**
1. Render `GameWebcam` component immediately
2. Show "Checking requirements..." loading state
3. Wait for `onReady()` callback from GameWebcam
4. Only then initialize Unity and show game UI
5. Forward blink events from GameWebcam to Unity

**Benefits:**
- Unity never loads if checks fail (no WebGL errors)
- Clear loading states for user feedback
- Automatic redirect to calibration if setup incomplete

## Implementation Details

### Permission Check (Non-Prompting)

```typescript
async function checkCameraPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    try {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        return permission.state;
    } catch {
        // Permission API not supported
        return 'prompt';
    }
}
```

This checks permission state without triggering a browser prompt. If permission is not `'granted'`, we redirect to calibration.

### Calibration Check

```typescript
function hasStoredCalibration(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem('blink-calibration') !== null;
    } catch {
        return false;
    }
}
```

Simple check for calibration data in localStorage. If missing, redirect to calibration.

### Redirect Prevention

```typescript
const hasRedirected = useRef(false);

// In effect
if (!hasStoredCalibration()) {
    hasRedirected.current = true;
    router.replace('/calibration');
    return;
}
```

Using a ref prevents multiple redirects if the effect runs multiple times (React strict mode, etc.).

### Unity Loading Delay

```typescript
// In Play Page
const [isReady, setIsReady] = useState(false);

const handleReady = useCallback(() => {
    setIsReady(true);
}, []);

// Only render Unity when ready
{isReady && (
    <Unity unityProvider={unityProvider} ... />
)}
```

Unity component only mounts after `isReady` is true, which happens after GameWebcam signals ready.

## User Flow

### First-Time User (No Calibration)

1. Navigate to `/play`
2. GameWebcam checks localStorage → no calibration data
3. Redirect to `/calibration`
4. User grants camera permission
5. User completes calibration
6. Click "Start Game" → navigate to `/play?from=calibration`
7. GameWebcam checks pass → webcam starts → Unity loads
8. Game begins with blink detection active

### Returning User (Has Calibration, Permission Granted)

1. Navigate to `/play`
2. GameWebcam checks localStorage → calibration exists
3. GameWebcam checks permission → granted
4. Webcam starts → `onReady()` fires
5. Unity loads
6. Game begins immediately

### Returning User (Has Calibration, Permission Revoked)

1. Navigate to `/play`
2. GameWebcam checks localStorage → calibration exists
3. GameWebcam checks permission → not granted
4. Redirect to `/calibration`
5. User re-grants permission
6. Calibration still valid → skip to ready state
7. Click "Start Game" → back to `/play`

### Webcam Error During Gameplay

1. Playing game with webcam active
2. Camera disconnects or error occurs
3. GameWebcam detects error
4. Redirect to `/calibration`
5. User fixes issue and returns to game

## Error Prevention

### Unity WebGL Context Error (Fixed)

**Before:**
- Unity loaded immediately on Play Page
- If redirecting to calibration, Unity's WebGL context would be destroyed mid-initialization
- Error: `Cannot read properties of undefined (reading 'GLctx')`

**After:**
- Unity only loads after all checks pass
- If redirecting, Unity never initializes
- No WebGL context errors

### Permission Prompt on Wrong Page (Fixed)

**Before:**
- Play Page called `webcam.start()` immediately
- Browser prompted for permission on game page

**After:**
- GameWebcam checks permission first without prompting
- If not granted, redirects to calibration page
- User grants permission on proper page

## Testing Checklist

- [x] Navigate to `/play` without calibration → redirects to `/calibration`
- [x] Navigate to `/play` with calibration but no permission → redirects to `/calibration`
- [x] Navigate to `/play` with calibration and permission → loads game
- [x] Complete calibration → navigate to `/play` → game loads
- [x] Disconnect camera during gameplay → redirects to `/calibration`
- [x] No Unity WebGL errors during redirect
- [x] Blink detection works during gameplay
- [x] Blink counter displays correctly

## Files Modified

1. **Created:** `app-next/components/game/GameWebcam.tsx`
   - New component for webcam verification and blink forwarding

2. **Modified:** `app-next/app/play/page.tsx`
   - Added `isReady` state
   - Delayed Unity loading until ready
   - Integrated GameWebcam component

3. **Updated:** `.kiro/specs/next-webcam/requirements.md`
   - Added Requirement 9: Play Page Webcam Integration

4. **Updated:** `.kiro/specs/next-webcam/design.md`
   - Added Play Page and GameWebcam component documentation
   - Added Properties 9-12 for new requirements

5. **Updated:** `.kiro/specs/next-webcam/tasks.md`
   - Added tasks 10-11 for GameWebcam and Play Page integration

## Future Enhancements

- Add retry logic for transient webcam errors
- Show more detailed error messages on Play Page before redirect
- Add loading progress for MediaPipe initialization
- Consider caching permission state to reduce API calls
- Add analytics for redirect reasons (missing calibration vs permission)

## Conclusion

The Play Page now properly verifies webcam and calibration requirements before loading the game, providing a smooth user experience and preventing technical errors. All checks happen automatically and transparently, with clear loading states and automatic redirects to guide users through the setup process.
