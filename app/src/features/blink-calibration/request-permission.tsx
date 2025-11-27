import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useBlinkCalibrationStore } from "./store";
import { Spinner } from "@/components/ui/spinner";
import { useBlinkDetector } from "@/hooks/useBlinkDetector";

export function BlinkCalibrationRequestPermission() {
    const { setSetupStep } = useBlinkCalibrationStore();
    const { startTracking, isInitialized, isStreaming, error } = useBlinkDetector();

    // Debug logging
    useEffect(() => {
        console.log('[RequestPermission] State:', { isInitialized, isStreaming, error });
    }, [isInitialized, isStreaming, error]);

    // Auto-start webcam when initialized
    useEffect(() => {
        if (isInitialized && !isStreaming) {
            console.log('[RequestPermission] Starting webcam...');
            startTracking();
        }
    }, [isInitialized, isStreaming, startTracking]);

    // Move to calibration step when webcam starts streaming
    useEffect(() => {
        if (isStreaming) {
            console.log('[RequestPermission] Webcam streaming, moving to calibration');
            setSetupStep('calibrating');
        }
    }, [isStreaming, setSetupStep]);

    // Handle errors (only after we've tried to start)
    useEffect(() => {
        if (error && isInitialized) {
            console.log('[RequestPermission] Error detected:', error);
            setSetupStep('error');
        }
    }, [error, isInitialized, setSetupStep]);

    return (
        <div className="flex flex-col items-center">
            <img src="/eyes.gif" alt="Requesting webcam access" className="w-full mix-blend-screen" />
            <Button
                disabled
                size="lg"
                className="w-max"
            >
                <Spinner />
                Awaiting Webcam Permission
            </Button>
        </div>
    );
}
