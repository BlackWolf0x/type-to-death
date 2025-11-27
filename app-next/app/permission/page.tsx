'use client';

import { useWebcam, WebcamErrorCode, type WebcamError } from '@/hooks/useWebcam';
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
    Loader2,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Monitor,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================================================
// Error UI Mapping
// ============================================================================

interface ErrorUIContent {
    title: string;
    description: string;
    action: string;
    canRetry: boolean;
}

function getErrorUI(error: WebcamError): ErrorUIContent {
    switch (error.code) {
        case WebcamErrorCode.PERMISSION_DENIED:
            return {
                title: 'Camera Access Denied',
                description:
                    'You need to grant camera permission to play this game.',
                action: 'Click the camera icon in your browser\'s address bar and select "Allow", then try again.',
                canRetry: true,
            };

        case WebcamErrorCode.DEVICE_NOT_FOUND:
            return {
                title: 'No Camera Found',
                description: 'No camera device was detected on your system.',
                action: 'Please connect a camera and try again.',
                canRetry: true,
            };

        case WebcamErrorCode.DEVICE_IN_USE:
            return {
                title: 'Camera In Use',
                description:
                    'Your camera is being used by another application.',
                action: 'Close other apps using the camera (Zoom, Teams, Discord, etc.) and try again.',
                canRetry: true,
            };

        case WebcamErrorCode.CONSTRAINTS_NOT_SUPPORTED:
            return {
                title: 'Camera Not Compatible',
                description:
                    "Your camera doesn't support the required settings.",
                action: 'Try using a different camera or updating your camera drivers.',
                canRetry: true,
            };

        case WebcamErrorCode.API_NOT_SUPPORTED:
            return {
                title: 'Browser Not Supported',
                description: "Your browser doesn't support camera access.",
                action: 'Please use a modern browser like Chrome, Firefox, Safari, or Edge.',
                canRetry: false,
            };

        case WebcamErrorCode.REQUIRES_HTTPS:
            return {
                title: 'Secure Connection Required',
                description:
                    'Camera access requires a secure connection (HTTPS).',
                action: 'Please access this site via HTTPS or localhost.',
                canRetry: false,
            };

        case WebcamErrorCode.STREAM_INTERRUPTED:
            return {
                title: 'Camera Disconnected',
                description: 'The camera stream was interrupted unexpectedly.',
                action: 'Please check your camera connection and try again.',
                canRetry: true,
            };

        case WebcamErrorCode.DEVICE_ENUMERATION_FAILED:
            return {
                title: 'Failed to List Cameras',
                description: 'Could not retrieve the list of available cameras.',
                action: 'Please refresh the page and try again.',
                canRetry: true,
            };

        default:
            return {
                title: 'Camera Error',
                description: error.message || 'An unexpected error occurred.',
                action: 'Please try again or use a different camera.',
                canRetry: true,
            };
    }
}

// ============================================================================
// Permission Page Component
// ============================================================================

export default function PermissionPage() {
    const router = useRouter();
    const {
        isStreaming,
        isLoading,
        error,
        permissionState,
        devices,
        currentDeviceId,
        start,
        stop,
        switchDevice,
        clearError,
        videoRef,
    } = useWebcam();

    const handleRequestAccess = async () => {
        clearError();
        await start();
    };

    const handleContinue = () => {
        if (isStreaming) {
            router.push('/calibration');
        }
    };

    const handleSwitchCamera = async (deviceId: string) => {
        if (deviceId !== currentDeviceId) {
            await switchDevice(deviceId);
        }
    };

    const errorUI = error ? getErrorUI(error) : null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans dark:bg-black">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                        <Camera className="h-6 w-6" />
                        Camera Access Required
                    </CardTitle>
                    <CardDescription className="text-base">
                        This game uses your camera to detect blinks. Your camera
                        feed stays on your device and is never uploaded.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Error State */}
                    {error && errorUI && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{errorUI.title}</AlertTitle>
                            <AlertDescription className="mt-2 space-y-2">
                                <p>{errorUI.description}</p>
                                <p className="font-medium">{errorUI.action}</p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center gap-3 py-12">
                            <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Initializing camera...
                            </p>
                        </div>
                    )}

                    {/* Initial State - Request Permission */}
                    {!isStreaming && !isLoading && !error && (
                        <div className="flex flex-col items-center gap-6 py-8">
                            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                <Camera className="h-16 w-16 text-zinc-400" />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    Click the button below to grant camera
                                    access.
                                </p>
                                {permissionState === 'prompt' && (
                                    <p className="text-sm text-zinc-500">
                                        You&apos;ll see a browser prompt asking
                                        for permission.
                                    </p>
                                )}
                            </div>
                            <Button
                                onClick={handleRequestAccess}
                                size="lg"
                                className="gap-2"
                            >
                                <Camera className="h-5 w-5" />
                                Grant Camera Access
                            </Button>
                        </div>
                    )}

                    {/* Streaming State - Video Preview */}
                    {isStreaming && (
                        <div className="space-y-4">
                            {/* Video Preview */}
                            <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="h-full w-full object-cover"
                                />
                                {/* Live indicator */}
                                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                    Live
                                </div>
                            </div>

                            {/* Success Message */}
                            <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <AlertTitle className="text-green-800 dark:text-green-200">
                                    Camera Active
                                </AlertTitle>
                                <AlertDescription className="text-green-700 dark:text-green-300">
                                    Your camera is working correctly. You can
                                    proceed to calibration.
                                </AlertDescription>
                            </Alert>

                            {/* Device Selector (if multiple cameras) */}
                            {devices.length > 1 && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        <Monitor className="h-4 w-4" />
                                        Select Camera
                                    </label>
                                    <select
                                        value={currentDeviceId || ''}
                                        onChange={(e) =>
                                            handleSwitchCamera(e.target.value)
                                        }
                                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                                    >
                                        {devices.map((device) => (
                                            <option
                                                key={device.deviceId}
                                                value={device.deviceId}
                                            >
                                                {device.label ||
                                                    `Camera ${devices.indexOf(device) + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={stop}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Stop Camera
                                </Button>
                                <Button
                                    onClick={handleContinue}
                                    size="lg"
                                    className="flex-1 gap-2"
                                >
                                    Continue to Calibration
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Error State - Retry Button */}
                    {error && errorUI?.canRetry && (
                        <div className="flex justify-center">
                            <Button
                                onClick={handleRequestAccess}
                                variant="outline"
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
