import { useState, useRef, useCallback, useEffect, type RefObject } from 'react';

// ============================================================================
// Error Codes
// ============================================================================

export enum WebcamErrorCode {
    // Browser/Environment Errors
    API_NOT_SUPPORTED = 'WEBCAM_API_NOT_SUPPORTED',
    REQUIRES_HTTPS = 'WEBCAM_REQUIRES_HTTPS',

    // Permission Errors
    PERMISSION_DENIED = 'WEBCAM_PERMISSION_DENIED',
    PERMISSION_DISMISSED = 'WEBCAM_PERMISSION_DISMISSED',

    // Device Errors
    DEVICE_NOT_FOUND = 'WEBCAM_DEVICE_NOT_FOUND',
    DEVICE_IN_USE = 'WEBCAM_DEVICE_IN_USE',
    DEVICE_ENUMERATION_FAILED = 'WEBCAM_DEVICE_ENUMERATION_FAILED',

    // Constraint Errors
    CONSTRAINTS_NOT_SUPPORTED = 'WEBCAM_CONSTRAINTS_NOT_SUPPORTED',

    // Stream Errors
    STREAM_START_FAILED = 'WEBCAM_STREAM_START_FAILED',
    STREAM_INTERRUPTED = 'WEBCAM_STREAM_INTERRUPTED',

    // Unknown
    UNKNOWN = 'WEBCAM_UNKNOWN',
}

// ============================================================================
// Types
// ============================================================================

export type PermissionState = 'granted' | 'denied' | 'prompt';

export interface WebcamError {
    code: WebcamErrorCode;
    message: string;
    originalError?: Error;
}

export interface UseWebcamOptions {
    deviceId?: string;
    autoStart?: boolean;
    videoConstraints?: MediaTrackConstraints;
}

export interface UseWebcamReturn {
    // State
    isStreaming: boolean;
    isLoading: boolean;
    error: WebcamError | null;
    devices: MediaDeviceInfo[];
    permissionState: PermissionState | null;
    currentDeviceId: string | null;

    // Controls
    start: () => Promise<boolean>;
    stop: () => void;
    switchDevice: (deviceId: string) => Promise<boolean>;
    refreshDevices: () => Promise<MediaDeviceInfo[]>;
    clearError: () => void;

    // Ref
    videoRef: RefObject<HTMLVideoElement | null>;
}

// ============================================================================
// Utility Functions
// ============================================================================

function isSecureContext(): boolean {
    if (typeof window === 'undefined') return false;
    return window.isSecureContext ||
        window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
}

function isMediaDevicesSupported(): boolean {
    return typeof navigator !== 'undefined' &&
        !!navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function';
}

function mapErrorToWebcamError(err: unknown): WebcamError {
    if (!(err instanceof Error)) {
        return {
            code: WebcamErrorCode.UNKNOWN,
            message: 'An unknown error occurred',
        };
    }

    const error = err as DOMException;
    const name = error.name;

    switch (name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
            return {
                code: WebcamErrorCode.PERMISSION_DENIED,
                message: 'Camera permission was denied. Please allow camera access in your browser settings.',
                originalError: error,
            };

        case 'NotFoundError':
        case 'DevicesNotFoundError':
            return {
                code: WebcamErrorCode.DEVICE_NOT_FOUND,
                message: 'No camera device was found. Please connect a camera and try again.',
                originalError: error,
            };

        case 'NotReadableError':
        case 'TrackStartError':
            return {
                code: WebcamErrorCode.DEVICE_IN_USE,
                message: 'Camera is in use by another application. Please close other apps using the camera.',
                originalError: error,
            };

        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
            return {
                code: WebcamErrorCode.CONSTRAINTS_NOT_SUPPORTED,
                message: 'Camera does not support the requested settings. Try a different camera.',
                originalError: error,
            };

        case 'AbortError':
            return {
                code: WebcamErrorCode.STREAM_INTERRUPTED,
                message: 'Camera stream was interrupted. Please try again.',
                originalError: error,
            };

        case 'SecurityError':
            return {
                code: WebcamErrorCode.REQUIRES_HTTPS,
                message: 'Camera access requires a secure connection (HTTPS).',
                originalError: error,
            };

        default:
            return {
                code: WebcamErrorCode.UNKNOWN,
                message: error.message || 'Failed to access camera',
                originalError: error,
            };
    }
}

// ============================================================================
// Hook
// ============================================================================

export function useWebcam(options: UseWebcamOptions = {}): UseWebcamReturn {
    const { deviceId, autoStart = false, videoConstraints } = options;

    // State
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<WebcamError | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
    const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Refs (to avoid stale closures)
    const videoRef = useRef<HTMLVideoElement>(null);
    const mountedRef = useRef(true);

    // ========================================================================
    // Device Enumeration
    // ========================================================================

    const refreshDevices = useCallback(async (): Promise<MediaDeviceInfo[]> => {
        if (!isMediaDevicesSupported()) {
            return [];
        }

        try {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(d => d.kind === 'videoinput');

            if (mountedRef.current) {
                setDevices(videoDevices);
            }

            return videoDevices;
        } catch (err) {
            if (mountedRef.current) {
                setError({
                    code: WebcamErrorCode.DEVICE_ENUMERATION_FAILED,
                    message: 'Failed to list available cameras',
                    originalError: err instanceof Error ? err : undefined,
                });
            }
            return [];
        }
    }, []);

    // ========================================================================
    // Permission Check
    // ========================================================================

    const checkPermission = useCallback(async (): Promise<PermissionState | null> => {
        if (typeof navigator === 'undefined' || !navigator.permissions) {
            return null;
        }

        try {
            const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
            const state = result.state as PermissionState;

            if (mountedRef.current) {
                setPermissionState(state);
            }

            return state;
        } catch {
            // Permission API not supported for camera in some browsers
            return null;
        }
    }, []);

    // ========================================================================
    // Stop Stream
    // ========================================================================

    const stop = useCallback(() => {
        setStream(currentStream => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => {
                    track.stop();
                });
            }
            return null;
        });

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        if (mountedRef.current) {
            setIsStreaming(false);
            setCurrentDeviceId(null);
        }
    }, []);

    // ========================================================================
    // Start Stream
    // ========================================================================

    const startWithDeviceId = useCallback(async (targetDeviceId?: string): Promise<boolean> => {
        // Environment checks
        if (!isMediaDevicesSupported()) {
            setError({
                code: WebcamErrorCode.API_NOT_SUPPORTED,
                message: 'Your browser does not support camera access. Please use a modern browser.',
            });
            return false;
        }

        if (!isSecureContext()) {
            setError({
                code: WebcamErrorCode.REQUIRES_HTTPS,
                message: 'Camera access requires HTTPS or localhost.',
            });
            return false;
        }

        setIsLoading(true);
        setError(null);

        // Stop existing stream
        stop();

        try {
            // Build constraints
            const constraints: MediaStreamConstraints = {
                video: targetDeviceId
                    ? { deviceId: { exact: targetDeviceId }, ...videoConstraints }
                    : videoConstraints || true,
                audio: false,
            };

            // Request stream
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);

            if (!mountedRef.current) {
                newStream.getTracks().forEach(track => track.stop());
                return false;
            }

            // Get actual device ID from track
            const videoTrack = newStream.getVideoTracks()[0];
            const actualDeviceId = videoTrack?.getSettings().deviceId || null;

            // Listen for track ending (device disconnected)
            videoTrack?.addEventListener('ended', () => {
                if (mountedRef.current) {
                    setIsStreaming(false);
                    setStream(null);
                    setError({
                        code: WebcamErrorCode.STREAM_INTERRUPTED,
                        message: 'Camera was disconnected',
                    });
                }
            });

            // Store stream in state (effect will attach to video element)
            setStream(newStream);
            setIsStreaming(true);
            setPermissionState('granted');
            setCurrentDeviceId(actualDeviceId);

            // Refresh device list (labels now available after permission)
            await refreshDevices();

            return true;
        } catch (err) {
            if (mountedRef.current) {
                const webcamError = mapErrorToWebcamError(err);
                setError(webcamError);
                setIsStreaming(false);

                if (webcamError.code === WebcamErrorCode.PERMISSION_DENIED) {
                    setPermissionState('denied');
                }
            }
            return false;
        } finally {
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [videoConstraints, stop, refreshDevices]);

    const start = useCallback(async (): Promise<boolean> => {
        return startWithDeviceId(deviceId);
    }, [deviceId, startWithDeviceId]);

    const switchDevice = useCallback(async (newDeviceId: string): Promise<boolean> => {
        return startWithDeviceId(newDeviceId);
    }, [startWithDeviceId]);

    // ========================================================================
    // Clear Error
    // ========================================================================

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // ========================================================================
    // Effects
    // ========================================================================

    // Check permission on mount
    useEffect(() => {
        checkPermission();
    }, [checkPermission]);

    // Auto-start
    useEffect(() => {
        if (autoStart) {
            start();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Attach stream to video element when stream or videoRef changes
    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {
                // Autoplay may be blocked, user interaction required
            });
        }
    }, [stream]);

    // Cleanup on unmount
    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Cleanup stream when component unmounts
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Listen for device changes
    useEffect(() => {
        if (!isMediaDevicesSupported()) return;

        const handleDeviceChange = () => {
            refreshDevices();
        };

        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
        };
    }, [refreshDevices]);

    return {
        // State
        isStreaming,
        isLoading,
        error,
        devices,
        permissionState,
        currentDeviceId,

        // Controls
        start,
        stop,
        switchDevice,
        refreshDevices,
        clearError,

        // Ref
        videoRef,
    };
}
