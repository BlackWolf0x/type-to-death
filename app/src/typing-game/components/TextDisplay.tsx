import { useMemo, useRef, useLayoutEffect, useState } from "react";
import { useTypingGameStore } from "../store";

export function TextDisplay() {
    // Subscribe to words array, currentWordIndex, currentCharIndex, isAllComplete, and inputValue from store
    const words = useTypingGameStore((state) => state.words);
    const currentWordIndex = useTypingGameStore((state) => state.currentWordIndex);
    const currentCharIndex = useTypingGameStore((state) => state.currentCharIndex);
    const isAllComplete = useTypingGameStore((state) => state.isAllComplete);
    const inputValue = useTypingGameStore((state) => state.inputValue);

    // Refs to measure character positions
    const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const [cursorLeft, setCursorLeft] = useState(0);
    const [cursorReady, setCursorReady] = useState(false);
    const [cursorWordIndex, setCursorWordIndex] = useState(currentWordIndex);
    const prevWordIndexRef = useRef(currentWordIndex);

    // Memoize character splitting for current word to avoid re-splitting on every render
    const currentWordChars = useMemo(() => {
        if (currentWordIndex >= words.length) return [];
        return words[currentWordIndex].split('');
    }, [words, currentWordIndex]);

    // Create a flat array of all characters in the phrase (including spaces between words)
    const allPhraseChars = useMemo(() => {
        const chars: Array<{ char: string; wordIndex: number; charIndex: number }> = [];
        words.forEach((word, wIdx) => {
            word.split('').forEach((char, cIdx) => {
                chars.push({ char, wordIndex: wIdx, charIndex: cIdx });
            });
            // Add space after each word except the last
            if (wIdx < words.length - 1) {
                chars.push({ char: ' ', wordIndex: wIdx, charIndex: word.length });
            }
        });
        return chars;
    }, [words]);

    // Calculate the absolute character position in the phrase for the current word
    const currentAbsolutePosition = useMemo(() => {
        let position = 0;
        for (let i = 0; i < currentWordIndex; i++) {
            position += words[i].length + 1; // +1 for space
        }
        return position;
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
                setCursorWordIndex(currentWordIndex);
                return;
            }

            setCursorReady(false);
            return;
        }

        // Calculate cursor position based on current character index
        if (currentCharIndex === 0) {
            setCursorLeft(0);
            setCursorReady(true);
            setCursorWordIndex(currentWordIndex);
        } else {
            // Position cursor after the last typed character (even if beyond word length)
            const charIndexToUse = Math.min(currentCharIndex - 1, currentWordChars.length - 1);
            const prevChar = charRefs.current[charIndexToUse];
            if (prevChar) {
                // If typing beyond word length, position at end of word
                if (currentCharIndex > currentWordChars.length) {
                    const lastChar = charRefs.current[currentWordChars.length - 1];
                    if (lastChar) {
                        setCursorLeft(lastChar.offsetLeft + lastChar.offsetWidth);
                        setCursorReady(true);
                        setCursorWordIndex(currentWordIndex);
                    }
                } else {
                    setCursorLeft(prevChar.offsetLeft + prevChar.offsetWidth);
                    setCursorReady(true);
                    setCursorWordIndex(currentWordIndex);
                }
            } else {
                // Fallback: show cursor at position 0
                setCursorLeft(0);
                setCursorReady(true);
                setCursorWordIndex(currentWordIndex);
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
                                    {/* Only show cursor in current word if input hasn't extended beyond it */}
                                    {cursorReady && cursorWordIndex === currentWordIndex && inputValue.length <= currentWordChars.length && (
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
                                    {(() => {
                                        // Find the first error position in the input (comparing against phrase) - calculate once
                                        let firstErrorIndex = -1;
                                        for (let i = 0; i < inputValue.length && i < allPhraseChars.length; i++) {
                                            if (inputValue[i] !== allPhraseChars[currentAbsolutePosition + i]?.char) {
                                                firstErrorIndex = i;
                                                break;
                                            }
                                        }

                                        return currentWordChars.map((char, charIndex) => {
                                            // Determine if this character position has been typed
                                            const isTyped = charIndex < inputValue.length;

                                            if (isTyped) {
                                                // If there's an error before or at this position, show as red
                                                if (firstErrorIndex !== -1 && charIndex >= firstErrorIndex) {
                                                    return (
                                                        <span
                                                            key={charIndex}
                                                            ref={(el) => { charRefs.current[charIndex] = el; }}
                                                            className="bg-red-500 text-white transition-all duration-150 ease-in-out"
                                                        >
                                                            {char}
                                                        </span>
                                                    );
                                                } else {
                                                    // No error yet, this character is correct - show as green
                                                    return (
                                                        <span
                                                            key={charIndex}
                                                            ref={(el) => { charRefs.current[charIndex] = el; }}
                                                            className="text-green-600"
                                                        >
                                                            {char}
                                                        </span>
                                                    );
                                                }
                                            } else {
                                                // Check if this character should be highlighted red due to overflow typing
                                                const overflowHighlight = firstErrorIndex !== -1 &&
                                                    inputValue.length > currentWordChars.length &&
                                                    charIndex < inputValue.length &&
                                                    charIndex < currentWordChars.length + 10;

                                                if (overflowHighlight) {
                                                    return (
                                                        <span
                                                            key={charIndex}
                                                            ref={(el) => { charRefs.current[charIndex] = el; }}
                                                            className="bg-red-500 text-white transition-all duration-150 ease-in-out"
                                                        >
                                                            {char}
                                                        </span>
                                                    );
                                                } else if (charIndex === currentCharIndex) {
                                                    // Current character (cursor position): default styling
                                                    return (
                                                        <span
                                                            key={charIndex}
                                                            ref={(el) => { charRefs.current[charIndex] = el; }}
                                                            className="text-gray-800"
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
                                            }
                                        });
                                    })()}
                                </span>
                                {(() => {
                                    // Calculate firstErrorIndex for space highlighting
                                    let firstErrorIndex = -1;
                                    for (let i = 0; i < inputValue.length && i < currentWordChars.length; i++) {
                                        if (inputValue[i] !== currentWordChars[i]) {
                                            firstErrorIndex = i;
                                            break;
                                        }
                                    }

                                    return wordIndex < words.length - 1 ? (
                                        <span className={
                                            firstErrorIndex !== -1 &&
                                                currentWordChars.length < inputValue.length &&
                                                currentWordChars.length < firstErrorIndex + 10
                                                ? "bg-red-500 text-white transition-all duration-150 ease-in-out"
                                                : ""
                                        }>
                                            {' '}
                                        </span>
                                    ) : null;
                                })()}
                            </span>
                        );
                    } else {
                        // Upcoming words: check if they should be highlighted red due to overflow typing
                        // Calculate absolute position of this word
                        let wordAbsolutePos = 0;
                        for (let i = 0; i < wordIndex; i++) {
                            wordAbsolutePos += words[i].length + 1; // +1 for space
                        }

                        // Find first error in current word
                        let firstErrorIndex = -1;
                        for (let i = 0; i < inputValue.length && i < currentWordChars.length; i++) {
                            if (inputValue[i] !== currentWordChars[i]) {
                                firstErrorIndex = i;
                                break;
                            }
                        }

                        // If input extends beyond current word, render character by character (for cursor and highlighting)
                        const hasError = firstErrorIndex !== -1;
                        const inputExtendsHere = inputValue.length > (wordAbsolutePos - currentAbsolutePosition);

                        if (inputExtendsHere) {
                            // Render character by character with red highlighting and cursor
                            return (
                                <span key={wordIndex}>
                                    {word.split('').map((char, cIdx) => {
                                        const charAbsPos = wordAbsolutePos + cIdx;
                                        const inputPosForThisChar = charAbsPos - currentAbsolutePosition;
                                        const shouldHighlight = inputPosForThisChar < inputValue.length &&
                                            inputPosForThisChar < firstErrorIndex + 10;

                                        // Check if cursor should be before this character
                                        const cursorHere = inputValue.length === inputPosForThisChar;

                                        return (
                                            <span key={cIdx} className="relative inline">
                                                {cursorHere && (
                                                    <span
                                                        className="absolute pointer-events-none"
                                                        style={{
                                                            left: '0px',
                                                            top: '50%',
                                                            transform: 'translate(-0.25em, -50%)',
                                                            animation: 'pulse 1s ease-in-out infinite',
                                                            fontSize: '1.5em',
                                                            lineHeight: '1',
                                                            fontWeight: '300',
                                                            color: shouldHighlight ? 'white' : 'black',
                                                        }}
                                                    >
                                                        |
                                                    </span>
                                                )}
                                                <span className={shouldHighlight ? "bg-red-500 text-white transition-all duration-150 ease-in-out" : "text-gray-600"}>
                                                    {char}
                                                </span>
                                            </span>
                                        );
                                    })}
                                    {wordIndex < words.length - 1 && (() => {
                                        const spaceAbsPos = wordAbsolutePos + word.length;
                                        const spaceInputPos = spaceAbsPos - currentAbsolutePosition;
                                        const cursorAtSpace = inputValue.length === spaceInputPos;
                                        const shouldHighlightSpace = hasError && spaceInputPos < inputValue.length && spaceInputPos < firstErrorIndex + 10;

                                        return (
                                            <span className="relative inline">
                                                {cursorAtSpace && (
                                                    <span
                                                        className="absolute pointer-events-none"
                                                        style={{
                                                            left: '0px',
                                                            top: '50%',
                                                            transform: 'translate(-0.25em, -50%)',
                                                            animation: 'pulse 1s ease-in-out infinite',
                                                            fontSize: '1.5em',
                                                            lineHeight: '1',
                                                            fontWeight: '300',
                                                            color: shouldHighlightSpace ? 'white' : 'black',
                                                        }}
                                                    >
                                                        |
                                                    </span>
                                                )}
                                                <span className={shouldHighlightSpace ? "bg-red-500 text-white transition-all duration-150 ease-in-out" : ""}>
                                                    {' '}
                                                </span>
                                            </span>
                                        );
                                    })()}
                                </span>
                            );
                        } else {
                            // Default gray
                            return (
                                <span key={wordIndex} className="text-gray-600">
                                    {word}
                                    {wordIndex < words.length - 1 && ' '}
                                </span>
                            );
                        }
                    }
                })}
            </div>
        </>
    );
}
