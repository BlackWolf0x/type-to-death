'use client';

import { useEffect } from "react";
import { useTypingGameStore } from "./store";
import { TextDisplay } from "./components/TextDisplay";
import { TypingInput } from "./components/TypingInput";

interface TypingGameProps {
    isVisible?: boolean;
}

export function TypingGame({ isVisible = false }: TypingGameProps) {
    const loadStory = useTypingGameStore((state) => state.loadStory);

    useEffect(() => {
        loadStory();
    }, [loadStory]);

    return (
        <div
            className={`pointer-events-auto fixed z-10 left-1/2 -translate-x-1/2 w-5xl space-y-6 bg-black/80 rounded-tl-2xl rounded-tr-2xl pt-10 pb-6 px-8 border-2 border-red-950 border-t border-t-red-500 transition-all duration-700 ease-out ${isVisible
                    ? '-bottom-1'
                    : '-bottom-full'
                }`}
        >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[calc(100%-60px)] h-px animate-pulse bg-linear-to-r from-red-400/50 to-red-500 -rotate-1" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[calc(100%-150px)] h-px animate-pulse bg-linear-to-r from-red-400/50 to-red-500 rotate-1" />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] h-px animate-pulse bg-linear-to-r from-red-400/50 to-red-500" />

            <TextDisplay />
            <TypingInput />
        </div>
    );
}
