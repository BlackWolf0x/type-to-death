import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

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
    startCalibrateOpen: () => void;
    saveCalibrateOpen: () => void;
    startCalibrateClosed: () => void;
    saveCalibrateClosed: () => void;
    resetCalibration: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const MEDIAPIPE_WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MEDIAPIPE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// MediaPipe Face Mesh landmark indices for eyes
const LEFT_EYE_INDICES = {
    left: 33,
    right: 133,
    top1: 159,
    top2: 145,
    bottom1: 160,
    bottom2: 144,
};

const RIGHT_EYE_INDICES = {
    left: 362,
    right: 263,
    top1: 386,
    top2: 374,
    bottom1: 385,
    bottom2: 380,
};

const CONSEC_FRAMES = 1;

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

function calculateEAR(landmarks: FaceLandmark[], eyeIndices: typeof LEFT_EYE_INDICES): number {
    const p1 = landmarks[eyeIndices.left];
    const p2 = landmarks[eyeIndices.right];
    const p3 = landmarks[eyeIndices.top1];
    const p4 = landmarks[eyeIndices.top2];
    const p5 = landmarks[eyeIndices.bottom1];
    const p6 = landmarks[eyeIndices.bottom2];

    if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) {
        return 0;
    }

    const vertical1 = distance(p3, p5);
    const vertical2 = distance(p4, p6);
    const horizontal = distance(p1, p2);

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

    // Calibration state
    const [isCalibrated, setIsCalibrated] = useState(false);
    const [calibrationState, setCalibrationState] = useState<'none' | 'open' | 'closed'>('none');
    const [eyesOpenEAR, setEyesOpenEAR] = useState<number | null>(null);
    const [eyesClosedEAR, setEyesClosedEAR] = useState<number | null>(null);
    const [earThreshold, setEarThreshold] = useState(0.18);

    // Refs
    const detectionRunningRef = useRef(false);
    const wasBlinkingRef = useRef(false);
    const consecutiveFramesRef = useRef(0);
    const calibrationSamplesRef = useRef<number[]>([]);

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

        // Blink detection logic
        if (avgEAR < earThreshold) {
            consecutiveFramesRef.current += 1;

            if (consecutiveFramesRef.current >= CONSEC_FRAMES) {
                setIsBlinking(true);

                // Increment counter only on transition from not blinking to blinking
                if (!wasBlinkingRef.current) {
                    setBlinkCount(prev => prev + 1);
                }
                wasBlinkingRef.current = true;
            }
        } else {
            consecutiveFramesRef.current = 0;
            setIsBlinking(false);
            wasBlinkingRef.current = false;
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

    const startCalibrateOpen = useCallback(() => {
        calibrationSamplesRef.current = [];
        setCalibrationState('open');
    }, []);

    const saveCalibrateOpen = useCallback(() => {
        if (calibrationSamplesRef.current.length === 0) {
            setError({
                code: BlinkDetectorErrorCode.CALIBRATION_NO_SAMPLES,
                message: 'No samples collected. Keep your eyes open and face visible.',
            });
            return;
        }

        const avgOpen = calibrationSamplesRef.current.reduce((a, b) => a + b, 0) / calibrationSamplesRef.current.length;
        setEyesOpenEAR(avgOpen);
        setCalibrationState('none');
        calibrationSamplesRef.current = [];

        console.log(`Eyes open EAR saved: ${avgOpen.toFixed(3)}`);
    }, []);

    const startCalibrateClosed = useCallback(() => {
        calibrationSamplesRef.current = [];
        setCalibrationState('closed');
    }, []);

    const saveCalibrateClosed = useCallback(() => {
        if (calibrationSamplesRef.current.length === 0) {
            setError({
                code: BlinkDetectorErrorCode.CALIBRATION_NO_SAMPLES,
                message: 'No samples collected. Keep your eyes closed and face visible.',
            });
            return;
        }

        const avgClosed = calibrationSamplesRef.current.reduce((a, b) => a + b, 0) / calibrationSamplesRef.current.length;
        setEyesClosedEAR(avgClosed);
        setCalibrationState('none');
        calibrationSamplesRef.current = [];

        console.log(`Eyes closed EAR saved: ${avgClosed.toFixed(3)}`);

        // Calculate threshold if we have both values
        if (eyesOpenEAR !== null) {
            // Threshold at 60% toward closed (40% open + 60% closed)
            const threshold = eyesOpenEAR * 0.4 + avgClosed * 0.6;
            setEarThreshold(threshold);
            setIsCalibrated(true);

            console.log(`Calibration complete! Open: ${eyesOpenEAR.toFixed(3)}, Closed: ${avgClosed.toFixed(3)}, Threshold: ${threshold.toFixed(3)}`);
        }
    }, [eyesOpenEAR]);

    const resetCalibration = useCallback(() => {
        setIsCalibrated(false);
        setCalibrationState('none');
        setEyesOpenEAR(null);
        setEyesClosedEAR(null);
        setEarThreshold(0.18);
        calibrationSamplesRef.current = [];
        consecutiveFramesRef.current = 0;
        wasBlinkingRef.current = false;
        setBlinkCount(0);
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
        startCalibrateOpen,
        saveCalibrateOpen,
        startCalibrateClosed,
        saveCalibrateClosed,
        resetCalibration,
    };
}
