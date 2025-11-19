import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface EyeTrackingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EyeTrackingModal({ open, onOpenChange }: EyeTrackingModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
