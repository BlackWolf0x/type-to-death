'use client';

import { useEffect } from "react";
import { useTypingGameStore } from "./store";
import { useGameStatsStore, formatTime, calculateWPM } from "@/stores/gameStatsStore";
import { TextDisplay } from "./components/TextDisplay";
import { TypingInput } from "./components/TypingInput";
import { Eye, EyeOff, Clock, Keyboard } from "lucide-react";

export { useTypingGameStore } from "./store";

export interface BlinkData {
    isBlinking: boolean;
    blinkCount: number; // -1 means show infinity
}

interface TypingGameProps {
    isVisible?: boolean;
    blinkData?: BlinkData;
}

export function TypingGame({ isVisible = false, blinkData }: TypingGameProps) {
    const loadStory = useTypingGameStore((state) => state.loadStory);
    const elapsedTime = useGameStatsStore((state) => state.elapsedTime);
    const charactersTyped = useGameStatsStore((state) => state.charactersTyped);
    const wpm = calculateWPM(charactersTyped, elapsedTime);

    useEffect(() => {
        loadStory();
    }, [loadStory]);

    return (
        <div
            className={`pointer-events-auto fixed z-10 left-1/2 -translate-x-1/2 w-5xl space-y-6 bg-black/80 rounded-tl-2xl rounded-tr-2xl pt-8 pb-6 px-8 border-2 border-red-950 border-t border-t-red-500 transition-all duration-700 ease-out ${isVisible
                ? '-bottom-1'
                : '-bottom-full'
                }`}
        >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[calc(100%-60px)] h-px animate-pulse bg-linear-to-r from-red-400/50 to-red-500 -rotate-1" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[calc(100%-150px)] h-px animate-pulse bg-linear-to-r from-red-400/50 to-red-500 rotate-1" />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] h-px animate-pulse bg-linear-to-r from-red-400/50 to-red-500" />

            {/* Stats bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Blink status indicator */}
                    {blinkData && (
                        <div className="flex items-center gap-2 rounded-lg bg-black/60 px-4 py-2 text-white">
                            {blinkData.isBlinking ? (
                                <EyeOff className="h-5 w-5 text-yellow-400" />
                            ) : (
                                <Eye className="h-5 w-5 text-green-400" />
                            )}
                            <span>Blinks: {blinkData.blinkCount === -1 ? '∞' : blinkData.blinkCount}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* WPM */}
                    <div className="flex items-center gap-2 rounded-lg bg-black/60 px-4 py-2 text-white">
                        <Keyboard className="h-5 w-5 text-purple-400" />
                        <span>{wpm} WPM</span>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-2 rounded-lg bg-black/60 px-4 py-2 text-white">
                        <Clock className="h-5 w-5 text-blue-400" />
                        <span>{formatTime(elapsedTime)}</span>
                    </div>

                    {/* Accuracy */}

                </div>
            </div>

            <TextDisplay />
            <TypingInput />
        </div>
    );
}
