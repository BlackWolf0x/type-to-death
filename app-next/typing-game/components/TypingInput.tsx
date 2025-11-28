'use client';

import { useEffect, useRef } from "react";
import { useTypingGameStore } from "../store";
import { cn } from "@/lib/utils";

export function TypingInput() {
    const inputValue = useTypingGameStore((state) => state.inputValue);
    const hasError = useTypingGameStore((state) => state.hasError);
    const errorCount = useTypingGameStore((state) => state.errorCount);
    const isStoryComplete = useTypingGameStore((state) => state.isStoryComplete);
    const currentWordIndex = useTypingGameStore((state) => state.currentWordIndex);
    const words = useTypingGameStore((state) => state.words);

    const setInputValue = useTypingGameStore((state) => state.setInputValue);
    const handleSpaceOrEnter = useTypingGameStore((state) => state.handleSpaceOrEnter);

    const inputRef = useRef<HTMLInputElement>(null);
    const shakeRef = useRef<HTMLInputElement>(null);

    // Auto-focus on mount and refocus on click anywhere
    useEffect(() => {
        inputRef.current?.focus();

        const handleClick = () => {
            inputRef.current?.focus();
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // Retrigger shake animation when errorCount changes
    useEffect(() => {
        if (hasError && shakeRef.current) {
            shakeRef.current.classList.remove('animate-shake');
            void shakeRef.current.offsetWidth;
            shakeRef.current.classList.add('animate-shake');
        }
    }, [errorCount, hasError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const currentWord = words[currentWordIndex];
        const isWordFullyTyped = inputValue === currentWord;
        const isLastWord = currentWordIndex === words.length - 1;

        if (e.key === ' ') {
            if (isWordFullyTyped && !hasError) {
                e.preventDefault();
                handleSpaceOrEnter();
            }
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            if (isLastWord && isWordFullyTyped && !hasError) {
                handleSpaceOrEnter();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
    };

    if (isStoryComplete) {
        return null;
    }

    return (
        <input
            ref={(el) => {
                inputRef.current = el;
                shakeRef.current = el;
            }}
            type="text"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className={cn(
                "w-full h-9 rounded-md border bg-transparent px-3 py-1 text-base font-mono text-white",
                "focus:outline-none focus:ring-2 focus:ring-orange-100",
                "pointer-events-auto",
                hasError && "border-red-500 focus:ring-red-500"
            )}
        />
    );
}
