import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Webcam } from "@/components/Webcam";

export function WebcamModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                    Eye Tracking Calibration
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto z-50">
                <DialogHeader>
                    <DialogTitle>Eye Tracking Calibration</DialogTitle>
                    <DialogDescription>
                        Set up your webcam for eye tracking and blink detection
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    <Webcam />
                </div>
            </DialogContent>
        </Dialog>
    );
}
