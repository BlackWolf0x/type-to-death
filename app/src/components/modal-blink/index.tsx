import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { BlinkCalibrationContent } from './BlinkCalibrationContent';

export function BlinkCalibrationModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                    Blink Calibration
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto z-50">
                <DialogHeader>
                    <DialogTitle>Blink Detection Calibration</DialogTitle>
                    <DialogDescription>
                        Calibrate the blink detector to your eyes for accurate detection
                    </DialogDescription>
                </DialogHeader>

                {/* Only render content (and initialize hook) when modal is open */}
                {isOpen && <BlinkCalibrationContent />}
            </DialogContent>
        </Dialog>
    );
}
