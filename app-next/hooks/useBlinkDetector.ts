import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

// ============================================================================
// Error Codes
// ============================================================================

export enum BlinkDetectorErrorCode {
    // MediaPipe Initialization
    MEDIAPIPE_INIT_FAILED = 'BLINK_MEDIAPIPE_INIT_FAILED',
    MEDIAPIPE_WASM_LOAD_FAILED = 'BLINK_MEDIAPIPE_WASM_LOAD_FAILED',
    MEDIAPIPE_MODEL_LOAD_FAILED = 'BLINK_MEDIAPIPE_MODEL_LOAD_FAILED',

    // Detection
    DETECTION_FAILED = 'BLINK_DETECTION_FAILED',
    NO_FACE_DETECTED = 'BLINK_NO_FACE_DETECTED',

    // Calibration
    CALIBRATION_NO_SAMPLES = 'BLINK_CALIBRATION_NO_SAMPLES',
    CALIBRATION_INVALID = 'BLINK_CALIBRATION_INVALID',
}

// ============================================================================
// Types
// ============================================================================

export interface BlinkDetectorError {
    code: BlinkDetectorErrorCode;
    message: string;
    originalError?: Error;
}

export type CalibrationPhase = 'idle' | 'auto' | 'collecting-open' | 'collecting-closed';

export interface BlinkData {
    leftEAR: number;
    rightEAR: number;
    averageEAR: number;
    isBlinking: boolean;
    blinkCount: number;
    faceDetected: boolean;
}

export interface CalibrationData {
    phase: CalibrationPhase;
    eyesOpenEAR: number | null;
    eyesClosedEAR: number | null;
    threshold: number;
    isCalibrated: boolean;
    samplesCollected: number;
    autoProgress: number; // 0-100 for auto-calibration progress
}

export interface UseBlinkDetectorOptions {
    videoRef: RefObject<HTMLVideoElement | null>;
    autoStart?: boolean;
    defaultThreshold?: number;
    consecutiveFrames?: number;
}

export interface FaceLandmark {
    x: number;
    y: number;
    z: number;
}

export interface UseBlinkDetectorReturn {
    // State
    isInitialized: boolean;
    isDetecting: boolean;
    error: BlinkDetectorError | null;

    // Blink Data
    blinkData: BlinkData;

    // Face Landmarks (for drawing)
    faceLandmarks: FaceLandmark[] | null;

    // Calibration
    calibration: CalibrationData;

    // Controls
    startDetection: () => void;
    stopDetection: () => void;
    resetBlinkCount: () => void;
    clearError: () => void;

    // Calibration Controls
    startAutoCalibration: () => void;
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
// Based on: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
const LEFT_EYE = {
    leftCorner: 33,
    rightCorner: 133,
    top1: 159,
    top2: 145,
    bottom1: 160,
    bottom2: 144,
};

const RIGHT_EYE = {
    leftCorner: 362,
    rightCorner: 263,
    top1: 386,
    top2: 374,
    bottom1: 385,
    bottom2: 380,
};

const DEFAULT_THRESHOLD = 0.2;
const DEFAULT_CONSECUTIVE_FRAMES = 1;
const CALIBRATION_STORAGE_KEY = 'blink-detector-calibration';

// ============================================================================
// Storage Types & Functions
// ============================================================================

interface StoredCalibration {
    eyesOpenEAR: number;
    eyesClosedEAR: number;
    threshold: number;
    timestamp: number;
}

function saveCalibrationToStorage(data: StoredCalibration): void {
    try {
        localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
        console.error('Failed to save calibration:', err);
    }
}

function loadCalibrationFromStorage(): StoredCalibration | null {
    try {
        const stored = localStorage.getItem(CALIBRATION_STORAGE_KEY);
        if (!stored) return null;
        return JSON.parse(stored) as StoredCalibration;
    } catch (err) {
        console.error('Failed to load calibration:', err);
        return null;
    }
}

function clearCalibrationStorage(): void {
    try {
        localStorage.removeItem(CALIBRATION_STORAGE_KEY);
    } catch (err) {
        console.error('Failed to clear calibration:', err);
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

interface Point3D {
    x: number;
    y: number;
    z: number;
}

function distance3D(p1: Point3D, p2: Point3D): number {
    return Math.sqrt(
        (p2.x - p1.x) ** 2 +
        (p2.y - p1.y) ** 2 +
        (p2.z - p1.z) ** 2
    );
}

/**
 * Calculate Eye Aspect Ratio (EAR)
 * Based on: "Real-Time Eye Blink Detection using Facial Landmarks"
 * EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
 */
function calculateEAR(
    landmarks: Point3D[],
    eyeIndices: typeof LEFT_EYE
): number {
    const p1 = landmarks[eyeIndices.leftCorner];
    const p2 = landmarks[eyeIndices.rightCorner];
    const p3 = landmarks[eyeIndices.top1];
    const p4 = landmarks[eyeIndices.top2];
    const p5 = landmarks[eyeIndices.bottom1];
    const p6 = landmarks[eyeIndices.bottom2];

    if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) {
        return 0;
    }

    const vertical1 = distance3D(p3, p5);
    const vertical2 = distance3D(p4, p6);
    const horizontal = distance3D(p1, p2);

    if (horizontal === 0) return 0;

    return (vertical1 + vertical2) / (2.0 * horizontal);
}

function mapInitError(err: Error): BlinkDetectorError {
    const message = err.message.toLowerCase();

    if (message.includes('wasm')) {
        return {
            code: BlinkDetectorErrorCode.MEDIAPIPE_WASM_LOAD_FAILED,
            message: 'Failed to load WASM runtime. Check your internet connection.',
            originalError: err,
        };
    }

    if (message.includes('model') || message.includes('fetch')) {
        return {
            code: BlinkDetectorErrorCode.MEDIAPIPE_MODEL_LOAD_FAILED,
            message: 'Failed to load face detection model. Check your internet connection.',
            originalError: err,
        };
    }

    return {
        code: BlinkDetectorErrorCode.MEDIAPIPE_INIT_FAILED,
        message: 'Failed to initialize blink detection system.',
        originalError: err,
    };
}

// ============================================================================
// Hook
// ============================================================================

export function useBlinkDetector(options: UseBlinkDetectorOptions): UseBlinkDetectorReturn {
    const {
        videoRef,
        autoStart = false,
        defaultThreshold = DEFAULT_THRESHOLD,
        consecutiveFrames = DEFAULT_CONSECUTIVE_FRAMES,
    } = options;

    // Core state
    const [isInitialized, setIsInitialized] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [error, setError] = useState<BlinkDetectorError | null>(null);

    // Blink data
    const [blinkData, setBlinkData] = useState<BlinkData>({
        leftEAR: 0,
        rightEAR: 0,
        averageEAR: 0,
        isBlinking: false,
        blinkCount: 0,
        faceDetected: false,
    });

    // Face landmarks for drawing
    const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmark[] | null>(null);

    // Calibration state - initialize from localStorage if available
    const [calibration, setCalibration] = useState<CalibrationData>(() => {
        if (typeof window === 'undefined') {
            return {
                phase: 'idle',
                eyesOpenEAR: null,
                eyesClosedEAR: null,
                threshold: defaultThreshold,
                isCalibrated: false,
                samplesCollected: 0,
                autoProgress: 0,
            };
        }

        const stored = loadCalibrationFromStorage();
        if (stored) {
            return {
                phase: 'idle',
                eyesOpenEAR: stored.eyesOpenEAR,
                eyesClosedEAR: stored.eyesClosedEAR,
                threshold: stored.threshold,
                isCalibrated: true,
                samplesCollected: 0,
                autoProgress: 100,
            };
        }

        return {
            phase: 'idle',
            eyesOpenEAR: null,
            eyesClosedEAR: null,
            threshold: defaultThreshold,
            isCalibrated: false,
            samplesCollected: 0,
            autoProgress: 0,
        };
    });

    // Refs
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const mountedRef = useRef(true);
    const consecutiveFramesRef = useRef(0);
    const wasBlinkingRef = useRef(false);
    const calibrationSamplesRef = useRef<number[]>([]);
    const calibrationPhaseRef = useRef<CalibrationPhase>('idle');
    const calibrationRef = useRef(calibration);
    const blinkCountRef = useRef(0);
    const autoCalibrationStartRef = useRef<number | null>(null);
    const autoCalibrationDuration = 10000; // 10 seconds
    const consecutiveFramesOptionRef = useRef(consecutiveFrames);

    // Keep consecutiveFrames ref in sync
    useEffect(() => {
        consecutiveFramesOptionRef.current = consecutiveFrames;
    }, [consecutiveFrames]);

    // Keep refs in sync with state
    useEffect(() => {
        calibrationPhaseRef.current = calibration.phase;
        calibrationRef.current = calibration;
    }, [calibration]);

    useEffect(() => {
        blinkCountRef.current = blinkData.blinkCount;
    }, [blinkData.blinkCount]);

    // ========================================================================
    // Initialize MediaPipe
    // ========================================================================

    useEffect(() => {
        mountedRef.current = true;

        async function init() {
            try {
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

                if (mountedRef.current) {
                    faceLandmarkerRef.current = landmarker;
                    setIsInitialized(true);
                }
            } catch (err) {
                if (mountedRef.current) {
                    setError(mapInitError(err instanceof Error ? err : new Error(String(err))));
                }
            }
        }

        init();

        return () => {
            mountedRef.current = false;
            if (faceLandmarkerRef.current) {
                faceLandmarkerRef.current.close();
                faceLandmarkerRef.current = null;
            }
        };
    }, []);

    // ========================================================================
    // Process Frame (inline in detection loop to avoid stale closures)
    // ========================================================================

    const processFrame = useCallback((result: FaceLandmarkerResult) => {
        if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
            setFaceLandmarks(null);
            setBlinkData(prev => ({
                ...prev,
                leftEAR: 0,
                rightEAR: 0,
                averageEAR: 0,
                faceDetected: false,
            }));
            return;
        }

        const landmarks = result.faceLandmarks[0] as Point3D[];
        setFaceLandmarks(landmarks as FaceLandmark[]);

        const leftEAR = calculateEAR(landmarks, LEFT_EYE);
        const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
        const averageEAR = (leftEAR + rightEAR) / 2;

        // Collect calibration samples (use ref to avoid stale closure)
        const phase = calibrationPhaseRef.current;
        if (phase !== 'idle') {
            calibrationSamplesRef.current.push(averageEAR);

            if (phase === 'auto' && autoCalibrationStartRef.current) {
                const elapsed = Date.now() - autoCalibrationStartRef.current;
                const progress = Math.min(100, (elapsed / autoCalibrationDuration) * 100);

                setCalibration(prev => ({
                    ...prev,
                    samplesCollected: calibrationSamplesRef.current.length,
                    autoProgress: progress,
                }));

                // Auto-calibration complete
                if (elapsed >= autoCalibrationDuration) {
                    const samples = calibrationSamplesRef.current;

                    calibrationPhaseRef.current = 'idle';
                    autoCalibrationStartRef.current = null;

                    if (samples.length > 0) {
                        // Find max (eyes open) and min (blink) EAR values
                        const maxEAR = Math.max(...samples);
                        const minEAR = Math.min(...samples);
                        const variance = maxEAR - minEAR;

                        // Use detected values if variance exists, otherwise use defaults
                        let threshold: number;
                        let eyesOpen = maxEAR;
                        let eyesClosed = minEAR;

                        if (variance > 0.03) {
                            // Good variance - use detected values
                            threshold = maxEAR - (variance * 0.3);
                        } else {
                            // Low variance (blinks not captured) - use percentage of max
                            // Set threshold at 97% of max EAR to catch quick blinks
                            threshold = maxEAR * 0.97;
                            eyesClosed = maxEAR * 0.7;
                        }

                        saveCalibrationToStorage({
                            eyesOpenEAR: eyesOpen,
                            eyesClosedEAR: eyesClosed,
                            threshold,
                            timestamp: Date.now(),
                        });

                        calibrationSamplesRef.current = [];

                        const newCalibration = {
                            phase: 'idle' as CalibrationPhase,
                            eyesOpenEAR: eyesOpen,
                            eyesClosedEAR: eyesClosed,
                            threshold,
                            isCalibrated: true,
                            samplesCollected: 0,
                            autoProgress: 100,
                        };

                        // Update ref immediately so blink detection works right away
                        calibrationRef.current = newCalibration;
                        // Reset blink detection state for fresh start
                        consecutiveFramesRef.current = 0;
                        wasBlinkingRef.current = false;
                        blinkCountRef.current = 0;
                        setCalibration(newCalibration);

                        console.log('[BlinkDetector] Calibration complete:', {
                            threshold: newCalibration.threshold,
                            eyesOpen: newCalibration.eyesOpenEAR,
                            eyesClosed: newCalibration.eyesClosedEAR,
                        });
                    } else {
                        // No samples - reset
                        calibrationSamplesRef.current = [];
                        setCalibration(prev => ({
                            ...prev,
                            phase: 'idle',
                            autoProgress: 0,
                        }));
                    }
                }
            } else {
                setCalibration(prev => ({
                    ...prev,
                    samplesCollected: calibrationSamplesRef.current.length,
                }));
            }
        }

        // Blink detection (only if calibrated) - ALL values from refs to avoid stale closure
        const cal = calibrationRef.current;
        let isBlinking = false;
        let newBlinkCount = blinkCountRef.current;

        if (cal.isCalibrated) {
            const belowThreshold = averageEAR < cal.threshold;

            if (belowThreshold) {
                consecutiveFramesRef.current += 1;

                // Use ref for consecutiveFrames option
                if (consecutiveFramesRef.current >= consecutiveFramesOptionRef.current) {
                    isBlinking = true;

                    // Only count as new blink on transition from not-blinking to blinking
                    if (!wasBlinkingRef.current) {
                        newBlinkCount += 1;
                        blinkCountRef.current = newBlinkCount;
                    }
                    wasBlinkingRef.current = true;
                }
            } else {
                consecutiveFramesRef.current = 0;
                wasBlinkingRef.current = false;
            }
        }

        setBlinkData({
            leftEAR,
            rightEAR,
            averageEAR,
            isBlinking,
            blinkCount: newBlinkCount,
            faceDetected: true,
        });
    }, []); // No dependencies - all mutable values accessed via refs

    // ========================================================================
    // Detection Loop (useEffect-based like the working implementation)
    // ========================================================================

    useEffect(() => {
        const landmarker = faceLandmarkerRef.current;

        // Don't start if not ready
        if (!landmarker || !isDetecting) {
            return;
        }

        let animationFrameId: number;
        let lastVideoTime = -1;

        const detectLoop = () => {
            // Get video ref fresh each frame (it may be set after effect starts)
            const video = videoRef.current;

            if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
                animationFrameId = requestAnimationFrame(detectLoop);
                return;
            }

            const currentTime = video.currentTime;

            if (currentTime !== lastVideoTime) {
                lastVideoTime = currentTime;

                try {
                    const result = landmarker.detectForVideo(video, performance.now());
                    processFrame(result);
                } catch (err) {
                    console.error('Detection error:', err);
                }
            }

            animationFrameId = requestAnimationFrame(detectLoop);
        };

        detectLoop();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [videoRef, isDetecting, processFrame]);

    // ========================================================================
    // Controls
    // ========================================================================

    const startDetection = useCallback(() => {
        if (!isInitialized || isDetecting) return;
        setIsDetecting(true);
    }, [isInitialized, isDetecting]);

    const stopDetection = useCallback(() => {
        setIsDetecting(false);
    }, []);

    const resetBlinkCount = useCallback(() => {
        blinkCountRef.current = 0;
        setBlinkData(prev => ({ ...prev, blinkCount: 0 }));
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // ========================================================================
    // Calibration Controls
    // ========================================================================

    const startAutoCalibration = useCallback(() => {
        calibrationSamplesRef.current = [];
        calibrationPhaseRef.current = 'auto';
        autoCalibrationStartRef.current = Date.now();
        setCalibration(prev => ({
            ...prev,
            phase: 'auto',
            samplesCollected: 0,
            autoProgress: 0,
            eyesOpenEAR: null,
            eyesClosedEAR: null,
            isCalibrated: false,
        }));
    }, []);

    const startCalibrateOpen = useCallback(() => {
        calibrationSamplesRef.current = [];
        calibrationPhaseRef.current = 'collecting-open';
        setCalibration(prev => ({
            ...prev,
            phase: 'collecting-open',
            samplesCollected: 0,
        }));
    }, []);

    const saveCalibrateOpen = useCallback(() => {
        const samples = calibrationSamplesRef.current;

        if (samples.length === 0) {
            setError({
                code: BlinkDetectorErrorCode.CALIBRATION_NO_SAMPLES,
                message: 'No samples collected. Keep your eyes open and face visible.',
            });
            return;
        }

        const avgOpen = samples.reduce((a, b) => a + b, 0) / samples.length;

        calibrationPhaseRef.current = 'idle';
        setCalibration(prev => ({
            ...prev,
            phase: 'idle',
            eyesOpenEAR: avgOpen,
            samplesCollected: 0,
        }));

        calibrationSamplesRef.current = [];
    }, []);

    const startCalibrateClosed = useCallback(() => {
        calibrationSamplesRef.current = [];
        calibrationPhaseRef.current = 'collecting-closed';
        setCalibration(prev => ({
            ...prev,
            phase: 'collecting-closed',
            samplesCollected: 0,
        }));
    }, []);

    const saveCalibrateClosed = useCallback(() => {
        const samples = calibrationSamplesRef.current;

        if (samples.length === 0) {
            setError({
                code: BlinkDetectorErrorCode.CALIBRATION_NO_SAMPLES,
                message: 'No samples collected. Keep your eyes closed and face visible.',
            });
            return;
        }

        const avgClosed = samples.reduce((a, b) => a + b, 0) / samples.length;

        calibrationPhaseRef.current = 'idle';
        setCalibration(prev => {
            if (prev.eyesOpenEAR === null) {
                setError({
                    code: BlinkDetectorErrorCode.CALIBRATION_INVALID,
                    message: 'Please calibrate eyes open first.',
                });
                return prev;
            }

            // Threshold at 60% toward closed (balanced for real blinks)
            const threshold = prev.eyesOpenEAR * 0.4 + avgClosed * 0.6;

            // Save to localStorage
            saveCalibrationToStorage({
                eyesOpenEAR: prev.eyesOpenEAR,
                eyesClosedEAR: avgClosed,
                threshold,
                timestamp: Date.now(),
            });

            return {
                ...prev,
                phase: 'idle',
                eyesClosedEAR: avgClosed,
                threshold,
                isCalibrated: true,
                samplesCollected: 0,
            };
        });

        calibrationSamplesRef.current = [];
    }, []);

    const resetCalibration = useCallback(() => {
        calibrationSamplesRef.current = [];
        consecutiveFramesRef.current = 0;
        wasBlinkingRef.current = false;
        calibrationPhaseRef.current = 'idle';
        autoCalibrationStartRef.current = null;

        // Clear from localStorage
        clearCalibrationStorage();

        setCalibration({
            phase: 'idle',
            eyesOpenEAR: null,
            eyesClosedEAR: null,
            threshold: defaultThreshold,
            isCalibrated: false,
            samplesCollected: 0,
            autoProgress: 0,
        });

        setBlinkData(prev => ({ ...prev, blinkCount: 0, isBlinking: false }));
    }, [defaultThreshold]);

    // ========================================================================
    // Auto-start
    // ========================================================================

    useEffect(() => {
        if (autoStart && isInitialized && !isDetecting) {
            startDetection();
        }
    }, [autoStart, isInitialized, isDetecting, startDetection]);

    return {
        // State
        isInitialized,
        isDetecting,
        error,

        // Blink Data
        blinkData,

        // Face Landmarks
        faceLandmarks,

        // Calibration
        calibration,

        // Controls
        startDetection,
        stopDetection,
        resetBlinkCount,
        clearError,

        // Calibration Controls
        startAutoCalibration,
        startCalibrateOpen,
        saveCalibrateOpen,
        startCalibrateClosed,
        saveCalibrateClosed,
        resetCalibration,
    };
}
