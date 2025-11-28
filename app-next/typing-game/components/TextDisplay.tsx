'use client';

import { useMemo, useRef, useLayoutEffect, useState } from "react";
import { useTypingGameStore } from "../store";

export function TextDisplay() {
    const words = useTypingGameStore((state) => state.words);
    const currentWordIndex = useTypingGameStore((state) => state.currentWordIndex);
    const currentCharIndex = useTypingGameStore((state) => state.currentCharIndex);
    const isAllComplete = useTypingGameStore((state) => state.isAllComplete);
    const inputValue = useTypingGameStore((state) => state.inputValue);

    const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const [cursorLeft, setCursorLeft] = useState(0);
    const [cursorReady, setCursorReady] = useState(false);
    const [cursorWordIndex, setCursorWordIndex] = useState(currentWordIndex);
    const prevWordIndexRef = useRef(currentWordIndex);

    const currentWordChars = useMemo(() => {
        if (currentWordIndex >= words.length) return [];
        return words[currentWordIndex].split('');
    }, [words, currentWordIndex]);

    const allPhraseChars = useMemo(() => {
        const chars: Array<{ char: string; wordIndex: number; charIndex: number }> = [];
        words.forEach((word, wIdx) => {
            word.split('').forEach((char, cIdx) => {
                chars.push({ char, wordIndex: wIdx, charIndex: cIdx });
            });
            if (wIdx < words.length - 1) {
                chars.push({ char: ' ', wordIndex: wIdx, charIndex: word.length });
            }
        });
        return chars;
    }, [words]);

    const currentAbsolutePosition = useMemo(() => {
        let position = 0;
        for (let i = 0; i < currentWordIndex; i++) {
            position += words[i].length + 1;
        }
        return position;
    }, [words, currentWordIndex]);

    useLayoutEffect(() => {
        if (prevWordIndexRef.current !== currentWordIndex) {
            prevWordIndexRef.current = currentWordIndex;
            charRefs.current = [];

            if (currentCharIndex === 0) {
                setCursorLeft(0);
                setCursorReady(true);
                setCursorWordIndex(currentWordIndex);
                return;
            }
            setCursorReady(false);
            return;
        }

        if (currentCharIndex === 0) {
            setCursorLeft(0);
            setCursorReady(true);
            setCursorWordIndex(currentWordIndex);
        } else {
            const charIndexToUse = Math.min(currentCharIndex - 1, currentWordChars.length - 1);
            const prevChar = charRefs.current[charIndexToUse];
            if (prevChar) {
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
                setCursorLeft(0);
                setCursorReady(true);
                setCursorWordIndex(currentWordIndex);
            }
        }
    }, [currentCharIndex, currentWordIndex, currentWordChars.length]);

    if (isAllComplete) {
        return (
            <div className="rounded-lg bg-linear-to-br from-green-100 to-emerald-100 border-2 border-green-500 text-black p-8 text-center">
                <div className="text-4xl mb-4">🎉</div>
                <div className="text-2xl font-bold text-green-800 mb-2">Congratulations!</div>
                <div className="text-lg text-green-700">You've completed all typing challenges!</div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
            <div className="rounded-lg bg-orange-100 border-2 border-orange-300 text-black p-4 text-left text-lg font-mono tracking-wide">
                {words.map((word, wordIndex) => {
                    if (wordIndex < currentWordIndex) {
                        return (
                            <span key={wordIndex} className="text-green-600">
                                {word}
                                {wordIndex < words.length - 1 && ' '}
                            </span>
                        );
                    } else if (wordIndex === currentWordIndex) {
                        return (
                            <span key={wordIndex}>
                                <span className="relative inline-block underline decoration-2 decoration-gray-800">
                                    {cursorReady && cursorWordIndex === currentWordIndex && inputValue.length <= currentWordChars.length && (
                                        <span
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
                                        let firstErrorIndex = -1;
                                        for (let i = 0; i < inputValue.length && i < allPhraseChars.length; i++) {
                                            if (inputValue[i] !== allPhraseChars[currentAbsolutePosition + i]?.char) {
                                                firstErrorIndex = i;
                                                break;
                                            }
                                        }

                                        return currentWordChars.map((char, charIndex) => {
                                            const isTyped = charIndex < inputValue.length;

                                            if (isTyped) {
                                                if (firstErrorIndex !== -1 && charIndex >= firstErrorIndex) {
                                                    return (
                                                        <span
                                                            key={charIndex}
                                                            ref={(el) => { charRefs.current[charIndex] = el; }}
                                                            className="bg-red-500 text-white"
                                                        >
                                                            {char}
                                                        </span>
                                                    );
                                                } else {
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
                                        });
                                    })()}
                                </span>
                                {wordIndex < words.length - 1 && ' '}
                            </span>
                        );
                    } else {
                        return (
                            <span key={wordIndex} className="text-gray-600">
                                {word}
                                {wordIndex < words.length - 1 && ' '}
                            </span>
                        );
                    }
                })}
            </div>
        </>
    );
}
