import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function LeaderboardModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                    Leaderboard
                </button>
            </DialogTrigger>
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
