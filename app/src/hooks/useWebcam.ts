import { useState, useRef, useCallback, useEffect, type RefObject } from 'react';

// Types
export type PermissionState = 'granted' | 'denied' | 'prompt';

export interface UseWebcamOptions {
    deviceId?: string;
    autoStart?: boolean;
    videoConstraints?: MediaTrackConstraints;
}

export interface UseWebcamReturn {
    // State
    isStreaming: boolean;
    isLoading: boolean;
    error: string | null;
    devices: MediaDeviceInfo[];
    permissionState: PermissionState | null;

    // Controls
    start: () => Promise<void>;
    stop: () => void;
    refresh: () => Promise<void>;

    // Ref
    webcamRef: RefObject<HTMLVideoElement | null>;
}

export function useWebcam(options: UseWebcamOptions = {}): UseWebcamReturn {
    const { deviceId, autoStart = false, videoConstraints } = options;

    // State
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
    const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

    // Refs
    const webcamRef = useRef<HTMLVideoElement>(null);

    // Device enumeration
    const enumerateDevices = useCallback(async (): Promise<MediaDeviceInfo[]> => {
        try {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);
            return videoDevices;
        } catch (err) {
            setError('Failed to enumerate devices');
            return [];
        }
    }, []);

    // Start stream
    const start = useCallback(async () => {
        // Check if MediaDevices API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError('MediaDevices API not supported in this browser');
            return;
        }

        // Check for secure context (HTTPS or localhost)
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            setError('Camera access requires HTTPS or localhost');
            return;
        }

        setIsLoading(true);
        setError(null);

        // Stop current stream if switching devices
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            setCurrentStream(null);
        }

        try {
            // Build constraints
            const constraints: MediaStreamConstraints = {
                video: deviceId
                    ? { deviceId: { exact: deviceId }, ...videoConstraints }
                    : videoConstraints || true,
                audio: false,
            };

            // Request media stream
            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            // Store stream
            setCurrentStream(stream);
            setIsStreaming(true);
            setPermissionState('granted');

            // Assign to video element
            if (webcamRef.current) {
                webcamRef.current.srcObject = stream;
                await webcamRef.current.play();
            }

            // Enumerate devices after successful start
            await enumerateDevices();
        } catch (err: any) {
            setIsStreaming(false);

            // Handle specific error types
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setPermissionState('denied');
                setError('Camera permission denied');
            } else if (err.name === 'NotFoundError') {
                setError('No camera found');
            } else if (err.name === 'OverconstrainedError') {
                setError('Camera constraints not supported');
            } else {
                setError(err.message || 'Failed to access camera');
            }
        } finally {
            setIsLoading(false);
        }
    }, [deviceId, videoConstraints, enumerateDevices, currentStream]);

    const stop = useCallback(() => {
        // Stop all tracks
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            setCurrentStream(null);
        }

        // Clear video element
        if (webcamRef.current) {
            webcamRef.current.srcObject = null;
        }

        // Update state
        setIsStreaming(false);
        setError(null);
    }, [currentStream]);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        await enumerateDevices();
        setIsLoading(false);
    }, [enumerateDevices]);

    // Auto-start on mount
    useEffect(() => {
        if (autoStart) {
            start();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [currentStream]);

    return {
        isStreaming,
        isLoading,
        error,
        devices,
        permissionState,
        start,
        stop,
        refresh,
        webcamRef,
    };
}
