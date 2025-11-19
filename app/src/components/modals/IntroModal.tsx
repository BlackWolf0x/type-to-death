import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface IntroModalProps {
    open: boolean;
    onClose: () => void;
}

export function IntroModal({ open, onClose }: IntroModalProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="z-50">
                <DialogHeader>
                    <DialogTitle>Welcome to Type To Death</DialogTitle>
                    <DialogDescription>
                        Intro content coming soon
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
