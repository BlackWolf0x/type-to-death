"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Award, Trophy } from "lucide-react";
import { formatTime } from "@/stores/gameStatsStore";

export function ModalLeaderboard() {
    const highscores = useQuery(api.highscores.getHighscoresWithUsers);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="xl">
                    <Award />
                    Leaderboard
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Leaderboard
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[400px] pr-4">
                    {highscores === undefined ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-muted-foreground">Loading...</p>
                        </div>
                    ) : highscores.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-muted-foreground">No scores yet. Be the first!</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {/* Header */}
                            <div className="grid grid-cols-[40px_1fr_100px_60px_60px_60px] gap-2 px-2 py-2 text-xs font-medium text-muted-foreground border-b">
                                <span>#</span>
                                <span>Player</span>
                                <span className="text-right">Score</span>
                                <span className="text-right">WPM</span>
                                <span className="text-right">Acc</span>
                                <span className="text-right">Time</span>
                            </div>

                            {/* Entries */}
                            {highscores.map((entry, index) => (
                                <div
                                    key={entry._id}
                                    className="grid grid-cols-[40px_1fr_100px_60px_60px_60px] gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted/50"
                                >
                                    <span className="font-bold text-muted-foreground">
                                        {index + 1}
                                    </span>
                                    <span className="truncate font-medium">
                                        {entry.username || "Anonymous"}
                                    </span>
                                    <span className="text-right font-mono">
                                        {Math.round(entry.score).toLocaleString()}
                                    </span>
                                    <span className="text-right font-mono text-muted-foreground">
                                        {entry.wordPerMinute.toFixed(1)}
                                    </span>
                                    <span className="text-right font-mono text-muted-foreground">
                                        {entry.accuracy.toFixed(1)}%
                                    </span>
                                    <span className="text-right font-mono text-muted-foreground">
                                        {formatTime(Math.round(entry.timeTaken))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
