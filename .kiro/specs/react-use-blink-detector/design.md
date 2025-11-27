# Blink Detector Hook - Design

## Architecture Overview

The `useBlinkDetector` hook is a React custom hook that provides real-time blink detection using Google MediaPipe Face Landmark Detection. The architecture consists of four main layers:

1. **Webcam Management Layer** - Handles video stream acquisition via the internal `useWebcam` hook
2. **MediaPipe Integration Layer** - Initializes and manages the FaceLandmarker instance
3. **Detection Processing Layer** - Processes video frames, calculates EAR, and detects blinks
4. **Calibration Layer** - Manages user-specific calibration for personalized threshold calculation

**High-level flow:**
```
User calls startTracking()
  → useWebcam starts video stream
  → Video element becomes ready
  → requestAnimationFrame loop begins
  → Each frame: detectForVideo() → calculate EAR → detect blinks
  → Blink detected → increment blinkCount
```

## Component Structure

### 1. Hook Interface (useBlinkDetector)

**Responsibilities:**
- Expose all state and control functions to consumers
- Manage hook lifecycle and cleanup
- Coordinate between webcam, MediaPipe, and detection layers

**Dependencies:**
- `useWebcam` hook for video stream management
- `@mediapipe/tasks-vision` for face landmark detection
- React hooks (useState, useEffect, useRef, useCallback)

### 2. MediaPipe Initialization

**Responsibilities:**
- Load MediaPipe WASM runtime from CDN
- Load face landmark detection model from Google Storage
- Create and configure FaceLandmarker instance
- Handle initialization errors

**Dependencies:**
- FilesetResolver from @mediapipe/tasks-vision
- FaceLandmarker from @mediapipe/tasks-vision

### 3. Webcam Manager (Internal useWebcam)

**Responsibilities:**
- Request camera permissions
- Start/stop video stream
- Provide video element ref
- Expose streaming state

**Dependencies:**
- Browser MediaDevices API
- HTMLVideoElement

### 4. EAR Calculator

**Responsibilities:**
- Calculate Euclidean distance between 3D landmark points
- Calculate Eye Aspect Ratio for left and right eyes
- Compute average EAR

**Dependencies:**
- Face landmark data from MediaPipe

### 5. Blink Detector

**Responsibilities:**
- Track consecutive frames below threshold
- Detect blink transitions (closed → open)
- Increment blink counter
- Manage blink state

**Dependencies:**
- EAR values
- Calibration threshold
- Calibration state (isCalibrated)

### 6. Calibration Manager

**Responsibilities:**
- Collect EAR samples during calibration phases
- Calculate average open/closed EAR values
- Compute personalized threshold (40% open + 60% closed)
- Manage calibration state machine

**Dependencies:**
- EAR values from detection
- Sample collection ref

## Data Models

### Configuration Constants

```typescript
// MediaPipe eye landmark indices
const LEFT_EYE_INDICES = {
    left: 33,      // Left corner
    right: 133,    // Right corner
    top1: 159,     // Upper eyelid point 1
    top2: 145,     // Upper eyelid point 2
    bottom1: 160,  // Lower eyelid point 1
    bottom2: 144,  // Lower eyelid point 2
};

const RIGHT_EYE_INDICES = {
    left: 362,     // Left corner
    right: 263,    // Right corner
    top1: 386,     // Upper eyelid point 1
    top2: 374,     // Upper eyelid point 2
    bottom1: 385,  // Lower eyelid point 1
    bottom2: 380,  // Lower eyelid point 2
};

// Consecutive frames required for blink detection
const CONSEC_FRAMES = 1;

// MediaPipe CDN URLs
const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
```

### Runtime State

```typescript
// MediaPipe state
const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
const [isInitialized, setIsInitialized] = useState(false);
const [error, setError] = useState<string | null>(null);

// EAR values
const [leftEAR, setLeftEAR] = useState(0);
const [rightEAR, setRightEAR] = useState(0);
const [averageEAR, setAverageEAR] = useState(0);

// Blink detection state
const [isBlinking, setIsBlinking] = useState(false);
const [blinkCount, setBlinkCount] = useState(0);
const [faceLandmarks, setFaceLandmarks] = useState<any[] | null>(null);

// Calibration state
const [isCalibrated, setIsCalibrated] = useState(false);
const [calibrationState, setCalibrationState] = useState<'none' | 'open' | 'closed'>('none');
const [eyesOpenEAR, setEyesOpenEAR] = useState<number | null>(null);
const [eyesClosedEAR, setEyesClosedEAR] = useState<number | null>(null);
const [earThreshold, setEarThreshold] = useState(0.18);

// Refs for tracking
const detectionRunning = useRef(false);
const wasBlinkingRef = useRef(false);
const consecutiveFramesRef = useRef(0);
const calibrationSamplesRef = useRef<number[]>([]);

// Internal webcam instance
const webcam = useWebcam({
    video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
    },
    audio: false,
});
```

### Return Type

```typescript
// Base blink data interface
export interface BlinkData {
    leftEAR: number;
    rightEAR: number;
    averageEAR: number;
    isBlinking: boolean;
    blinkCount: number;
}

// Full hook return type extends BlinkData
export interface UseBlinkDetectorReturn extends BlinkData {
    // Controls
    startTracking: () => Promise<void>;
    stopTracking: () => void;
    resetCounter: () => void;
    
    // Initialization state
    isInitialized: boolean;
    error: string | null;
    
    // Raw data
    faceLandmarks: any[] | null;
    
    // Calibration state
    isCalibrated: boolean;
    calibrationState: 'none' | 'open' | 'closed';
    eyesOpenEAR: number | null;
    eyesClosedEAR: number | null;
    earThreshold: number;
    
    // Calibration controls
    startCalibrateOpen: () => void;
    saveCalibrateOpen: () => void;
    startCalibrateClosed: () => void;
    saveCalibrateClosed: () => void;
    resetCalibration: () => void;
    
    // Webcam
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isStreaming: boolean;
}
```

**Smarter Export Pattern:**

Instead of returning individual values, group related state and functions:

```typescript
// Option 1: Grouped exports (recommended)
return {
    // Blink data (spread from BlinkData interface)
    leftEAR,
    rightEAR,
    averageEAR,
    isBlinking,
    blinkCount,
    faceLandmarks,
    
    // Detection controls
    detection: {
        start: startTracking,
        stop: stopTracking,
        resetCounter,
        isInitialized,
        error,
    },
    
    // Calibration
    calibration: {
        isCalibrated,
        state: calibrationState,
        eyesOpenEAR,
        eyesClosedEAR,
        threshold: earThreshold,
        startOpen: startCalibrateOpen,
        saveOpen: saveCalibrateOpen,
        startClosed: startCalibrateClosed,
        saveClosed: saveCalibrateClosed,
        reset: resetCalibration,
    },
    
    // Webcam
    webcam: {
        videoRef: webcam.videoRef,
        isStreaming: webcam.isStreaming,
    },
};

// Usage:
const { leftEAR, isBlinking, detection, calibration, webcam } = useBlinkDetector();
detection.start();
calibration.startOpen();
```

**Note:** The current flat structure matches your code and is simpler for direct access. The grouped structure is more organized but requires nested access. For this spec, we'll implement the flat structure as shown in your code, but document the grouped alternative as a future enhancement.

## Core Algorithms

### 1. MediaPipe Initialization

```
On component mount:
1. Create FilesetResolver for vision tasks
   - Point to WASM CDN: https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm
2. Create FaceLandmarker with options:
   - modelAssetPath: Google Storage model URL
   - delegate: 'GPU' (for hardware acceleration)
   - runningMode: 'VIDEO' (for real-time processing)
   - numFaces: 1 (single user)
   - outputFaceBlendshapes: false
   - outputFacialTransformationMatrixes: false
3. On success:
   - Store FaceLandmarker instance
   - Set isInitialized = true
4. On failure:
   - Set error state with message
   - Log error to console
```

### 2. Euclidean Distance Calculation

```
distance(p1, p2):
  dx = p2.x - p1.x
  dy = p2.y - p1.y
  dz = p2.z - p1.z
  return sqrt(dx² + dy² + dz²)
```

### 3. Eye Aspect Ratio (EAR) Calculation

```
calculateEAR(landmarks, eyeIndices):
  // Get landmark points
  p1 = landmarks[eyeIndices.left]      // Left corner
  p2 = landmarks[eyeIndices.right]     // Right corner
  p3 = landmarks[eyeIndices.top1]      // Upper lid 1
  p4 = landmarks[eyeIndices.top2]      // Upper lid 2
  p5 = landmarks[eyeIndices.bottom1]   // Lower lid 1
  p6 = landmarks[eyeIndices.bottom2]   // Lower lid 2
  
  // Check all points exist
  if any point is null:
    return 0
  
  // Calculate vertical distances
  vertical1 = distance(p3, p5)
  vertical2 = distance(p4, p6)
  
  // Calculate horizontal distance
  horizontal = distance(p1, p2)
  
  // Apply EAR formula
  ear = (vertical1 + vertical2) / (2.0 * horizontal)
  
  return ear
```

### 4. Face Landmark Processing

```
processFaceLandmarks(result):
  // Check if face detected
  if no faceLandmarks or empty:
    set leftEAR = 0
    set rightEAR = 0
    set averageEAR = 0
    set faceLandmarks = null
    return
  
  // Get first face landmarks
  landmarks = result.faceLandmarks[0]
  set faceLandmarks = result.faceLandmarks
  
  // Calculate EAR for both eyes
  leftEarValue = calculateEAR(landmarks, LEFT_EYE_INDICES)
  rightEarValue = calculateEAR(landmarks, RIGHT_EYE_INDICES)
  avgEAR = (leftEarValue + rightEarValue) / 2.0
  
  // Update state
  set leftEAR = leftEarValue
  set rightEAR = rightEarValue
  set averageEAR = avgEAR
  
  // Collect calibration samples if in calibration mode
  if calibrationState is 'open' or 'closed':
    add avgEAR to calibrationSamplesRef
    log sample collection
  
  // Only detect blinks if calibrated
  if not isCalibrated:
    return
  
  // Blink detection logic
  if avgEAR < earThreshold:
    consecutiveFramesRef += 1
    
    if consecutiveFramesRef >= CONSEC_FRAMES:
      set isBlinking = true
      
      // Increment counter on transition
      if not wasBlinkingRef:
        increment blinkCount
        log "Blink detected!"
      
      wasBlinkingRef = true
  else:
    // Eye is open
    consecutiveFramesRef = 0
    set isBlinking = false
    wasBlinkingRef = false
```

### 5. Detection Loop

```
detectLoop():
  video = webcam.videoRef.current
  
  // Check video readiness
  if not video or video.readyState !== HAVE_ENOUGH_DATA:
    schedule next frame with requestAnimationFrame
    return
  
  currentTime = video.currentTime
  
  // Only process if video time changed
  if currentTime !== lastVideoTime:
    lastVideoTime = currentTime
    
    try:
      // Detect face landmarks
      result = faceLandmarker.detectForVideo(video, performance.now())
      processFaceLandmarks(result)
    catch error:
      log error to console
  
  // Schedule next frame
  schedule detectLoop with requestAnimationFrame
```

### 6. Calibration Workflow

```
startCalibrateOpen():
  clear calibrationSamplesRef
  set calibrationState = 'open'

saveCalibrateOpen():
  if calibrationSamplesRef is empty:
    log warning
    return
  
  // Average samples
  avgOpen = sum(calibrationSamplesRef) / length(calibrationSamplesRef)
  set eyesOpenEAR = avgOpen
  set calibrationState = 'none'
  clear calibrationSamplesRef
  log saved value

startCalibrateClosed():
  clear calibrationSamplesRef
  set calibrationState = 'closed'

saveCalibrateClosed():
  if calibrationSamplesRef is empty:
    return
  
  // Average samples
  avgClosed = sum(calibrationSamplesRef) / length(calibrationSamplesRef)
  set eyesClosedEAR = avgClosed
  set calibrationState = 'none'
  clear calibrationSamplesRef
  log saved value
  
  // Calculate threshold if both values exist
  if eyesOpenEAR is not null:
    threshold = eyesOpenEAR * 0.4 + avgClosed * 0.6
    set earThreshold = threshold
    set isCalibrated = true
    log calibration complete

resetCalibration():
  set isCalibrated = false
  set calibrationState = 'none'
  set eyesOpenEAR = null
  set eyesClosedEAR = null
  set earThreshold = 0.18
  clear calibrationSamplesRef
  set blinkCount = 0
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### P1: Euclidean Distance Correctness
**Property:** For any two 3D points p1 and p2, the calculated distance should equal sqrt((p2.x - p1.x)² + (p2.y - p1.y)² + (p2.z - p1.z)²)
**Validates: Requirements 3.3**

### P2: EAR Formula Correctness
**Property:** For any set of valid eye landmarks, the calculated EAR should equal (vertical1 + vertical2) / (2.0 * horizontal) where vertical and horizontal are Euclidean distances between the specified landmark pairs
**Validates: Requirements 3.2**

### P3: Frame Skipping When Video Not Ready
**Property:** For any video element with readyState !== HAVE_ENOUGH_DATA, frame processing should be skipped and the detection loop should continue
**Validates: Requirements 2.5, 8.4**

### P4: Blink Detection Threshold
**Property:** For any sequence of frames where averageEAR < earThreshold for CONSEC_FRAMES consecutive frames, isBlinking should become true
**Validates: Requirements 4.1**

### P5: Blink Counter Increment
**Property:** For any blink detection (isBlinking transition from false to true), blinkCount should increment by exactly 1
**Validates: Requirements 4.2**

### P6: Blink State Reset
**Property:** For any frame where averageEAR >= earThreshold, consecutiveFramesRef should be reset to 0 and isBlinking should be false
**Validates: Requirements 4.3**

### P7: No Detection Without Calibration
**Property:** For any state where isCalibrated is false, blinkCount should not change regardless of EAR values
**Validates: Requirements 4.5**

### P8: Calibration Sample Averaging
**Property:** For any non-empty array of calibration samples, the calculated average should equal the sum of all samples divided by the number of samples
**Validates: Requirements 5.4, 5.6, 10.4**

### P9: Threshold Calculation Formula
**Property:** For any eyesOpenEAR and eyesClosedEAR values, the calculated earThreshold should equal eyesOpenEAR * 0.4 + eyesClosedEAR * 0.6
**Validates: Requirements 5.7**

### P10: Frame Time Change Detection
**Property:** For any sequence of frames where video.currentTime has not changed, face detection should be skipped
**Validates: Requirements 8.3**

### P11: Calibration Sample Collection
**Property:** For any frame processed while calibrationState is 'open' or 'closed', the current averageEAR should be added to calibrationSamplesRef
**Validates: Requirements 10.1**

## Edge Cases

### E1: No Face Detected
**Scenario:** MediaPipe returns empty faceLandmarks array
**Handling:** Set all EAR values to 0, set faceLandmarks to null, continue processing next frame

### E2: Missing Landmark Points
**Scenario:** Some eye landmark indices are undefined in the landmarks array
**Handling:** Return EAR = 0 for that eye, continue processing

### E3: Empty Calibration Samples
**Scenario:** User calls saveCalibrateOpen or saveCalibrateClosed without collecting any samples
**Handling:** Log warning, return early without saving, maintain previous state

### E4: Video Element Not Ready
**Scenario:** Video element exists but readyState !== HAVE_ENOUGH_DATA
**Handling:** Skip frame processing, continue requestAnimationFrame loop

### E5: MediaPipe Initialization Failure
**Scenario:** WASM or model file fails to load from CDN
**Handling:** Set error state with descriptive message, set isInitialized = false, allow retry

### E6: Detection Error on Single Frame
**Scenario:** faceLandmarker.detectForVideo throws an error
**Handling:** Log error to console, continue processing next frame (don't crash)

### E7: Webcam Start Failure
**Scenario:** startTracking fails due to permissions or hardware issues
**Handling:** Set error state, re-throw error to caller, allow retry

## Integration Points

This is a new hook with no existing code to modify. Integration points are:

### With useWebcam Hook
- Instantiate useWebcam internally with video constraints
- Expose videoRef and isStreaming from useWebcam
- Call webcam.startWebcam() in startTracking
- Call webcam.stopWebcam() in stopTracking

### With MediaPipe
- Import FilesetResolver and FaceLandmarker from @mediapipe/tasks-vision
- Load WASM runtime from CDN on initialization
- Load model file from Google Storage on initialization
- Call detectForVideo in the detection loop

### With Consumer Components
- Consumer renders video element using videoRef
- Consumer calls startTracking to begin detection
- Consumer watches blinkCount for blink events
- Consumer uses calibration functions to personalize detection
- Consumer displays EAR values and calibration state in UI

## Performance Considerations

1. **GPU Acceleration**: MediaPipe configured with GPU delegate for hardware acceleration
2. **Frame Skipping**: Only process frames when video.currentTime changes (not every requestAnimationFrame)
3. **Single Face Detection**: Configure MediaPipe for numFaces: 1 to reduce processing
4. **Disabled Features**: Disable face blendshapes and transformation matrices to reduce computation
5. **Ref Usage**: Use refs for values that don't need to trigger re-renders (detectionRunning, wasBlinking, consecutiveFrames)
6. **Cleanup**: Cancel animation frames on unmount to prevent memory leaks
7. **Reuse FaceLandmarker**: Keep FaceLandmarker instance alive across start/stop cycles
8. **Ideal Resolution**: Request 1280x720 video (balance between quality and performance)

## Testing Strategy

### Manual Testing

Since automated tests are out of scope, manual testing should cover:

1. **Initialization**
   - Hook initializes MediaPipe successfully
   - isInitialized becomes true
   - Error handling when CDN is unavailable

2. **Webcam Integration**
   - startTracking requests camera permissions
   - Video stream displays in video element
   - stopTracking stops the stream
   - isStreaming reflects correct state

3. **EAR Calculation**
   - leftEAR, rightEAR, averageEAR update in real-time
   - Values are reasonable (typically 0.2-0.4 for open eyes, <0.15 for closed)
   - Values go to 0 when no face detected

4. **Calibration Workflow**
   - startCalibrateOpen begins sample collection
   - saveCalibrateOpen calculates and stores eyesOpenEAR
   - startCalibrateClosed begins sample collection
   - saveCalibrateClosed calculates threshold and sets isCalibrated
   - Threshold is reasonable (between open and closed values)

5. **Blink Detection**
   - Blinks are detected reliably
   - blinkCount increments on each blink
   - isBlinking reflects current state
   - No detection before calibration
   - Fast blinks are caught (CONSEC_FRAMES = 1)

6. **Edge Cases**
   - Looking away (no face) doesn't crash
   - Partial face occlusion is handled
   - Multiple rapid blinks are counted correctly
   - Squinting doesn't trigger false positives

7. **Performance**
   - No noticeable lag in video display
   - Detection runs smoothly at video framerate
   - No memory leaks during extended use

## Future Enhancements (Out of Scope)

- Automatic calibration using statistical analysis
- Persistence of calibration values to localStorage
- Configurable CONSEC_FRAMES parameter
- Callback functions for blink events
- Blink rate statistics (blinks per minute)
- Wink detection (left vs right eye)
- Adjustable sensitivity during runtime
- Mobile device optimization
- Offline model support
- Multiple face detection
