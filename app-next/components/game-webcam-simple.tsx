'use client';

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWebcam } from "@/hooks/useWebcam";
import { useBlinkDetector } from "@/hooks/useBlinkDetector";

// Check if calibration exists in localStorage
function hasStoredCalibration(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem('blink-calibration') !== null;
    } catch {
        return false;
    }
}

// Check camera permission without prompting
async function checkCameraPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    try {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        return permission.state;
    } catch {
        return 'prompt';
    }
}

export interface BlinkData {
    isBlinking: boolean;
    blinkCount: number;
    faceDetected: boolean;
}

interface GameWebcamSimpleProps {
    onBlink: () => void;
    onReady: () => void;
    onBlinkDataChange?: (data: BlinkData) => void;
    gameStarted?: boolean;
}

export function GameWebcamSimple({ onBlink, onReady, onBlinkDataChange, gameStarted = false }: GameWebcamSimpleProps) {
    const router = useRouter();
    const hasRedirected = useRef(false);
    const hasSignaledReady = useRef(false);

    const webcam = useWebcam({ autoStart: false });
    const blink = useBlinkDetector({ videoRef: webcam.videoRef });

    // Check calibration and permission on mount
    useEffect(() => {
        if (hasRedirected.current) return;

        const checkAndStart = async () => {
            if (!hasStoredCalibration()) {
                hasRedirected.current = true;
                router.replace('/calibration');
                return;
            }

            const permissionState = await checkCameraPermission();
            if (permissionState !== 'granted') {
                hasRedirected.current = true;
                router.replace('/calibration');
                return;
            }

            webcam.start();

            if (!hasSignaledReady.current) {
                hasSignaledReady.current = true;
                onReady();
            }
        };

        checkAndStart();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Redirect on webcam error
    useEffect(() => {
        if (webcam.error && !hasRedirected.current) {
            hasRedirected.current = true;
            router.replace('/calibration');
        }
    }, [webcam.error, router]);

    // Reset blink count when game starts
    const hasResetForGame = useRef(false);
    useEffect(() => {
        if (gameStarted && !hasResetForGame.current) {
            hasResetForGame.current = true;
            blink.resetBlinkCount();
        } else if (!gameStarted) {
            hasResetForGame.current = false;
        }
    }, [gameStarted, blink]);

    // Send blink events to parent
    useEffect(() => {
        if (gameStarted && blink.isBlinking) {
            onBlink();
        }
    }, [gameStarted, blink.isBlinking, onBlink]);

    // Send blink data to parent - only when changed
    const lastBlinkDataRef = useRef({ isBlinking: false, blinkCount: -1, faceDetected: true });
    useEffect(() => {
        const newData = {
            isBlinking: blink.isBlinking,
            blinkCount: gameStarted ? blink.blinkCount : -1,
            faceDetected: blink.faceDetected,
        };

        const last = lastBlinkDataRef.current;
        if (
            last.isBlinking !== newData.isBlinking ||
            last.blinkCount !== newData.blinkCount ||
            last.faceDetected !== newData.faceDetected
        ) {
            lastBlinkDataRef.current = newData;
            onBlinkDataChange?.(newData);
        }
    }, [blink.isBlinking, blink.blinkCount, blink.faceDetected, gameStarted, onBlinkDataChange]);

    // Hidden video element - no canvas rendering, no effects
    return (
        <video
            ref={webcam.setVideoRef}
            autoPlay
            playsInline
            muted
            hidden
        />
    );
}
