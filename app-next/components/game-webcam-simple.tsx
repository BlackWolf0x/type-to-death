'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWebcam } from "@/hooks/useWebcam";
import { useBlinkDetector } from "@/hooks/useBlinkDetector";

// Duration to block blink detection at game start (Unity intro animation)
const INTRO_DELAY_MS = 2000;

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
    const [introDelayActive, setIntroDelayActive] = useState(false);
    const blinkCountBaselineRef = useRef(0);
    const currentBlinkCountRef = useRef(0);

    const webcam = useWebcam({ autoStart: false });
    const blink = useBlinkDetector({ videoRef: webcam.videoRef });

    // In case there is a custom case to play
    const searchParams = useSearchParams()
    const caseId = searchParams.get('caseid')

    // Keep a ref of current blink count so we can read it in setTimeout
    useEffect(() => {
        currentBlinkCountRef.current = blink.blinkCount;
    }, [blink.blinkCount]);

    // Block blink detection for 2 seconds when game starts (Unity intro animation)
    // Capture baseline blink count when intro delay ends
    useEffect(() => {
        if (gameStarted) {
            setIntroDelayActive(true);
            const timer = setTimeout(() => {
                // Capture current blink count as baseline when intro ends (use ref for fresh value)
                blinkCountBaselineRef.current = currentBlinkCountRef.current;
                setIntroDelayActive(false);
            }, INTRO_DELAY_MS);
            return () => clearTimeout(timer);
        } else {
            setIntroDelayActive(false);
            blinkCountBaselineRef.current = 0;
        }
    }, [gameStarted]);

    // Check calibration and permission on mount
    useEffect(() => {
        if (hasRedirected.current) return;

        const url = !caseId ? '/calibration' : `/calibration?caseid=${caseId}`

        const checkAndStart = async () => {
            if (!hasStoredCalibration()) {
                hasRedirected.current = true;
                router.replace(url);
                return;
            }

            const permissionState = await checkCameraPermission();
            if (permissionState !== 'granted') {
                hasRedirected.current = true;
                router.replace(url);
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

    // Send blink events to parent (blocked during intro delay)
    useEffect(() => {
        if (gameStarted && !introDelayActive && blink.isBlinking) {
            onBlink();
        }
    }, [gameStarted, introDelayActive, blink.isBlinking, onBlink]);

    // Send blink data to parent - only when changed (blocked during intro delay)
    // Uses baseline to exclude blinks that occurred during intro
    const lastBlinkDataRef = useRef({ isBlinking: false, blinkCount: -1, faceDetected: true });
    useEffect(() => {
        // Show blink count only when game started AND intro delay is over
        const shouldShowBlinkCount = gameStarted && !introDelayActive;
        // Subtract baseline to get blinks since intro ended
        const adjustedBlinkCount = blink.blinkCount - blinkCountBaselineRef.current;
        const newData = {
            isBlinking: blink.isBlinking,
            blinkCount: shouldShowBlinkCount ? adjustedBlinkCount : -1,
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
    }, [blink.isBlinking, blink.blinkCount, blink.faceDetected, gameStarted, introDelayActive, onBlinkDataChange]);

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
