'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

interface FaceDetectionWarningProps {
    faceDetected: boolean;
    enabled: boolean;
}

const COUNTDOWN_SECONDS = 5;

export function FaceDetectionWarning({ faceDetected, enabled }: FaceDetectionWarningProps) {
    const router = useRouter();
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const [showWarning, setShowWarning] = useState(false);
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Handle redirect in a separate effect to avoid setState during render
    useEffect(() => {
        if (shouldRedirect) {
            router.replace('/calibration');
        }
    }, [shouldRedirect, router]);

    // Clear interval helper
    const clearCountdownInterval = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Handle face detection state changes
    useEffect(() => {
        if (!enabled) {
            // Not in gameplay, reset everything
            setShowWarning(false);
            setCountdown(COUNTDOWN_SECONDS);
            setShouldRedirect(false);
            clearCountdownInterval();
            return;
        }

        if (!faceDetected) {
            // Face not detected, show warning and start countdown
            setShowWarning(true);

            if (!intervalRef.current) {
                intervalRef.current = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            // Countdown reached zero, trigger redirect
                            clearCountdownInterval();
                            setShouldRedirect(true);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } else {
            // Face detected, cancel countdown and hide warning
            setShowWarning(false);
            setCountdown(COUNTDOWN_SECONDS);
            setShouldRedirect(false);
            clearCountdownInterval();
        }

        return () => {
            clearCountdownInterval();
        };
    }, [faceDetected, enabled, clearCountdownInterval]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearCountdownInterval();
        };
    }, [clearCountdownInterval]);

    if (!showWarning) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-6 p-8 rounded-xl border border-red-500/50 bg-black/90 shadow-lg shadow-red-500/20 max-w-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/50">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-red-500">Face Not Detected</h2>
                    <p className="text-muted-foreground">
                        Please position your face in front of the camera to continue playing.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="text-6xl font-bold text-red-500 font-mono tabular-nums">
                        {countdown}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Redirecting to calibration in {countdown} second{countdown !== 1 ? 's' : ''}...
                    </p>
                </div>
            </div>
        </div>
    );
}
