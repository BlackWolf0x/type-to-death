import { Input } from "@/components/ui/input";
import { useAutoFocus } from "@/hooks/useAutoFocus";
import { useTypingGameStore } from "../store";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function TypingInput() {
    // Use individual selectors to avoid creating new objects on every render
    const inputValue = useTypingGameStore((state) => state.inputValue);
    const hasError = useTypingGameStore((state) => state.hasError);
    const errorCount = useTypingGameStore((state) => state.errorCount);
    const isAllComplete = useTypingGameStore((state) => state.isAllComplete);
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
        const newValue = e.target.value;
        setInputValue(newValue);

        // After validation, ensure input field shows only the valid prefix
        // This happens automatically through the store update and re-render
        // The store will update currentCharIndex to the matching length
        // and we'll trim the input on the next render if needed
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const currentWord = words[currentWordIndex];
        const isWordFullyTyped = inputValue === currentWord;
        const isLastWord = currentWordIndex === words.length - 1;

        // Handle Space key
        if (e.key === ' ') {
            // Check if the word is fully typed correctly
            if (isWordFullyTyped && !hasError) {
                // Word is complete and correct - advance to next word
                e.preventDefault();
                handleSpaceOrEnter();
            }
            // Otherwise, allow space to be typed as a regular character (don't prevent default)
            // This allows spaces to be part of the input for validation
        }

        // Handle Enter key
        if (e.key === 'Enter') {
            e.preventDefault(); // Always prevent default Enter behavior

            // Only advance if on last word and word is fully typed correctly (no errors)
            if (isLastWord && isWordFullyTyped && !hasError) {
                handleSpaceOrEnter();
            }
            // If there are errors or word not complete, do nothing
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        // Prevent paste to ensure users must type manually
        e.preventDefault();
        toast.error('Pasting is not allowed. You must type manually!');
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
            onPaste={handlePaste}
            className={cn(
                "pointer-events-auto font-mono focus-visible:border-orange-100",
                hasError && "border-red-500"
            )}
        />
    );
}
