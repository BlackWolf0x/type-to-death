import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

// ============================================================================
// Suppress MediaPipe/TensorFlow INFO messages
// MediaPipe WASM logs "INFO: Created TensorFlow Lite XNNPACK delegate for CPU"
// via console methods, which Next.js dev overlay incorrectly treats as errors
// ============================================================================

if (typeof window !== 'undefined') {
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
        const message = args[0];
        if (typeof message === 'string' && message.includes('INFO:')) {
            return; // Suppress TensorFlow/MediaPipe INFO messages
        }
        originalConsoleError.apply(console, args);
    };
}

// ============================================================================
// Error Codes
// ============================================================================

export enum BlinkDetectorErrorCode {
    MEDIAPIPE_INIT_FAILED = 'BLINK_MEDIAPIPE_INIT_FAILED',
    MEDIAPIPE_WASM_LOAD_FAILED = 'BLINK_MEDIAPIPE_WASM_LOAD_FAILED',
    MEDIAPIPE_MODEL_LOAD_FAILED = 'BLINK_MEDIAPIPE_MODEL_LOAD_FAILED',
    DETECTION_FAILED = 'BLINK_DETECTION_FAILED',
    NO_FACE_DETECTED = 'BLINK_NO_FACE_DETECTED',
    CALIBRATION_NO_SAMPLES = 'BLINK_CALIBRATION_NO_SAMPLES',
    CALIBRATION_INVALID = 'BLINK_CALIBRATION_INVALID',
}

export interface BlinkDetectorError {
    code: BlinkDetectorErrorCode;
    message: string;
    originalError?: Error;
}

// ============================================================================
// Types
// ============================================================================

export interface UseBlinkDetectorOptions {
    videoRef: RefObject<HTMLVideoElement | null>;
}

export interface FaceLandmark {
    x: number;
    y: number;
    z: number;
}

export interface UseBlinkDetectorReturn {
    // State
    isInitialized: boolean;
    error: BlinkDetectorError | null;

    // Blink data
    leftEAR: number;
    rightEAR: number;
    averageEAR: number;
    isBlinking: boolean;
    blinkCount: number;
    faceDetected: boolean;
    faceLandmarks: FaceLandmark[] | null;

    // Calibration state
    isCalibrated: boolean;
    calibrationState: 'none' | 'open' | 'closed';
    eyesOpenEAR: number | null;
    eyesClosedEAR: number | null;
    earThreshold: number;

    // Controls
    resetBlinkCount: () => void;
    clearError: () => void;

    // Calibration controls
    calibrateOpen: () => void;
    calibrateClosed: () => void;
    resetCalibration: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const MEDIAPIPE_WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MEDIAPIPE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const CALIBRATION_STORAGE_KEY = 'blink-calibration';

// ============================================================================
// LocalStorage Helpers
// ============================================================================

interface StoredCalibration {
    eyesOpenEAR: number;
    eyesClosedEAR: number;
    threshold: number;
}

function loadCalibration(): StoredCalibration | null {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(CALIBRATION_STORAGE_KEY);
        if (!stored) return null;
        return JSON.parse(stored) as StoredCalibration;
    } catch {
        return null;
    }
}

function saveCalibration(data: StoredCalibration): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
        console.error('Failed to save calibration:', err);
    }
}

function clearCalibration(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(CALIBRATION_STORAGE_KEY);
    } catch (err) {
        console.error('Failed to clear calibration:', err);
    }
}

// MediaPipe Face Mesh landmark indices for eyes
// Standard 6-point EAR calculation uses:
// - 2 horizontal corner points (p1, p4)
// - 2 vertical pairs for more stable measurements (p2-p6, p3-p5)
const LEFT_EYE_INDICES = {
    // Horizontal corners
    outerCorner: 33,   // p1 - outer corner (left side)
    innerCorner: 133,  // p4 - inner corner (right side)
    // Vertical pair 1
    top1: 159,         // p2 - upper lid
    bottom1: 145,      // p6 - lower lid (opposite p2)
    // Vertical pair 2 (center points for better accuracy)
    top2: 158,         // p3 - upper lid center
    bottom2: 153,      // p5 - lower lid center (opposite p3)
};

const RIGHT_EYE_INDICES = {
    // Horizontal corners
    outerCorner: 362,  // p1 - outer corner (right side)
    innerCorner: 263,  // p4 - inner corner (left side)
    // Vertical pair 1
    top1: 386,         // p2 - upper lid
    bottom1: 374,      // p6 - lower lid (opposite p2)
    // Vertical pair 2 (center points for better accuracy)
    top2: 387,         // p3 - upper lid center
    bottom2: 373,      // p5 - lower lid center (opposite p3)
};

// Blink detection parameters
const MIN_BLINK_FRAMES = 1;      // Minimum frames eyes must be closed (prevents noise)
const MAX_BLINK_FRAMES = 30;     // Maximum frames for a blink (~500ms at 60fps) - longer = drowsiness, not blink
const REOPEN_FRAMES = 1;         // Frames eyes must be open to confirm blink completed

// ============================================================================
// Utility Functions
// ============================================================================

function distance(p1: { x: number; y: number; z: number }, p2: { x: number; y: number; z: number }): number {
    return Math.sqrt(
        Math.pow(p2.x - p1.x, 2) +
        Math.pow(p2.y - p1.y, 2) +
        Math.pow(p2.z - p1.z, 2)
    );
}

/**
 * Calculate Eye Aspect Ratio (EAR) using the standard 6-point formula:
 * EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)
 *
 * Where:
 * - p1, p4 = horizontal corners (outer, inner)
 * - p2, p6 = first vertical pair (top1, bottom1)
 * - p3, p5 = second vertical pair (top2, bottom2) - center points for stability
 */
function calculateEAR(landmarks: FaceLandmark[], eyeIndices: typeof LEFT_EYE_INDICES): number {
    // Horizontal corners
    const p1 = landmarks[eyeIndices.outerCorner];
    const p4 = landmarks[eyeIndices.innerCorner];
    // Vertical pair 1
    const p2 = landmarks[eyeIndices.top1];
    const p6 = landmarks[eyeIndices.bottom1];
    // Vertical pair 2 (center)
    const p3 = landmarks[eyeIndices.top2];
    const p5 = landmarks[eyeIndices.bottom2];

    if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) {
        return 0;
    }

    // Standard EAR formula
    const vertical1 = distance(p2, p6);  // First vertical pair
    const vertical2 = distance(p3, p5);  // Second vertical pair (center)
    const horizontal = distance(p1, p4); // Horizontal distance

    if (horizontal === 0) return 0;

    return (vertical1 + vertical2) / (2.0 * horizontal);
}

// ============================================================================
// Hook
// ============================================================================

export function useBlinkDetector(options: UseBlinkDetectorOptions): UseBlinkDetectorReturn {
    const { videoRef } = options;

    // MediaPipe state
    const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<BlinkDetectorError | null>(null);

    // Blink detection state
    const [leftEAR, setLeftEAR] = useState(0);
    const [rightEAR, setRightEAR] = useState(0);
    const [averageEAR, setAverageEAR] = useState(0);
    const [isBlinking, setIsBlinking] = useState(false);
    const [blinkCount, setBlinkCount] = useState(0);
    const [faceDetected, setFaceDetected] = useState(false);
    const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmark[] | null>(null);

    // Calibration state - initialize from localStorage
    const [isCalibrated, setIsCalibrated] = useState(() => {
        const stored = loadCalibration();
        return stored !== null;
    });
    const [calibrationState, setCalibrationState] = useState<'none' | 'open' | 'closed'>('none');
    const [eyesOpenEAR, setEyesOpenEAR] = useState<number | null>(() => {
        const stored = loadCalibration();
        return stored?.eyesOpenEAR ?? null;
    });
    const [eyesClosedEAR, setEyesClosedEAR] = useState<number | null>(() => {
        const stored = loadCalibration();
        return stored?.eyesClosedEAR ?? null;
    });
    const [earThreshold, setEarThreshold] = useState(() => {
        const stored = loadCalibration();
        return stored?.threshold ?? 0.18;
    });

    // Refs
    const detectionRunningRef = useRef(false);
    const calibrationSamplesRef = useRef<number[]>([]);
    const eyesOpenEARRef = useRef<number | null>(eyesOpenEAR);

    // Blink state machine refs
    const blinkStateRef = useRef<'open' | 'closing' | 'closed' | 'opening'>('open');
    const closedFramesRef = useRef(0);
    const openFramesRef = useRef(0);

    // ========================================================================
    // Initialize MediaPipe
    // ========================================================================

    useEffect(() => {
        let mounted = true;

        async function init() {
            try {
                console.log('Initializing MediaPipe Face Landmarker...');

                const filesetResolver = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);

                const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: MEDIAPIPE_MODEL_URL,
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numFaces: 1,
                    outputFaceBlendshapes: false,
                    outputFacialTransformationMatrixes: false,
                });

                if (mounted) {
                    setFaceLandmarker(landmarker);
                    setIsInitialized(true);
                    console.log('Blink detector initialized successfully');
                }
            } catch (err) {
                console.error('Failed to initialize blink detector:', err);
                if (mounted) {
                    const message = err instanceof Error ? err.message.toLowerCase() : '';
                    let code = BlinkDetectorErrorCode.MEDIAPIPE_INIT_FAILED;

                    if (message.includes('wasm')) {
                        code = BlinkDetectorErrorCode.MEDIAPIPE_WASM_LOAD_FAILED;
                    } else if (message.includes('model') || message.includes('fetch')) {
                        code = BlinkDetectorErrorCode.MEDIAPIPE_MODEL_LOAD_FAILED;
                    }

                    setError({
                        code,
                        message: err instanceof Error ? err.message : 'Failed to initialize',
                        originalError: err instanceof Error ? err : undefined,
                    });
                }
            }
        }

        init();

        return () => {
            mounted = false;
        };
    }, []);

    // ========================================================================
    // Process Face Landmarks
    // ========================================================================

    const processFaceLandmarks = useCallback((result: FaceLandmarkerResult) => {
        if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
            setLeftEAR(0);
            setRightEAR(0);
            setAverageEAR(0);
            setFaceLandmarks(null);
            setFaceDetected(false);
            return;
        }

        const landmarks = result.faceLandmarks[0] as FaceLandmark[];
        setFaceLandmarks(landmarks);
        setFaceDetected(true);

        // Calculate EAR for both eyes
        const leftEarValue = calculateEAR(landmarks, LEFT_EYE_INDICES);
        const rightEarValue = calculateEAR(landmarks, RIGHT_EYE_INDICES);
        const avgEAR = (leftEarValue + rightEarValue) / 2.0;

        setLeftEAR(leftEarValue);
        setRightEAR(rightEarValue);
        setAverageEAR(avgEAR);

        // Collect samples during calibration
        if (calibrationState === 'open' || calibrationState === 'closed') {
            calibrationSamplesRef.current.push(avgEAR);
        }

        // Only run blink detection if calibrated
        if (!isCalibrated) {
            return;
        }

        // Blink detection state machine
        // A valid blink: open → closing → closed (2-15 frames) → opening → open
        const eyesClosed = avgEAR < earThreshold;
        const state = blinkStateRef.current;

        if (eyesClosed) {
            openFramesRef.current = 0;
            closedFramesRef.current += 1;

            if (state === 'open' || state === 'opening') {
                blinkStateRef.current = 'closing';
            } else if (state === 'closing' && closedFramesRef.current >= MIN_BLINK_FRAMES) {
                blinkStateRef.current = 'closed';
                setIsBlinking(true);
            }

            // If eyes stay closed too long, it's not a blink (drowsiness or intentional)
            if (closedFramesRef.current > MAX_BLINK_FRAMES) {
                blinkStateRef.current = 'closed';
            }
        } else {
            // Eyes are open
            closedFramesRef.current = 0;
            openFramesRef.current += 1;

            if (state === 'closed' || state === 'closing') {
                blinkStateRef.current = 'opening';
            } else if (state === 'opening' && openFramesRef.current >= REOPEN_FRAMES) {
                // Blink completed! Eyes closed and reopened
                blinkStateRef.current = 'open';
                setIsBlinking(false);
                setBlinkCount(prev => prev + 1);
            } else if (state === 'opening') {
                // Still confirming reopen
            } else {
                blinkStateRef.current = 'open';
                setIsBlinking(false);
            }
        }
    }, [calibrationState, isCalibrated, earThreshold]);

    // ========================================================================
    // Detection Loop
    // ========================================================================

    useEffect(() => {
        if (!faceLandmarker || detectionRunningRef.current) {
            return;
        }

        detectionRunningRef.current = true;

        let animationFrameId: number;
        let lastVideoTime = -1;

        const detectLoop = () => {
            // Get video ref fresh each frame (handles callback ref timing)
            const video = videoRef.current;

            if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
                animationFrameId = requestAnimationFrame(detectLoop);
                return;
            }

            const currentTime = video.currentTime;

            if (currentTime !== lastVideoTime) {
                lastVideoTime = currentTime;

                try {
                    const result = faceLandmarker.detectForVideo(video, performance.now());
                    processFaceLandmarks(result);
                } catch (err) {
                    // Suppress TensorFlow INFO messages that MediaPipe logs as errors
                    // "INFO: Created TensorFlow Lite XNNPACK delegate for CPU"
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    if (errorMessage.includes('INFO:') || errorMessage.includes('TensorFlow')) {
                        return;
                    }
                    console.error('Detection error:', err);
                }
            }

            animationFrameId = requestAnimationFrame(detectLoop);
        };

        detectLoop();

        return () => {
            detectionRunningRef.current = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [faceLandmarker, videoRef, processFaceLandmarks]);

    // ========================================================================
    // Calibration Controls
    // ========================================================================

    const CALIBRATION_DURATION_MS = 1500; // Collect samples for 1.5 seconds

    const calibrateOpen = useCallback(() => {
        calibrationSamplesRef.current = [];
        setCalibrationState('open');

        // Auto-save after collecting samples
        setTimeout(() => {
            if (calibrationSamplesRef.current.length === 0) {
                setError({
                    code: BlinkDetectorErrorCode.CALIBRATION_NO_SAMPLES,
                    message: 'No samples collected. Keep your eyes open and face visible.',
                });
                setCalibrationState('none');
                return;
            }

            const avgOpen = calibrationSamplesRef.current.reduce((a, b) => a + b, 0) / calibrationSamplesRef.current.length;
            setEyesOpenEAR(avgOpen);
            eyesOpenEARRef.current = avgOpen;
            setCalibrationState('none');
            calibrationSamplesRef.current = [];

            console.log(`Eyes open EAR saved: ${avgOpen.toFixed(3)}`);
        }, CALIBRATION_DURATION_MS);
    }, []);

    const calibrateClosed = useCallback(() => {
        calibrationSamplesRef.current = [];
        setCalibrationState('closed');

        // Auto-save after collecting samples
        setTimeout(() => {
            if (calibrationSamplesRef.current.length === 0) {
                setError({
                    code: BlinkDetectorErrorCode.CALIBRATION_NO_SAMPLES,
                    message: 'No samples collected. Keep your eyes closed and face visible.',
                });
                setCalibrationState('none');
                return;
            }

            const avgClosed = calibrationSamplesRef.current.reduce((a, b) => a + b, 0) / calibrationSamplesRef.current.length;
            setEyesClosedEAR(avgClosed);
            setCalibrationState('none');
            calibrationSamplesRef.current = [];

            console.log(`Eyes closed EAR saved: ${avgClosed.toFixed(3)}`);

            // Calculate threshold if we have both values
            const currentOpenEAR = eyesOpenEARRef.current;
            if (currentOpenEAR !== null) {
                const gap = currentOpenEAR - avgClosed;

                // Warn if calibration seems off
                if (gap < 0.1) {
                    console.warn(`Calibration warning: Gap between open (${currentOpenEAR.toFixed(3)}) and closed (${avgClosed.toFixed(3)}) is small (${gap.toFixed(3)}). Try closing eyes more firmly during calibration.`);
                }

                // Threshold at 50% between closed and open (midpoint)
                const threshold = avgClosed + (gap * 0.5);
                setEarThreshold(threshold);
                setIsCalibrated(true);

                // Save to localStorage
                saveCalibration({
                    eyesOpenEAR: currentOpenEAR,
                    eyesClosedEAR: avgClosed,
                    threshold,
                });

                console.log(`Calibration complete! Open: ${currentOpenEAR.toFixed(3)}, Closed: ${avgClosed.toFixed(3)}, Gap: ${gap.toFixed(3)}, Threshold: ${threshold.toFixed(3)}`);
            }
        }, CALIBRATION_DURATION_MS);
    }, []);

    const resetCalibration = useCallback(() => {
        setIsCalibrated(false);
        setCalibrationState('none');
        setEyesOpenEAR(null);
        setEyesClosedEAR(null);
        setEarThreshold(0.18);
        calibrationSamplesRef.current = [];
        eyesOpenEARRef.current = null;
        blinkStateRef.current = 'open';
        closedFramesRef.current = 0;
        openFramesRef.current = 0;
        setBlinkCount(0);
        setIsBlinking(false);

        // Clear from localStorage
        clearCalibration();
    }, []);

    const resetBlinkCount = useCallback(() => {
        setBlinkCount(0);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // State
        isInitialized,
        error,

        // Blink data
        leftEAR,
        rightEAR,
        averageEAR,
        isBlinking,
        blinkCount,
        faceDetected,
        faceLandmarks,

        // Calibration state
        isCalibrated,
        calibrationState,
        eyesOpenEAR,
        eyesClosedEAR,
        earThreshold,

        // Controls
        resetBlinkCount,
        clearError,

        // Calibration controls
        calibrateOpen,
        calibrateClosed,
        resetCalibration,
    };
}
