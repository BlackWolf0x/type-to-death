'use client';

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWebcam } from "@/hooks/useWebcam";
import { useBlinkDetector } from "@/hooks/useBlinkDetector";
import { useBackgroundSegmentation } from "@/hooks/useBackgroundSegmentation";
import { useFaceOverlay } from "@/hooks/useFaceOverlay";

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
        // Permission API not supported
        return 'prompt';
    }
}

export interface BlinkData {
    isBlinking: boolean;
    blinkCount: number;
    faceDetected: boolean;
}

interface GameWebcamProps {
    onBlink: () => void;
    onReady: () => void;
    onBlinkDataChange?: (data: BlinkData) => void;
    gameStarted?: boolean;
}

export function GameWebcam({ onBlink, onReady, onBlinkDataChange, gameStarted = false }: GameWebcamProps) {
    const router = useRouter();
    const hasRedirected = useRef(false);
    const hasSignaledReady = useRef(false);
    const segmentCanvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

    // Don't auto-start webcam until we verify everything
    const webcam = useWebcam({ autoStart: false });
    const blink = useBlinkDetector({ videoRef: webcam.videoRef });

    // Background segmentation with VHS effects
    useBackgroundSegmentation({
        videoRef: webcam.videoRef,
        canvasRef: segmentCanvasRef,
        enabled: webcam.isStreaming,
        backgroundDarkness: 0.95,
        vhsEffect: true,
    });

    // Face overlay (eyes + demon horns)
    useFaceOverlay({
        canvasRef: overlayCanvasRef,
        videoRef: webcam.videoRef,
        faceLandmarks: blink.faceLandmarks,
        isBlinking: blink.isBlinking,
        enabled: webcam.isStreaming,
        showEyes: true,
        showHorns: true,
    });

    // Check calibration and permission on mount
    useEffect(() => {
        if (hasRedirected.current) return;

        const checkAndStart = async () => {
            // Check calibration first
            if (!hasStoredCalibration()) {
                hasRedirected.current = true;
                router.replace('/calibration');
                return;
            }

            // Check camera permission without prompting
            const permissionState = await checkCameraPermission();
            if (permissionState !== 'granted') {
                hasRedirected.current = true;
                router.replace('/calibration');
                return;
            }

            // Both calibration and permission OK, start webcam
            webcam.start();

            // Signal ready to parent so it can load Unity
            if (!hasSignaledReady.current) {
                hasSignaledReady.current = true;
                onReady();
            }
        };

        checkAndStart();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Redirect to calibration if webcam has an error after starting
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

    // Send blink events to parent (only when game has started)
    useEffect(() => {
        if (gameStarted && blink.isBlinking) {
            onBlink();
        }
    }, [gameStarted, blink.isBlinking, onBlink]);

    // Send blink data to parent for display
    useEffect(() => {
        onBlinkDataChange?.({
            isBlinking: blink.isBlinking,
            blinkCount: gameStarted ? blink.blinkCount : -1,
            faceDetected: blink.faceDetected,
        });
    }, [blink.isBlinking, blink.blinkCount, blink.faceDetected, gameStarted, onBlinkDataChange]);

    return (
        <div className="fixed z-50 bottom-6 right-6">
            <div className="relative w-64 aspect-video overflow-hidden rounded-lg bg-black shadow-lg shadow-red-500/30 border border-zinc-800">
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
                    ref={overlayCanvasRef}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </div>
        </div>
    );
}
