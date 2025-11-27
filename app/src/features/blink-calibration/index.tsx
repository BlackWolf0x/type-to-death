import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBlinkCalibrationStore } from "./store";
import { BlinkCalibrationRequestPermission } from "./request-permission";
import { BlinkCalibrationRequestError } from "./request-error";

export function BlinkCalibration() {

    const { setupStep, reset } = useBlinkCalibrationStore();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio('/calibration.mp3');
    }, []);

    const handleOpenChange = (open: boolean) => {
        if (open) {
            // Reset to initial state when opening
            reset();

            // Play sound
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(err => console.error('Failed to play sound:', err));
            }
        }
    };


    return (
        <Dialog onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="lg">
                    Calibrate Eye Tracker
                </Button>
            </DialogTrigger>

            <DialogContent className={`${setupStep !== "calibrating" ? 'sm:max-w-xl' : 'sm:max-w-7xl'}`}>
                <DialogHeader>
                    <DialogTitle className="text-center">
                        {setupStep === "requestPermission" && 'Requesting Webcam Permission'}
                        {setupStep === "calibrating" && 'Blink Detection Calibration'}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {setupStep === "requestPermission" && 'Please allow your webcam to continue with calibration'}
                        {/* Calibrate the blink detector to your eyes for accurate detection */}
                    </DialogDescription>
                </DialogHeader>

                {setupStep === 'requestPermission' && <BlinkCalibrationRequestPermission />}
                {setupStep === 'error' && <BlinkCalibrationRequestError />}
            </DialogContent>

        </Dialog>
    )
}