import { useMemo, useRef, useLayoutEffect, useState } from "react";
import { useTypingGameStore } from "../store";

export function TextDisplay() {
    // Subscribe to words array, currentWordIndex, currentCharIndex, isChallengeComplete, isAllComplete, and hasError from store
    const words = useTypingGameStore((state) => state.words);
    const currentWordIndex = useTypingGameStore((state) => state.currentWordIndex);
    const currentCharIndex = useTypingGameStore((state) => state.currentCharIndex);
    const isChallengeComplete = useTypingGameStore((state) => state.isChallengeComplete);
    const isAllComplete = useTypingGameStore((state) => state.isAllComplete);
    const hasError = useTypingGameStore((state) => state.hasError);

    // Refs to measure character positions
    const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const [cursorLeft, setCursorLeft] = useState(0);
    const [cursorReady, setCursorReady] = useState(false);
    const prevWordIndexRef = useRef(currentWordIndex);

    // Memoize character splitting for current word to avoid re-splitting on every render
    const currentWordChars = useMemo(() => {
        if (currentWordIndex >= words.length) return [];
        return words[currentWordIndex].split('');
    }, [words, currentWordIndex]);

    // Update cursor position - use LayoutEffect to run synchronously before paint
    useLayoutEffect(() => {
        // Reset refs when word changes, but allow cursor at position 0
        if (prevWordIndexRef.current !== currentWordIndex) {
            prevWordIndexRef.current = currentWordIndex;
            charRefs.current = [];

            // If starting new word at position 0, show cursor immediately
            if (currentCharIndex === 0) {
                setCursorLeft(0);
                setCursorReady(true);
                return;
            }

            setCursorReady(false);
            return;
        }

        // Only show cursor if we're within the word bounds
        if (currentCharIndex > currentWordChars.length) {
            setCursorReady(false);
            return;
        }

        // Calculate cursor position based on current character index
        if (currentCharIndex === 0) {
            setCursorLeft(0);
            setCursorReady(true);
        } else if (currentCharIndex <= currentWordChars.length) {
            const prevChar = charRefs.current[currentCharIndex - 1];
            if (prevChar) {
                setCursorLeft(prevChar.offsetLeft + prevChar.offsetWidth);
                setCursorReady(true);
            } else {
                setCursorReady(false);
            }
        }
    }, [currentCharIndex, currentWordIndex, currentWordChars.length]);

    // If all challenges are complete, show completion message
    if (isAllComplete) {
        return (
            <div className="rounded-lg bg-linear-to-br from-green-100 to-emerald-100 border-2 border-green-500 text-black p-8 text-center">
                <div className="text-4xl mb-4">🎉</div>
                <div className="text-2xl font-bold text-green-800 mb-2">
                    Congratulations!
                </div>
                <div className="text-lg text-green-700">
                    You've completed all typing challenges!
                </div>
                <div className="mt-4 text-sm text-green-600">
                    Great job on improving your typing skills!
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Add CSS animations for cursor pulse and smooth movement */}
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.3;
                    }
                }
                
                .cursor-smooth {
                    transition: all 150ms ease-out;
                }
            `}</style>
            <div className="rounded-lg bg-orange-100 border-2 border-orange-300 text-black p-4 text-left text-lg font-mono tracking-wide">
                {words.map((word, wordIndex) => {
                    // Determine word state
                    if (wordIndex < currentWordIndex) {
                        // Completed words: all green
                        return (
                            <span key={wordIndex} className="text-green-600">
                                {word}
                                {wordIndex < words.length - 1 && ' '}
                            </span>
                        );
                    } else if (wordIndex === currentWordIndex) {
                        // Current word: render character-by-character with cursor
                        // Use memoized character array to avoid re-splitting
                        // Underline only the word characters (not trailing space)
                        return (
                            <span key={wordIndex}>
                                <span className="relative inline-block underline decoration-2 decoration-gray-800">
                                    {/* Cursor - positioned absolutely relative to word, animates smoothly */}
                                    {cursorReady && currentCharIndex <= currentWordChars.length && (
                                        <span
                                            key={`cursor-${currentWordIndex}-${currentCharIndex}`}
                                            className="absolute top-0 text-black pointer-events-none"
                                            style={{
                                                left: `${cursorLeft}px`,
                                                transform: 'translateX(-0.25em)',
                                                animation: 'pulse 1s ease-in-out infinite',
                                                fontSize: '1.5em',
                                                lineHeight: '1',
                                                fontWeight: '300',
                                                transition: 'left 150ms ease-out'
                                            }}
                                        >
                                            |
                                        </span>
                                    )}
                                    {currentWordChars.map((char, charIndex) => {
                                        if (charIndex < currentCharIndex) {
                                            // Completed characters: green
                                            return (
                                                <span
                                                    key={charIndex}
                                                    ref={(el) => { charRefs.current[charIndex] = el; }}
                                                    className="text-green-600"
                                                >
                                                    {char}
                                                </span>
                                            );
                                        } else if (charIndex === currentCharIndex) {
                                            // Current character: highlight on error
                                            return (
                                                <span
                                                    key={charIndex}
                                                    ref={(el) => { charRefs.current[charIndex] = el; }}
                                                    className={`
                                                        transition-all duration-150 ease-in-out
                                                        ${hasError
                                                            ? 'bg-red-500 text-white px-0.5 rounded'
                                                            : 'text-gray-800'
                                                        }
                                                    `}
                                                >
                                                    {char}
                                                </span>
                                            );
                                        } else {
                                            // Upcoming characters: default gray
                                            return (
                                                <span
                                                    key={charIndex}
                                                    ref={(el) => { charRefs.current[charIndex] = el; }}
                                                    className="text-gray-600"
                                                >
                                                    {char}
                                                </span>
                                            );
                                        }
                                    })}
                                </span>
                                {wordIndex < words.length - 1 && ' '}
                            </span>
                        );
                    } else {
                        // Upcoming words: default gray
                        return (
                            <span key={wordIndex} className="text-gray-600">
                                {word}
                                {wordIndex < words.length - 1 && ' '}
                            </span>
                        );
                    }
                })}

                {/* Show completion message when challenge is complete */}
                {isChallengeComplete && !isAllComplete && (
                    <div className="mt-4 pt-4 border-t-2 border-green-500 text-green-700 font-bold text-center">
                        ✓ Challenge Complete!
                    </div>
                )}
            </div>
        </>
    );
}
