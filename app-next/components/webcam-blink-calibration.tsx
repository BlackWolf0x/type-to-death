'use client';

import { useEffect } from 'react';
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
    CheckCircle2,
    RotateCcw,
    Play,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface WebcamBlinkCalibrationProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isStreaming: boolean;
    onCalibrationComplete?: () => void;
    onSkip?: () => void;
    showSkipButton?: boolean;
}

// ============================================================================
// Error UI Mapping
// ============================================================================

interface ErrorUIContent {
    title: string;
    description: string;
    canRetry: boolean;
}

function getErrorUI(error: BlinkDetectorError): ErrorUIContent {
    switch (error.code) {
        case BlinkDetectorErrorCode.MEDIAPIPE_INIT_FAILED:
            return {
                title: 'Failed to Initialize',
                description:
                    'The blink detection system failed to load. Please refresh the page.',
                canRetry: true,
            };

        case BlinkDetectorErrorCode.MEDIAPIPE_WASM_LOAD_FAILED:
            return {
                title: 'Failed to Load Runtime',
                description:
                    'Could not load the detection runtime. Check your internet connection.',
                canRetry: true,
            };

        case BlinkDetectorErrorCode.MEDIAPIPE_MODEL_LOAD_FAILED:
            return {
                title: 'Failed to Load Model',
                description:
                    'Could not load the face detection model. Check your internet connection.',
                canRetry: true,
            };

        case BlinkDetectorErrorCode.CALIBRATION_NO_SAMPLES:
            return {
                title: 'No Samples Collected',
                description:
                    'Make sure your face is visible and well-lit, then try again.',
                canRetry: true,
            };

        case BlinkDetectorErrorCode.CALIBRATION_INVALID:
            return {
                title: 'Calibration Error',
                description: 'Please complete the eyes open calibration first.',
                canRetry: true,
            };

        default:
            return {
                title: 'Error',
                description: error.message || 'An unexpected error occurred.',
                canRetry: true,
            };
    }
}

// ============================================================================
// Component
// ============================================================================

export function WebcamBlinkCalibration({
    videoRef,
    isStreaming,
    onCalibrationComplete,
    onSkip,
    showSkipButton = false,
}: WebcamBlinkCalibrationProps) {
    const {
        isInitialized,
        isDetecting,
        error,
        blinkData,
        calibration,
        startDetection,
        clearError,
        startCalibrateOpen,
        saveCalibrateOpen,
        startCalibrateClosed,
        saveCalibrateClosed,
        resetCalibration,
    } = useBlinkDetector({ videoRef });

    // Start detection when webcam is streaming and initialized
    useEffect(() => {
        if (isStreaming && isInitialized && !isDetecting) {
            startDetection();
        }
    }, [isStreaming, isInitialized, isDetecting, startDetection]);

    // Notify parent when calibration completes
    useEffect(() => {
        if (calibration.isCalibrated && onCalibrationComplete) {
            // Small delay to show success state
            const timer = setTimeout(() => {
                onCalibrationComplete();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [calibration.isCalibrated, onCalibrationComplete]);

    const handleRetry = () => {
        clearError();
        resetCalibration();
    };

    const errorUI = error ? getErrorUI(error) : null;
    const isLoading = !isInitialized;

    // Already calibrated - show success
    if (calibration.isCalibrated) {
        return (
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        Calibration Complete
                    </CardTitle>
                    <CardDescription className="text-base">
                        Your blink detection is ready to use.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Video Preview */}
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover"
                        />
                        {/* Blink indicator */}
                        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-sm text-white">
                            {blinkData.isBlinking ? (
                                <EyeOff className="h-4 w-4 text-yellow-400" />
                            ) : (
                                <Eye className="h-4 w-4 text-green-400" />
                            )}
                            Blinks: {blinkData.blinkCount}
                        </div>
                        {/* Face detection indicator */}
                        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                            <span
                                className={`h-2 w-2 rounded-full ${blinkData.faceDetected ? 'bg-green-500' : 'bg-red-500'}`}
                            />
                            {blinkData.faceDetected ? 'Face detected' : 'No face'}
                        </div>
                    </div>

                    {/* Calibration Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                            <div className="font-medium text-zinc-500">
                                Eyes Open
                            </div>
                            <div className="text-lg font-bold">
                                {calibration.eyesOpenEAR?.toFixed(3) || '-'}
                            </div>
                        </div>
                        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                            <div className="font-medium text-zinc-500">
                                Eyes Closed
                            </div>
                            <div className="text-lg font-bold">
                                {calibration.eyesClosedEAR?.toFixed(3) || '-'}
                            </div>
                        </div>
                        <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                            <div className="font-medium text-zinc-500">
                                Threshold
                            </div>
                            <div className="text-lg font-bold">
                                {calibration.threshold.toFixed(3)}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            onClick={resetCalibration}
                            variant="outline"
                            className="gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Recalibrate
                        </Button>
                        {onCalibrationComplete && (
                            <Button
                                onClick={onCalibrationComplete}
                                className="flex-1 gap-2"
                            >
                                <Play className="h-4 w-4" />
                                Continue
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <Eye className="h-6 w-6" />
                    Blink Calibration
                </CardTitle>
                <CardDescription className="text-base">
                    We need to calibrate blink detection for your eyes. This
                    only takes a few seconds.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Error State */}
                {error && errorUI && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{errorUI.title}</AlertTitle>
                        <AlertDescription>
                            {errorUI.description}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                        <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Loading blink detection...
                        </p>
                    </div>
                )}

                {/* Calibration UI */}
                {!isLoading && isStreaming && (
                    <>
                        {/* Video Preview */}
                        <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="h-full w-full object-cover"
                            />
                            {/* Face detection indicator */}
                            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                                <span
                                    className={`h-2 w-2 rounded-full ${blinkData.faceDetected ? 'bg-green-500' : 'bg-red-500'}`}
                                />
                                {blinkData.faceDetected
                                    ? 'Face detected'
                                    : 'No face'}
                            </div>
                            {/* EAR value */}
                            <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
                                EAR: {blinkData.averageEAR.toFixed(3)}
                            </div>
                            {/* Calibration phase indicator */}
                            {calibration.phase !== 'idle' && (
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                    <div className="text-center text-white">
                                        <div className="text-lg font-bold">
                                            {calibration.phase ===
                                                'collecting-open'
                                                ? 'Keep your eyes OPEN'
                                                : 'Keep your eyes CLOSED'}
                                        </div>
                                        <div className="text-sm opacity-80">
                                            Samples: {calibration.samplesCollected}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Calibration Steps */}
                        <div className="space-y-4">
                            {/* Step 1: Eyes Open */}
                            <div
                                className={`rounded-lg border p-4 ${calibration.eyesOpenEAR !== null
                                    ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
                                    : 'border-zinc-200 dark:border-zinc-800'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${calibration.eyesOpenEAR !== null
                                                ? 'bg-green-600 text-white'
                                                : 'bg-zinc-200 dark:bg-zinc-700'
                                                }`}
                                        >
                                            {calibration.eyesOpenEAR !== null ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                                '1'
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                Eyes Open
                                            </div>
                                            <div className="text-sm text-zinc-500">
                                                {calibration.eyesOpenEAR !== null
                                                    ? `Recorded: ${calibration.eyesOpenEAR.toFixed(3)}`
                                                    : 'Look at the camera with eyes wide open'}
                                            </div>
                                        </div>
                                    </div>
                                    {calibration.eyesOpenEAR === null && (
                                        <div className="flex gap-2">
                                            {calibration.phase ===
                                                'collecting-open' ? (
                                                <Button
                                                    onClick={saveCalibrateOpen}
                                                    size="sm"
                                                >
                                                    Save
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={startCalibrateOpen}
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={
                                                        !blinkData.faceDetected
                                                    }
                                                >
                                                    Start
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 2: Eyes Closed */}
                            <div
                                className={`rounded-lg border p-4 ${calibration.eyesClosedEAR !== null
                                    ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
                                    : calibration.eyesOpenEAR === null
                                        ? 'border-zinc-200 opacity-50 dark:border-zinc-800'
                                        : 'border-zinc-200 dark:border-zinc-800'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${calibration.eyesClosedEAR !==
                                                null
                                                ? 'bg-green-600 text-white'
                                                : 'bg-zinc-200 dark:bg-zinc-700'
                                                }`}
                                        >
                                            {calibration.eyesClosedEAR !==
                                                null ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                                '2'
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                Eyes Closed
                                            </div>
                                            <div className="text-sm text-zinc-500">
                                                {calibration.eyesClosedEAR !==
                                                    null
                                                    ? `Recorded: ${calibration.eyesClosedEAR.toFixed(3)}`
                                                    : 'Close your eyes gently'}
                                            </div>
                                        </div>
                                    </div>
                                    {calibration.eyesOpenEAR !== null &&
                                        calibration.eyesClosedEAR === null && (
                                            <div className="flex gap-2">
                                                {calibration.phase ===
                                                    'collecting-closed' ? (
                                                    <Button
                                                        onClick={
                                                            saveCalibrateClosed
                                                        }
                                                        size="sm"
                                                    >
                                                        Save
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={
                                                            startCalibrateClosed
                                                        }
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={
                                                            !blinkData.faceDetected
                                                        }
                                                    >
                                                        Start
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {(calibration.eyesOpenEAR !== null || error) && (
                                <Button
                                    onClick={handleRetry}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Reset
                                </Button>
                            )}
                            {showSkipButton && onSkip && (
                                <Button
                                    onClick={onSkip}
                                    variant="ghost"
                                    className="ml-auto"
                                >
                                    Skip for now
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
