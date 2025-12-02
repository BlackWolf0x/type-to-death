'use client';

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWebcam } from "@/hooks/useWebcam";
import { useBlinkDetector } from "@/hooks/useBlinkDetector";
import { useBackgroundSegmentation } from "@/hooks/useBackgroundSegmentation";


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

// Eye landmark indices for drawing
const LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

export interface BlinkData {
    isBlinking: boolean;
    blinkCount: number;
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
    const eyeCanvasRef = useRef<HTMLCanvasElement>(null);

    // Don't auto-start webcam until we verify everything
    const webcam = useWebcam({ autoStart: false });
    const blink = useBlinkDetector({ videoRef: webcam.videoRef });

    // Background segmentation with VHS effects (same as calibration ready state)
    useBackgroundSegmentation({
        videoRef: webcam.videoRef,
        canvasRef: segmentCanvasRef,
        enabled: webcam.isStreaming,
        backgroundDarkness: 0.95,
        vhsEffect: true,
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
                // Permission not granted, redirect to calibration
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
            // Reset the flag when game ends so it can reset again on next start
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
            blinkCount: gameStarted ? blink.blinkCount : -1, // -1 means show infinity
        });
    }, [blink.isBlinking, blink.blinkCount, gameStarted, onBlinkDataChange]);

    // Draw eye landmarks on canvas
    useEffect(() => {
        const canvas = eyeCanvasRef.current;
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

    return (
        <div className="fixed z-50 bottom-6 right-6">
            {/* Webcam container with rounded corners and shadow */}
            <div className="relative w-64 aspect-video overflow-hidden rounded-lg bg-black shadow-lg shadow-red-500/30 border border-zinc-800">
                {/* Hidden video element for processing */}
                <video
                    ref={webcam.setVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 h-full w-full object-cover opacity-0"
                />
                {/* Segmented canvas with VHS effects */}
                <canvas
                    ref={segmentCanvasRef}
                    className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Eye tracking overlay */}
                <canvas
                    ref={eyeCanvasRef}
                    className="absolute inset-0 h-full w-full object-cover"
                />

            </div>
        </div>
    );
}
