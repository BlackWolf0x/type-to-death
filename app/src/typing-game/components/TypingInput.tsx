import { Input } from "@/components/ui/input";
import { useAutoFocus } from "@/hooks/useAutoFocus";
import { useTypingGameStore } from "../store";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export function TypingInput() {
    // Use individual selectors to avoid creating new objects on every render
    const inputValue = useTypingGameStore((state) => state.inputValue);
    const hasError = useTypingGameStore((state) => state.hasError);
    const errorCount = useTypingGameStore((state) => state.errorCount);
    const isAllComplete = useTypingGameStore((state) => state.isAllComplete);
    const currentCharIndex = useTypingGameStore((state) => state.currentCharIndex);
    const currentWordIndex = useTypingGameStore((state) => state.currentWordIndex);
    const words = useTypingGameStore((state) => state.words);

    const shakeRef = useRef<HTMLInputElement>(null);

    // Actions don't cause re-renders
    const setInputValue = useTypingGameStore((state) => state.setInputValue);
    const handleSpaceOrEnter = useTypingGameStore((state) => state.handleSpaceOrEnter);

    const inputRef = useAutoFocus<HTMLInputElement>();

    // Retrigger shake animation when errorCount changes
    useEffect(() => {
        if (hasError && shakeRef.current) {
            // Remove and re-add the animation class to retrigger it
            shakeRef.current.classList.remove('animate-shake');
            // Force reflow to restart animation
            void shakeRef.current.offsetWidth;
            shakeRef.current.classList.add('animate-shake');
        }
    }, [errorCount, hasError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const currentWord = words[currentWordIndex];
        const isWordFullyTyped = currentCharIndex === currentWord?.length;
        const isLastWord = currentWordIndex === words.length - 1;

        // Handle Space key
        if (e.key === ' ') {
            // Only advance if current word is fully typed
            if (isWordFullyTyped) {
                e.preventDefault(); // Prevent space from being added to input
                handleSpaceOrEnter();
            } else {
                // Prevent space from being added if word is not complete
                e.preventDefault();
            }
        }

        // Handle Enter key
        if (e.key === 'Enter') {
            // Only advance if on last word and word is fully typed
            if (isLastWord && isWordFullyTyped) {
                e.preventDefault(); // Prevent default Enter behavior
                handleSpaceOrEnter();
            } else {
                // Prevent Enter if not on last word or word not complete
                e.preventDefault();
            }
        }
    };

    // Hide input when all challenges are complete
    if (isAllComplete) {
        return null;
    }

    return (
        <Input
            ref={(el) => {
                // Combine refs - assign to both
                if (inputRef && 'current' in inputRef) {
                    (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                }
                shakeRef.current = el;
            }}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={cn(
                "pointer-events-auto font-mono focus-visible:border-orange-100",
                hasError && "border-red-500"
            )}
        />
    );
}
