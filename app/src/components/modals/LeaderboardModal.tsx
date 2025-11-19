import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface LeaderboardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LeaderboardModal({ open, onOpenChange }: LeaderboardModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="z-50">
                <DialogHeader>
                    <DialogTitle>Leaderboard</DialogTitle>
                    <DialogDescription>
                        Leaderboard coming soon
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
