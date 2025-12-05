'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWebcam, WebcamErrorCode, type WebcamError } from '@/hooks/useWebcam';
import {
    useBlinkDetector,
    BlinkDetectorErrorCode,
    type BlinkDetectorError,
} from '@/hooks/useBlinkDetector';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    RefreshCw,
    Play,
    Webcam,
    TriangleAlert,
} from 'lucide-react';
import { VHSStatic } from '@/components/vhs-static';
import { CalibrationCard } from '@/components/calibration-card';
import { useBackgroundSegmentation } from '@/hooks/useBackgroundSegmentation';
import { useFaceOverlay } from '@/hooks/useFaceOverlay';

// ============================================================================
// Types
// ============================================================================

type PageState = 'webcam' | 'calibration' | 'ready';

// Check if calibration exists in localStorage
function hasStoredCalibration(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem('blink-calibration') !== null;
    } catch {
        return false;
    }
}

// ============================================================================
// Error UI Helpers
// ============================================================================

function getWebcamErrorUI(error: WebcamError) {
    switch (error.code) {
        case WebcamErrorCode.PERMISSION_DENIED:
            return {
                title: 'Camera Access Denied',
                description: 'Click the camera icon in your browser\'s address bar and select "Allow".',
                canRetry: true,
            };
        case WebcamErrorCode.DEVICE_NOT_FOUND:
            return {
                title: 'No Camera Found',
                description: 'Please connect a camera and try again.',
                canRetry: true,
            };
        case WebcamErrorCode.DEVICE_IN_USE:
            return {
                title: 'Camera In Use',
                description: 'Close other apps using the camera and try again.',
                canRetry: true,
            };
        case WebcamErrorCode.API_NOT_SUPPORTED:
            return {
                title: 'Browser Not Supported',
                description: 'Please use Chrome, Firefox, Safari, or Edge.',
                canRetry: false,
            };
        case WebcamErrorCode.REQUIRES_HTTPS:
            return {
                title: 'Secure Connection Required',
                description: 'Camera requires HTTPS or localhost.',
                canRetry: false,
            };
        default:
            return {
                title: 'Camera Error',
                description: error.message,
                canRetry: true,
            };
    }
}

function getBlinkErrorUI(error: BlinkDetectorError) {
    switch (error.code) {
        case BlinkDetectorErrorCode.CALIBRATION_NO_SAMPLES:
            return {
                title: 'No Samples Collected',
                description: 'Keep your face visible and well-lit, then try again.',
            };
        case BlinkDetectorErrorCode.CALIBRATION_INVALID:
            return {
                title: 'Calibration Error',
                description: 'Please complete eyes open calibration first.',
            };
        case BlinkDetectorErrorCode.MEDIAPIPE_INIT_FAILED:
        case BlinkDetectorErrorCode.MEDIAPIPE_WASM_LOAD_FAILED:
        case BlinkDetectorErrorCode.MEDIAPIPE_MODEL_LOAD_FAILED:
            return {
                title: 'Failed to Load',
                description: 'Check your internet connection and refresh.',
            };
        default:
            return {
                title: 'Error',
                description: error.message,
            };
    }
}

// ============================================================================
// Calibration Page
// ============================================================================

// Horror images that cycle on blink
const HORROR_IMAGES = [
    '/horror-images/horror1.jpg',
    '/horror-images/horror2.jpg',
    '/horror-images/horror3.jpg',
    '/horror-images/horror4.jpg',
    '/horror-images/horror5.jpg',
    '/horror-images/horror6.jpg',
    '/horror-images/horror7.jpg',
    '/horror-images/horror8.jpg',
    '/horror-images/horror9.jpg',
    '/horror-images/horror10.jpg',
];
const DEFAULT_IMAGE = '/operating-room.png';

export default function CalibrationPage() {
    const router = useRouter();
    const [pageState, setPageState] = useState<PageState>('webcam');
    const eyeCanvasRef = useRef<HTMLCanvasElement>(null);
    const segmentCanvasRef = useRef<HTMLCanvasElement>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(-1); // -1 = default image
    const prevBlinkCountRef = useRef(0);

    // Webcam hook
    const webcam = useWebcam();

    // Blink detector
    const blink = useBlinkDetector({ videoRef: webcam.videoRef });

    // Background segmentation (darken background, highlight person) - only after calibration
    useBackgroundSegmentation({
        videoRef: webcam.videoRef,
        canvasRef: segmentCanvasRef,
        enabled: webcam.isStreaming && pageState === 'ready',
        backgroundDarkness: 0.95,
        vhsEffect: true,
    });

    // Face overlay (eyes + demon horns + teeth) - only in ready state
    useFaceOverlay({
        canvasRef: eyeCanvasRef,
        videoRef: webcam.videoRef,
        faceLandmarks: blink.faceLandmarks,
        isBlinking: blink.isBlinking,
        enabled: webcam.isStreaming && pageState === 'ready',
        showEyes: true,
        showHorns: true,
        showTeeth: true,
    });

    // Auto-advance to calibration when webcam starts
    useEffect(() => {
        if (webcam.isStreaming && pageState === 'webcam') {
            // Skip to ready if already calibrated (from localStorage)
            if (hasStoredCalibration() && blink.isCalibrated) {
                setPageState('ready');
            } else {
                setPageState('calibration');
            }
        }
    }, [webcam.isStreaming, pageState, blink.isCalibrated]);

    // Auto-advance to ready when calibration completes
    useEffect(() => {
        if (blink.isCalibrated && pageState === 'calibration') {
            setPageState('ready');
        }
    }, [blink.isCalibrated, pageState]);

    // Cycle horror images on each blink (only in ready state)
    useEffect(() => {
        if (pageState === 'ready' && blink.blinkCount > prevBlinkCountRef.current) {
            setCurrentImageIndex(prev => (prev + 1) % HORROR_IMAGES.length);
        }
        prevBlinkCountRef.current = blink.blinkCount;
    }, [blink.blinkCount, pageState]);

    // Reset to default image when camera stops
    useEffect(() => {
        if (!webcam.isStreaming) {
            setCurrentImageIndex(-1);
        }
    }, [webcam.isStreaming]);



    // Draw eye landmarks on canvas during calibration (eyes only, no horns or teeth)
    useFaceOverlay({
        canvasRef: eyeCanvasRef,
        videoRef: webcam.videoRef,
        faceLandmarks: blink.faceLandmarks,
        isBlinking: blink.isBlinking,
        enabled: webcam.isStreaming && pageState === 'calibration',
        showEyes: true,
        showHorns: false,
        showTeeth: false,
    });

    const handleRequestCamera = async () => {
        webcam.clearError();
        await webcam.start();
    };

    const handleStartGame = () => {
        router.push('/play?from=calibration');
    };

    const handleRecalibrate = () => {
        blink.resetCalibration();
        setPageState('calibration');
    };

    const webcamErrorUI = webcam.error ? getWebcamErrorUI(webcam.error) : null;
    const blinkErrorUI = blink.error ? getBlinkErrorUI(blink.error) : null;


    // Instructions
    const Instructions = () => {
        return (
            <div className="flex items-center gap-6">
                <div className="border py-4 px-6 rounded-xl flex items-center justify-center gap-4 leading-tight text-muted-foreground">
                    <div className="shrink-0 bg-zinc-900 size-10 rounded-full flex items-center justify-center">
                        <TriangleAlert size={20} className='text-amber-500' />
                    </div>
                    Webcam should be around eye level.
                </div>
                <div className="border py-4 px-6 rounded-xl flex items-center justify-center gap-4 leading-tight text-muted-foreground">
                    <div className="shrink-0 bg-zinc-900 size-10 rounded-full flex items-center justify-center">
                        <TriangleAlert size={20} className='text-amber-500' />
                    </div>
                    Recalibrate if you moved or sit in a different position.
                </div>
            </div>
        )
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4 font-sans bg-black">
            {/* Background image - cycles through horror images on blink */}
            <Image
                src={currentImageIndex === -1 ? DEFAULT_IMAGE : HORROR_IMAGES[currentImageIndex]}
                alt="Background"
                fill
                className={`object-cover sepia ${!webcam.isStreaming
                    ? 'opacity-10' : 'opacity-100'
                    }`}
                priority
            />

            {/* Film grain overlay */}
            <VHSStatic />

            <Card className={`relative z-10 w-full max-w-2xl shadow-2xl shadow-red-500/50 ${!webcam.isStreaming ? 'animate-shake' : ''}`}>
                {/* WEBCAM PERMISSION STATE */}
                {pageState === 'webcam' && (
                    <>
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2 text-4xl text-red-500">
                                <Webcam />
                                Webcam Access Required
                            </CardTitle>
                            <CardDescription className="text-base">
                                This game uses your webcam to detect blinks.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {webcam.error && webcamErrorUI && (
                                <Alert variant="destructive" className='mt-8'>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>{webcamErrorUI.title}</AlertTitle>
                                    <AlertDescription>{webcamErrorUI.description}</AlertDescription>
                                </Alert>
                            )}

                            {webcam.isLoading && (
                                <div className="flex flex-col items-center gap-3 py-12">
                                    <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
                                    <p className="text-zinc-600 dark:text-zinc-400">Starting camera...</p>
                                </div>
                            )}

                            {!webcam.isStreaming && !webcam.isLoading && (
                                <div className="flex flex-col items-center gap-6 py-8">
                                    <Image src="/eyes.gif" width={400} height={320} alt='Calibration' unoptimized className="mix-blend-screen" />

                                    <Button
                                        onClick={handleRequestCamera}
                                        size="xl"
                                        variant="outlineRed"
                                        className="gap-2"
                                        disabled={webcamErrorUI?.canRetry === false}
                                    >
                                        <Webcam className="h-5 w-5" />
                                        {webcam.error ? 'Try Again' : 'Grant Webcam Access'}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </>
                )}

                {/* CALIBRATION STATE */}
                {pageState === 'calibration' && (
                    <>
                        <CardHeader className="text-center mb-8">
                            <CardTitle className="flex items-center justify-center text-4xl text-red-500">
                                Blink Calibration
                            </CardTitle>
                            <CardDescription className="text-base">
                                Calibrate blink detection for your eyes in two steps.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {blink.error && blinkErrorUI && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>{blinkErrorUI.title}</AlertTitle>
                                    <AlertDescription>{blinkErrorUI.description}</AlertDescription>
                                </Alert>
                            )}

                            {!blink.isInitialized && (
                                <div className="flex flex-col items-center gap-3 py-8">
                                    <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
                                    <p className="text-zinc-600 dark:text-zinc-400">Loading blink detection...</p>
                                </div>
                            )}

                            {blink.isInitialized && (
                                <>
                                    <Instructions />

                                    {/* Video Preview - show raw video during calibration */}
                                    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                                        <video
                                            ref={webcam.setVideoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                        <canvas
                                            ref={eyeCanvasRef}
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                                            <span className={`h-2 w-2 rounded-full ${blink.faceDetected ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {blink.faceDetected ? 'Face detected' : 'No face'}
                                        </div>
                                        <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
                                            EAR: {blink.averageEAR.toFixed(3)}
                                        </div>
                                    </div>

                                    {/* Calibration Steps */}
                                    <div className="space-y-4">
                                        <CalibrationCard
                                            step={1}
                                            title="Eyes Open"
                                            description="Keep your eyes open naturally"
                                            completedDescription={blink.eyesOpenEAR ? `Recorded: ${blink.eyesOpenEAR.toFixed(3)}` : undefined}
                                            icon={Eye}
                                            isComplete={!!blink.eyesOpenEAR}
                                            isRecording={blink.calibrationState === 'open'}
                                            recordingMessage="Keep your eyes open..."
                                            canRecord={blink.faceDetected}
                                            onRecord={blink.calibrateOpen}
                                        />
                                        <CalibrationCard
                                            step={2}
                                            title="Eyes Closed"
                                            description="Close your eyes gently"
                                            completedDescription={blink.eyesClosedEAR ? `Recorded: ${blink.eyesClosedEAR.toFixed(3)}` : undefined}
                                            disabledDescription="Complete step 1 first"
                                            icon={EyeOff}
                                            isComplete={!!blink.eyesClosedEAR}
                                            isDisabled={!blink.eyesOpenEAR}
                                            isRecording={blink.calibrationState === 'closed'}
                                            recordingMessage="Keep your eyes closed..."
                                            canRecord={blink.faceDetected}
                                            onRecord={blink.calibrateClosed}
                                        />
                                    </div>

                                    {/* Reset button */}
                                    {(blink.eyesOpenEAR || blink.error) && (
                                        <div className='flex justify-center'>
                                            <Button
                                                onClick={() => { blink.clearError(); blink.resetCalibration(); }}
                                                variant="outline"
                                                size="lg"
                                            >
                                                <RefreshCw />
                                                Start Over
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </>
                )}

                {/* READY STATE */}
                {pageState === 'ready' && (
                    <>
                        <CardHeader className="text-center mb-8">
                            <CardTitle className="flex items-center justify-center gap-2 text-4xl text-red-500">
                                Ready to Play!
                            </CardTitle>
                            <CardDescription className="text-base">
                                Calibration complete. Blink detection is active.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <Instructions />
                            <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                                <video
                                    ref={webcam.setVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="absolute inset-0 h-full w-full object-cover opacity-0"
                                />
                                <canvas
                                    ref={segmentCanvasRef}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <canvas
                                    ref={eyeCanvasRef}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-sm text-white">
                                    {blink.isBlinking ? (
                                        <EyeOff className="h-4 w-4 text-yellow-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-green-400" />
                                    )}
                                    Blinks: {blink.blinkCount}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                <div className="rounded-lg border border-zinc-900 p-3">
                                    <div className="font-medium text-zinc-500">Eyes Open</div>
                                    <div className="text-lg font-bold">{blink.eyesOpenEAR?.toFixed(3)}</div>
                                </div>
                                <div className="rounded-lg border border-zinc-900 p-3">
                                    <div className="font-medium text-zinc-500">Eyes Closed</div>
                                    <div className="text-lg font-bold">{blink.eyesClosedEAR?.toFixed(3)}</div>
                                </div>
                                <div className="rounded-lg border border-zinc-900 p-3">
                                    <div className="font-medium text-zinc-500">Threshold</div>
                                    <div className="text-lg font-bold">{blink.earThreshold.toFixed(3)}</div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button onClick={handleRecalibrate} size="xl" variant="secondary" className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Recalibrate
                                </Button>
                                <Button onClick={handleStartGame} size="xl" variant="outlineRed" className="flex-1">
                                    <Play className="h-4 w-4" />
                                    Start Game
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
