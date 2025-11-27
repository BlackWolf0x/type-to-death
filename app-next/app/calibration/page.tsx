'use client';

import { useState, useEffect, useRef } from 'react';
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
    Camera,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Play,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type PageState = 'webcam' | 'calibration' | 'ready';

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

// Eye landmark indices for drawing
const LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

export default function CalibrationPage() {
    const router = useRouter();
    const [pageState, setPageState] = useState<PageState>('webcam');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Webcam hook
    const webcam = useWebcam();

    // Blink detector
    const blink = useBlinkDetector({ videoRef: webcam.videoRef });

    // Auto-advance to calibration when webcam starts
    useEffect(() => {
        if (webcam.isStreaming && pageState === 'webcam') {
            setPageState('calibration');
        }
    }, [webcam.isStreaming, pageState]);

    // Auto-advance to ready when calibration completes
    useEffect(() => {
        if (blink.isCalibrated && pageState === 'calibration') {
            setPageState('ready');
        }
    }, [blink.isCalibrated, pageState]);

    // Draw eye landmarks on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const video = webcam.videoRef.current;
        if (!canvas || !video || !webcam.isStreaming || !blink.faceLandmarks) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        canvas.width = w;
        canvas.height = h;

        ctx.clearRect(0, 0, w, h);

        const landmarks = blink.faceLandmarks;

        const drawEyeOutline = (eyeIndices: number[], color: string) => {
            ctx.beginPath();
            eyeIndices.forEach((idx, i) => {
                const point = landmarks[idx];
                if (!point) return;
                const x = point.x * w;
                const y = point.y * h;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        };

        const eyeColor = blink.isBlinking ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 0, 0.8)';
        drawEyeOutline(LEFT_EYE_INDICES, eyeColor);
        drawEyeOutline(RIGHT_EYE_INDICES, eyeColor);
    }, [blink.faceLandmarks, webcam.isStreaming, webcam.videoRef, blink.isBlinking]);

    const handleRequestCamera = async () => {
        webcam.clearError();
        await webcam.start();
    };

    const handleStartGame = () => {
        router.push('/play');
    };

    const handleRecalibrate = () => {
        blink.resetCalibration();
        setPageState('calibration');
    };

    const webcamErrorUI = webcam.error ? getWebcamErrorUI(webcam.error) : null;
    const blinkErrorUI = blink.error ? getBlinkErrorUI(blink.error) : null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans dark:bg-black">
            <Card className="w-full max-w-2xl">
                {/* WEBCAM PERMISSION STATE */}
                {pageState === 'webcam' && (
                    <>
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                                <Camera className="h-6 w-6" />
                                Camera Access Required
                            </CardTitle>
                            <CardDescription className="text-base">
                                This game uses your camera to detect blinks.
                                Your feed stays on your device.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {webcam.error && webcamErrorUI && (
                                <Alert variant="destructive">
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
                                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                        <Camera className="h-16 w-16 text-zinc-400" />
                                    </div>
                                    <Button
                                        onClick={handleRequestCamera}
                                        size="lg"
                                        className="gap-2"
                                        disabled={webcamErrorUI?.canRetry === false}
                                    >
                                        <Camera className="h-5 w-5" />
                                        {webcam.error ? 'Try Again' : 'Grant Camera Access'}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </>
                )}

                {/* CALIBRATION STATE */}
                {pageState === 'calibration' && (
                    <>
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                                <Eye className="h-6 w-6" />
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
                                    {/* Video Preview */}
                                    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                                        <video
                                            ref={webcam.setVideoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                        <canvas
                                            ref={canvasRef}
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
                                        {/* Step 1: Eyes Open */}
                                        <div className={`rounded-lg border p-4 ${blink.eyesOpenEAR ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-zinc-200 dark:border-zinc-800'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {blink.eyesOpenEAR ? (
                                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                                    ) : (
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold dark:bg-zinc-700">1</div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium">Eyes Open</div>
                                                        <div className="text-sm text-zinc-500">
                                                            {blink.eyesOpenEAR
                                                                ? `Recorded: ${blink.eyesOpenEAR.toFixed(3)}`
                                                                : 'Keep your eyes open naturally'}
                                                        </div>
                                                    </div>
                                                </div>
                                                {!blink.eyesOpenEAR && (
                                                    <div className="flex gap-2">
                                                        {blink.calibrationState === 'open' ? (
                                                            <Button onClick={blink.saveCalibrateOpen} variant="default">
                                                                Save
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                onClick={blink.startCalibrateOpen}
                                                                variant="outline"
                                                                disabled={!blink.faceDetected}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Record
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {blink.calibrationState === 'open' && (
                                                <div className="mt-2 text-sm text-amber-600">
                                                    Recording... Keep your eyes open and click Save
                                                </div>
                                            )}
                                        </div>

                                        {/* Step 2: Eyes Closed */}
                                        <div className={`rounded-lg border p-4 ${blink.eyesClosedEAR ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-zinc-200 dark:border-zinc-800'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {blink.eyesClosedEAR ? (
                                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                                    ) : (
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold dark:bg-zinc-700">2</div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium">Eyes Closed</div>
                                                        <div className="text-sm text-zinc-500">
                                                            {blink.eyesClosedEAR
                                                                ? `Recorded: ${blink.eyesClosedEAR.toFixed(3)}`
                                                                : 'Close your eyes gently'}
                                                        </div>
                                                    </div>
                                                </div>
                                                {blink.eyesOpenEAR && !blink.eyesClosedEAR && (
                                                    <div className="flex gap-2">
                                                        {blink.calibrationState === 'closed' ? (
                                                            <Button onClick={blink.saveCalibrateClosed} variant="default">
                                                                Save
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                onClick={blink.startCalibrateClosed}
                                                                variant="outline"
                                                                disabled={!blink.faceDetected}
                                                            >
                                                                <EyeOff className="mr-2 h-4 w-4" />
                                                                Record
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {blink.calibrationState === 'closed' && (
                                                <div className="mt-2 text-sm text-amber-600">
                                                    Recording... Close your eyes and click Save
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Reset button */}
                                    {(blink.eyesOpenEAR || blink.error) && (
                                        <Button
                                            onClick={() => { blink.clearError(); blink.resetCalibration(); }}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            Start Over
                                        </Button>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </>
                )}

                {/* READY STATE */}
                {pageState === 'ready' && (
                    <>
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                Ready to Play!
                            </CardTitle>
                            <CardDescription className="text-base">
                                Calibration complete. Blink detection is active.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                                <video
                                    ref={webcam.setVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <canvas
                                    ref={canvasRef}
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
                                <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                                    <div className="font-medium text-zinc-500">Eyes Open</div>
                                    <div className="text-lg font-bold">{blink.eyesOpenEAR?.toFixed(3)}</div>
                                </div>
                                <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                                    <div className="font-medium text-zinc-500">Eyes Closed</div>
                                    <div className="text-lg font-bold">{blink.eyesClosedEAR?.toFixed(3)}</div>
                                </div>
                                <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                                    <div className="font-medium text-zinc-500">Threshold</div>
                                    <div className="text-lg font-bold">{blink.earThreshold.toFixed(3)}</div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button onClick={handleRecalibrate} variant="outline" className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Recalibrate
                                </Button>
                                <Button onClick={handleStartGame} size="lg" className="flex-1 gap-2">
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
