# React useWebcam Hook - Design

## Overview

The `useWebcam` hook is a custom React hook that encapsulates all webcam management logic, providing a clean API for accessing and controlling the user's camera. It handles the complexity of the MediaDevices API, permission management, device enumeration, and stream lifecycle, exposing a simple interface for React components.

The hook returns an object containing:
- State values (isStreaming, isLoading, error, devices, permissionState)
- Control functions (start, stop, refresh)
- A ref for attaching to video elements (webcamRef)

## Architecture

### High-Level Flow

1. **Initialization**: Hook sets up initial state and refs
2. **Auto-start (optional)**: If enabled, automatically requests camera access on mount
3. **Permission Request**: Browser prompts user for camera permission
4. **Device Enumeration**: Lists all available video input devices
5. **Stream Creation**: Creates MediaStream from selected device
6. **Video Assignment**: Assigns stream to video element via ref
7. **Cleanup**: Stops stream and releases resources on unmount or manual stop

### Component Structure

```
useWebcam Hook
├── State Management (useState)
│   ├── isStreaming: boolean
│   ├── isLoading: boolean
│   ├── error: string | null
│   ├── devices: MediaDeviceInfo[]
│   ├── permissionState: PermissionState
│   └── currentStream: MediaStream | null
├── Refs (useRef)
│   └── webcamRef: RefObject<HTMLVideoElement>
├── Effects (useEffect)
│   ├── Auto-start effect
│   ├── Device enumeration effect
│   └── Cleanup effect
└── Functions (useCallback)
    ├── start()
    ├── stop()
    └── refresh()
```

## Components and Interfaces

### Hook Interface

```typescript
interface UseWebcamOptions {
  deviceId?: string;
  autoStart?: boolean;
  videoConstraints?: MediaTrackConstraints;
}

interface UseWebcamReturn {
  // State
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  devices: MediaDeviceInfo[];
  permissionState: PermissionState | null;
  
  // Controls
  start: () => Promise<void>;
  stop: () => void;
  refresh: () => Promise<void>;
  
  // Ref
  webcamRef: RefObject<HTMLVideoElement>;
}

type PermissionState = 'granted' | 'denied' | 'prompt';

function useWebcam(options?: UseWebcamOptions): UseWebcamReturn
```

### Responsibilities

**State Management:**
- Track streaming status (isStreaming)
- Track loading operations (isLoading)
- Store error messages (error)
- Store available devices (devices)
- Track permission state (permissionState)
- Hold reference to current stream (currentStream)

**Stream Management:**
- Request camera permissions
- Create MediaStream from device
- Stop and clean up streams
- Handle stream errors

**Device Management:**
- Enumerate video input devices
- Filter for video-only devices
- Support device switching
- Refresh device list

**Video Element Integration:**
- Provide ref for video element
- Assign stream to video element
- Handle video element lifecycle

## Data Models

### Configuration (Hook Options)

```typescript
interface UseWebcamOptions {
  // Optional device ID to use specific camera
  deviceId?: string;
  
  // Auto-start stream on mount
  autoStart?: boolean;
  
  // Video constraints (resolution, frame rate, etc.)
  videoConstraints?: MediaTrackConstraints;
}
```

### Runtime State

```typescript
// Streaming status
const [isStreaming, setIsStreaming] = useState<boolean>(false);

// Loading status for async operations
const [isLoading, setIsLoading] = useState<boolean>(false);

// Error message
const [error, setError] = useState<string | null>(null);

// Available video devices
const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

// Camera permission state
const [permissionState, setPermissionState] = useState<PermissionState | null>(null);

// Current active stream
const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

// Video element ref
const webcamRef = useRef<HTMLVideoElement>(null);
```

## Core Algorithms

### 1. Start Stream

```
Algorithm: startStream()
Input: deviceId (optional), videoConstraints (optional)
Output: MediaStream or Error

1. Set isLoading = true
2. Clear previous error
3. Try:
   a. Build constraints object:
      - video: { deviceId: { exact: deviceId } } if deviceId provided
      - video: videoConstraints if provided
      - video: true otherwise
   b. Call navigator.mediaDevices.getUserMedia(constraints)
   c. Wait for MediaStream
   d. Store stream in currentStream state
   e. If webcamRef.current exists:
      - Set webcamRef.current.srcObject = stream
      - Call webcamRef.current.play()
   f. Set isStreaming = true
   g. Set permissionState = 'granted'
   h. Enumerate devices (call enumerateDevices)
4. Catch error:
   a. If error is NotAllowedError or PermissionDeniedError:
      - Set permissionState = 'denied'
      - Set error = "Camera permission denied"
   b. If error is NotFoundError:
      - Set error = "No camera found"
   c. If error is OverconstrainedError:
      - Set error = "Camera constraints not supported"
   d. Otherwise:
      - Set error = error.message
   e. Set isStreaming = false
5. Finally:
   a. Set isLoading = false
```

### 2. Stop Stream

```
Algorithm: stopStream()
Input: None
Output: None

1. If currentStream exists:
   a. Get all tracks: currentStream.getTracks()
   b. For each track:
      - Call track.stop()
   c. Set currentStream = null
2. If webcamRef.current exists:
   a. Set webcamRef.current.srcObject = null
3. Set isStreaming = false
4. Clear error
```

### 3. Enumerate Devices

```
Algorithm: enumerateDevices()
Input: None
Output: Array of MediaDeviceInfo

1. Try:
   a. Call navigator.mediaDevices.enumerateDevices()
   b. Wait for device list
   c. Filter devices where kind === 'videoinput'
   d. Store filtered devices in devices state
   e. Return filtered devices
2. Catch error:
   a. Set error = "Failed to enumerate devices"
   b. Return empty array
```

### 4. Refresh Devices

```
Algorithm: refresh()
Input: None
Output: Promise<void>

1. Set isLoading = true
2. Call enumerateDevices()
3. Set isLoading = false
```

### 5. Check Permission State

```
Algorithm: checkPermissionState()
Input: None
Output: PermissionState

1. If navigator.permissions exists:
   a. Try:
      - Query permission for 'camera'
      - Get permission.state
      - Set permissionState = permission.state
      - Return permission.state
   b. Catch:
      - Return null (permissions API not supported)
2. Else:
   a. Return null (permissions API not available)
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### P1: Permission State Synchronization
**Property:** *For any* permission request outcome (granted, denied, or prompt), the hook's permissionState should accurately reflect the browser's permission status
**Validates: Requirements 1.2, 1.3, 1.4**

### P2: Stream Lifecycle State Consistency
**Property:** *For any* stream operation, isStreaming should be true when a MediaStream is active and false when no stream exists or after stop() is called
**Validates: Requirements 2.2, 2.4**

### P3: Stream Start Behavior
**Property:** *For any* call to start(), the hook should request camera access via getUserMedia and create a MediaStream if permission is granted
**Validates: Requirements 2.1**

### P4: Stream Stop and Cleanup
**Property:** *For any* call to stop(), all video tracks in the current stream should be stopped and the stream reference should be cleared
**Validates: Requirements 2.3**

### P5: Unmount Cleanup
**Property:** *For any* component unmount, if a stream is active, all tracks should be stopped and resources should be released
**Validates: Requirements 2.5**

### P6: Device Enumeration on Initialization
**Property:** *For any* hook initialization, enumerateDevices should be called to populate the devices array with available video input devices
**Validates: Requirements 3.1, 3.2**

### P7: Device Selection
**Property:** *For any* provided deviceId, the hook should include that deviceId in the getUserMedia constraints when starting the stream
**Validates: Requirements 3.3**

### P8: Device Refresh
**Property:** *For any* call to refresh(), the hook should re-enumerate devices and update the devices array
**Validates: Requirements 3.4**

### P9: Device Switch Cleanup
**Property:** *For any* device switch operation, the current stream should be stopped before starting a new stream with the new device
**Validates: Requirements 3.5**

### P10: Video Element Stream Assignment
**Property:** *For any* active stream, the MediaStream should be assigned to the video element's srcObject and play() should be called
**Validates: Requirements 4.2, 4.4**

### P11: Video Element Cleanup
**Property:** *For any* stream stop operation, the video element's srcObject should be cleared
**Validates: Requirements 4.3**

### P12: Error Capture and Exposure
**Property:** *For any* MediaDevices API error (NotAllowedError, NotFoundError, OverconstrainedError, or other), the hook should capture the error and set an appropriate error message
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### P13: Error Clearing on Success
**Property:** *For any* successful operation, previous error state should be cleared
**Validates: Requirements 5.5**

### P14: Loading State Management
**Property:** *For any* asynchronous operation (permission request, stream start, device enumeration), isLoading should be true during the operation and false when complete (success or failure)
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### P15: Auto-Start Behavior
**Property:** *For any* hook initialization with autoStart=true, camera access should be requested immediately after mount; for autoStart=false, no automatic request should occur
**Validates: Requirements 7.3, 7.4**

## Edge Cases

### E1: Rapid Start/Stop Cycles
**Scenario:** User calls start() and stop() in rapid succession
**Handling:** Each stop() call should clean up the current stream before the next start() creates a new one. Use proper async/await handling to prevent race conditions.

### E2: Device Disconnection During Stream
**Scenario:** Active camera device is physically disconnected
**Handling:** The stream will end naturally. The hook should detect the ended stream and update isStreaming to false. Consider adding a stream 'ended' event listener.

### E3: Permission Revoked During Stream
**Scenario:** User revokes camera permission while stream is active
**Handling:** Similar to device disconnection, the stream will end. Update state accordingly and set appropriate error message.

### E4: No Video Devices Available
**Scenario:** System has no camera devices
**Handling:** enumerateDevices returns empty array for videoinput. Set error state indicating no devices found. Prevent start() from attempting getUserMedia.

### E5: Invalid Device ID
**Scenario:** Provided deviceId doesn't match any available device
**Handling:** getUserMedia will throw OverconstrainedError. Catch this and set appropriate error message. Consider falling back to default device.

### E6: Component Unmounts During Async Operation
**Scenario:** Component unmounts while getUserMedia or enumerateDevices is pending
**Handling:** Use cleanup function in useEffect to cancel pending operations or ignore state updates after unmount. Consider using AbortController for getUserMedia.

### E7: Browser Without MediaDevices API
**Scenario:** Browser doesn't support navigator.mediaDevices
**Handling:** Check for API availability on mount. Set error state indicating unsupported browser. Disable all functionality gracefully.

### E8: Insecure Context (HTTP)
**Scenario:** Page is served over HTTP instead of HTTPS
**Handling:** MediaDevices API is not available in insecure contexts. Detect this and provide clear error message about HTTPS requirement.

## Performance Considerations

- **Minimize Re-renders**: Use useCallback for all functions to prevent unnecessary re-renders of consuming components
- **Ref Usage**: Use useRef for webcamRef to avoid re-renders when video element reference changes
- **Cleanup Efficiency**: Stop tracks immediately when no longer needed to release camera resources
- **Device Enumeration**: Only enumerate devices when necessary (initialization, refresh) to avoid performance overhead
- **State Batching**: React 18 automatically batches state updates, but be mindful of multiple setState calls in async operations

## Testing Strategy

### Testing Framework

- **Framework**: Vitest
- **Test Location**: `app/tests/` directory
- **Naming Convention**: Tests should be prefixed with category:
  - `unit-useWebcam-*.test.ts` for unit tests
  - `integration-useWebcam-*.test.ts` for integration tests
  - `property-useWebcam-*.test.ts` for property-based tests

### Unit Tests

All unit tests will be located in `app/tests/` with the prefix `unit-useWebcam-`:

1. **Hook Initialization** (`unit-useWebcam-initialization.test.ts`)
   - Test hook returns correct initial state
   - Test webcamRef is created
   - Test autoStart=false doesn't trigger camera access

2. **Start Function** (`unit-useWebcam-start.test.ts`)
   - Test start() calls getUserMedia
   - Test successful stream updates isStreaming to true
   - Test error handling for permission denied
   - Test error handling for no devices found

3. **Stop Function** (`unit-useWebcam-stop.test.ts`)
   - Test stop() stops all tracks
   - Test stop() clears stream reference
   - Test stop() updates isStreaming to false
   - Test stop() clears video element srcObject

4. **Device Management** (`unit-useWebcam-devices.test.ts`)
   - Test devices are enumerated on initialization
   - Test refresh() re-enumerates devices
   - Test deviceId is used in constraints

5. **Error Handling** (`unit-useWebcam-errors.test.ts`)
   - Test NotAllowedError sets correct error message
   - Test NotFoundError sets correct error message
   - Test OverconstrainedError sets correct error message
   - Test errors are cleared on successful operations

6. **Loading States** (`unit-useWebcam-loading.test.ts`)
   - Test isLoading is true during async operations
   - Test isLoading is false after completion

7. **Cleanup** (`unit-useWebcam-cleanup.test.ts`)
   - Test unmount stops active stream
   - Test unmount cleans up resources

### Integration Tests

All integration tests will be located in `app/tests/` with the prefix `integration-useWebcam-`:

1. **Video Element Integration** (`integration-useWebcam-video.test.ts`)
   - Test stream is assigned to video element
   - Test video element plays automatically
   - Test video element is cleared on stop

2. **Device Switching** (`integration-useWebcam-switching.test.ts`)
   - Test switching devices stops old stream
   - Test switching devices starts new stream with new device

3. **Auto-Start Flow** (`integration-useWebcam-autostart.test.ts`)
   - Test autoStart=true triggers camera access on mount
   - Test permission flow with autoStart

### Property-Based Tests

Property-based tests will use Vitest with fast-check library and be located in `app/tests/` with the prefix `property-useWebcam-`. Each correctness property will have a corresponding test that validates the property across many generated inputs.

## Future Enhancements (Out of Scope)

- Screenshot capture functionality
- Video recording capabilities
- Audio track management
- Advanced video constraints (resolution presets, frame rate control)
- Multi-camera simultaneous streaming
- Stream quality monitoring
- Bandwidth adaptation
- Face detection integration
- Custom video filters or effects
