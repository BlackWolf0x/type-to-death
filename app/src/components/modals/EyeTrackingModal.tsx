import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function EyeTrackingModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                    Eye Tracking Calibration
                </button>
            </DialogTrigger>
            <DialogContent className="z-50">
                <DialogHeader>
                    <DialogTitle>Eye Tracking Calibration</DialogTitle>
                    <DialogDescription>
                        Eye tracking calibration coming soon
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
