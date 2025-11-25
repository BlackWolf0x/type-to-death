import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { useWebcam } from './useWebcam';

// Eye Aspect Ratio (EAR) - measure of eye openness
// Based on the paper "Real-Time Eye Blink Detection using Facial Landmarks"
// EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
// Where p1-p6 are eye landmark points

export interface BlinkData {
    leftEAR: number;
    rightEAR: number;
    averageEAR: number;
    isBlinking: boolean;
    blinkCount: number;
}

export interface UseBlinkDetectorReturn extends BlinkData {
    startTracking: () => Promise<void>;
    stopTracking: () => void;
    isInitialized: boolean;
    error: string | null;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isStreaming: boolean;
    resetCounter: () => void;
    faceLandmarks: any[] | null;

    // Calibration
    isCalibrated: boolean;
    calibrationState: 'none' | 'open' | 'closed';
    eyesOpenEAR: number | null;
    eyesClosedEAR: number | null;
    earThreshold: number;
    startCalibrateOpen: () => void;
    saveCalibrateOpen: () => void;
    startCalibrateClosed: () => void;
    saveCalibrateClosed: () => void;
    resetCalibration: () => void;
}

// MediaPipe Face Mesh landmark indices for eyes
const LEFT_EYE_INDICES = {
    // Horizontal corners
    left: 33,   // Left corner
    right: 133, // Right corner
    // Vertical points
    top1: 159,
    top2: 145,
    bottom1: 160,
    bottom2: 144,
};

const RIGHT_EYE_INDICES = {
    // Horizontal corners
    left: 362,  // Left corner
    right: 263, // Right corner
    // Vertical points
    top1: 386,
    top2: 374,
    bottom1: 385,
    bottom2: 380,
};

export function useBlinkDetector(): UseBlinkDetectorReturn {
    const webcam = useWebcam({
        videoConstraints: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
        },
    });

    const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Blink detection state
    const [leftEAR, setLeftEAR] = useState(0);
    const [rightEAR, setRightEAR] = useState(0);
    const [averageEAR, setAverageEAR] = useState(0);
    const [isBlinking, setIsBlinking] = useState(false);
    const [blinkCount, setBlinkCount] = useState(0);
    const [faceLandmarks, setFaceLandmarks] = useState<any[] | null>(null);

    const detectionRunning = useRef(false);
    const wasBlinkingRef = useRef(false);

    // Manual calibration system
    const [isCalibrated, setIsCalibrated] = useState(false);
    const [calibrationState, setCalibrationState] = useState<'none' | 'open' | 'closed'>('none');
    const [eyesOpenEAR, setEyesOpenEAR] = useState<number | null>(null);
    const [eyesClosedEAR, setEyesClosedEAR] = useState<number | null>(null);
    const [earThreshold, setEarThreshold] = useState(0.18);

    const CONSEC_FRAMES = 1;
    const consecutiveFramesRef = useRef(0);
    const calibrationSamplesRef = useRef<number[]>([]);

    // Initialize MediaPipe Face Landmarker
    useEffect(() => {
        let mounted = true;

        async function initializeFaceLandmarker() {
            try {
                console.log('Initializing MediaPipe Face Landmarker for blink detection...');

                const filesetResolver = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                );

                const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
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
                    setError(err instanceof Error ? err.message : 'Failed to initialize');
                }
            }
        }

        initializeFaceLandmarker();

        return () => {
            mounted = false;
        };
    }, []);

    // Calculate Euclidean distance between two points
    const distance = (p1: { x: number; y: number; z: number }, p2: { x: number; y: number; z: number }) => {
        return Math.sqrt(
            Math.pow(p2.x - p1.x, 2) +
            Math.pow(p2.y - p1.y, 2) +
            Math.pow(p2.z - p1.z, 2)
        );
    };

    // Calculate Eye Aspect Ratio (EAR)
    const calculateEAR = (landmarks: any[], eyeIndices: typeof LEFT_EYE_INDICES) => {
        const p1 = landmarks[eyeIndices.left];
        const p2 = landmarks[eyeIndices.right];
        const p3 = landmarks[eyeIndices.top1];
        const p4 = landmarks[eyeIndices.top2];
        const p5 = landmarks[eyeIndices.bottom1];
        const p6 = landmarks[eyeIndices.bottom2];

        if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) {
            return 0;
        }

        // Vertical distances
        const vertical1 = distance(p3, p5);
        const vertical2 = distance(p4, p6);

        // Horizontal distance
        const horizontal = distance(p1, p2);

        // EAR formula
        const ear = (vertical1 + vertical2) / (2.0 * horizontal);

        return ear;
    };

    // Process face landmarks to detect blinks
    const processFaceLandmarks = useCallback((result: FaceLandmarkerResult) => {
        if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
            setLeftEAR(0);
            setRightEAR(0);
            setAverageEAR(0);
            setFaceLandmarks(null);
            return;
        }

        const landmarks = result.faceLandmarks[0];
        setFaceLandmarks(result.faceLandmarks);

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
            console.log(`Collecting ${calibrationState} sample: ${avgEAR.toFixed(3)} (total: ${calibrationSamplesRef.current.length})`);
        }

        // Only run blink detection if calibrated
        if (!isCalibrated) {
            return;
        }

        // Blink detection logic
        if (avgEAR < earThreshold) {
            consecutiveFramesRef.current += 1;

            // If eye closed for enough consecutive frames, register as blinking
            if (consecutiveFramesRef.current >= CONSEC_FRAMES) {
                setIsBlinking(true);

                // Increment counter only on the transition from not blinking to blinking
                if (!wasBlinkingRef.current) {
                    setBlinkCount(prev => prev + 1);
                    console.log('Blink detected!');
                }

                wasBlinkingRef.current = true;
            }
        } else {
            // Eye is open
            consecutiveFramesRef.current = 0;
            setIsBlinking(false);
            wasBlinkingRef.current = false;
        }
    }, [calibrationState, isCalibrated, earThreshold]);

    // Main detection loop
    useEffect(() => {
        if (!faceLandmarker || !webcam.isStreaming || !webcam.webcamRef.current || detectionRunning.current) {
            return;
        }

        detectionRunning.current = true;

        let animationFrameId: number;
        let lastVideoTime = -1;

        const detectLoop = () => {
            const video = webcam.webcamRef.current;

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
            detectionRunning.current = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [faceLandmarker, webcam.isStreaming, webcam.webcamRef, processFaceLandmarks]);

    const startTracking = async () => {
        try {
            await webcam.start();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start tracking');
            throw err;
        }
    };

    const stopTracking = () => {
        webcam.stop();
    };

    const startCalibrateOpen = () => {
        calibrationSamplesRef.current = [];
        setCalibrationState('open');
    };

    const saveCalibrateOpen = () => {
        console.log(`Attempting to save eyes open. Samples collected: ${calibrationSamplesRef.current.length}`);

        if (calibrationSamplesRef.current.length === 0) {
            console.warn('No samples collected for eyes open!');
            return;
        }

        // Average the collected samples
        const avgOpen = calibrationSamplesRef.current.reduce((a, b) => a + b, 0) / calibrationSamplesRef.current.length;
        setEyesOpenEAR(avgOpen);
        setCalibrationState('none');
        calibrationSamplesRef.current = [];

        console.log(`Eyes open EAR saved: ${avgOpen.toFixed(3)}`);
    };

    const startCalibrateClosed = () => {
        calibrationSamplesRef.current = [];
        setCalibrationState('closed');
    };

    const saveCalibrateClosed = () => {
        if (calibrationSamplesRef.current.length === 0) return;

        // Average the collected samples
        const avgClosed = calibrationSamplesRef.current.reduce((a, b) => a + b, 0) / calibrationSamplesRef.current.length;
        setEyesClosedEAR(avgClosed);
        setCalibrationState('none');
        calibrationSamplesRef.current = [];

        console.log(`Eyes closed EAR saved: ${avgClosed.toFixed(3)}`);

        // If we have both open and closed values, calculate threshold
        if (eyesOpenEAR !== null) {
            // Threshold at 60% toward closed (40% open + 60% closed)
            // Balanced to catch real blinks but avoid squinting
            const threshold = eyesOpenEAR * 0.4 + avgClosed * 0.6;
            setEarThreshold(threshold);
            setIsCalibrated(true);

            console.log(`Calibration complete! Open: ${eyesOpenEAR.toFixed(3)}, Closed: ${avgClosed.toFixed(3)}, Threshold: ${threshold.toFixed(3)}`);
        }
    };

    const resetCounter = () => {
        setBlinkCount(0);
    };

    const resetCalibration = () => {
        setIsCalibrated(false);
        setCalibrationState('none');
        setEyesOpenEAR(null);
        setEyesClosedEAR(null);
        setEarThreshold(0.18);
        calibrationSamplesRef.current = [];
        setBlinkCount(0);
    };

    return {
        // Blink data
        leftEAR,
        rightEAR,
        averageEAR,
        isBlinking,
        blinkCount,
        faceLandmarks,

        // Controls
        startTracking,
        stopTracking,
        resetCounter,
        isInitialized,
        error: webcam.error || error, // Use webcam error first, fallback to local error

        // Calibration
        isCalibrated,
        calibrationState,
        eyesOpenEAR,
        eyesClosedEAR,
        earThreshold,
        startCalibrateOpen,
        saveCalibrateOpen,
        startCalibrateClosed,
        saveCalibrateClosed,
        resetCalibration,

        // Webcam
        videoRef: webcam.webcamRef,
        isStreaming: webcam.isStreaming,
    };
}
