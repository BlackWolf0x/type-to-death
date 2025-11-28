import { create } from 'zustand';
import { typingChallenges } from './data';
import { parseWords } from './utils/wordParser';

interface TypingChallenge {
    text: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface TypingGameStore {
    // Challenge management
    challenges: TypingChallenge[];
    currentChallengeIndex: number;

    // Word tracking
    words: string[];
    currentWordIndex: number;
    completedWords: boolean[];

    // Character tracking
    currentCharIndex: number;

    // Input management
    inputValue: string;
    hasError: boolean;
    errorCount: number;

    // Status
    isComplete: boolean;
    isChallengeComplete: boolean;
    isAllComplete: boolean;

    // Actions
    loadChallenges: () => void;
    setInputValue: (value: string) => void;
    validateCharacter: () => void;
    handleSpaceOrEnter: () => void;
    nextChallenge: () => void;
    reset: () => void;
}

export const useTypingGameStore = create<TypingGameStore>((set) => ({
    // Initial state
    challenges: [],
    currentChallengeIndex: 0,
    words: [],
    currentWordIndex: 0,
    completedWords: [],
    currentCharIndex: 0,
    inputValue: '',
    hasError: false,
    errorCount: 0,
    isComplete: false,
    isChallengeComplete: false,
    isAllComplete: false,


    // Actions
    loadChallenges: () => {
        try {
            const challenges = typingChallenges as TypingChallenge[];

            if (!challenges || challenges.length === 0) {
                const fallbackChallenge: TypingChallenge = {
                    text: "Welcome to Type to Death. This is a fallback challenge.",
                    difficulty: 'easy'
                };
                const words = parseWords(fallbackChallenge.text);
                const completedWords = new Array(words.length).fill(false);

                set({
                    challenges: [fallbackChallenge],
                    currentChallengeIndex: 0,
                    words,
                    currentWordIndex: 0,
                    completedWords,
                    currentCharIndex: 0,
                    inputValue: '',
                    hasError: false,
                    errorCount: 0,
                    isComplete: false,
                    isChallengeComplete: false,
                    isAllComplete: false,
                });
                return;
            }

            const firstChallenge = challenges[0];
            const words = parseWords(firstChallenge.text);
            const completedWords = new Array(words.length).fill(false);

            set({
                challenges,
                currentChallengeIndex: 0,
                words,
                currentWordIndex: 0,
                completedWords,
                currentCharIndex: 0,
                inputValue: '',
                hasError: false,
                errorCount: 0,
                isComplete: false,
                isChallengeComplete: false,
                isAllComplete: false,
            });
        } catch (error) {
            console.error('Error loading challenges:', error);
        }
    },

    setInputValue: (value: string) => {
        set((state) => {
            const currentWord = state.words[state.currentWordIndex];

            if (value === '') {
                return {
                    inputValue: '',
                    hasError: false,
                    currentCharIndex: 0,
                };
            }

            let hasAnyError = false;
            for (let i = 0; i < value.length; i++) {
                if (i >= currentWord.length || value[i] !== currentWord[i]) {
                    hasAnyError = true;
                    break;
                }
            }

            if (hasAnyError && value.length > 10) {
                const limitedValue = value.substring(0, 10);
                return {
                    inputValue: limitedValue,
                    currentCharIndex: limitedValue.length,
                    hasError: true,
                    errorCount: state.errorCount,
                };
            }

            const newCharIndex = value.length;
            const previousHadError = state.hasError;
            const shouldIncrementError = hasAnyError && (!previousHadError || value.length > state.inputValue.length);

            const isLastWord = state.currentWordIndex === state.words.length - 1;
            const isWordComplete = !hasAnyError && value.length === currentWord.length;

            if (isLastWord && isWordComplete) {
                const newCompletedWords = [...state.completedWords];
                newCompletedWords[state.currentWordIndex] = true;

                setTimeout(() => {
                    useTypingGameStore.getState().nextChallenge();
                }, 500);

                return {
                    inputValue: value,
                    currentCharIndex: newCharIndex,
                    hasError: false,
                    errorCount: 0,
                    completedWords: newCompletedWords,
                    isChallengeComplete: true,
                };
            }

            return {
                inputValue: value,
                currentCharIndex: newCharIndex,
                hasError: hasAnyError,
                errorCount: shouldIncrementError ? (state.errorCount || 0) + 1 : state.errorCount,
            };
        });
    },

    validateCharacter: () => { },

    handleSpaceOrEnter: () => {
        set((state) => {
            const currentWord = state.words[state.currentWordIndex];

            if (state.hasError) return state;
            if (state.inputValue !== currentWord) return state;

            const newCurrentWordIndex = state.currentWordIndex + 1;
            const newCompletedWords = [...state.completedWords];
            newCompletedWords[state.currentWordIndex] = true;

            const isChallengeComplete = newCurrentWordIndex >= state.words.length;

            return {
                currentWordIndex: newCurrentWordIndex,
                completedWords: newCompletedWords,
                currentCharIndex: 0,
                inputValue: '',
                hasError: false,
                errorCount: 0,
                isChallengeComplete,
            };
        });

        const state = useTypingGameStore.getState();
        if (state.isChallengeComplete) {
            setTimeout(() => {
                useTypingGameStore.getState().nextChallenge();
            }, 500);
        }
    },

    nextChallenge: () => {
        set((state) => {
            const newChallengeIndex = state.currentChallengeIndex + 1;

            if (newChallengeIndex >= state.challenges.length) {
                return {
                    isComplete: true,
                    isChallengeComplete: true,
                    isAllComplete: true,
                };
            }

            const nextChallenge = state.challenges[newChallengeIndex];
            const words = parseWords(nextChallenge.text);
            const completedWords = new Array(words.length).fill(false);

            return {
                currentChallengeIndex: newChallengeIndex,
                words,
                currentWordIndex: 0,
                completedWords,
                currentCharIndex: 0,
                inputValue: '',
                hasError: false,
                errorCount: 0,
                isChallengeComplete: false,
            };
        });
    },

    reset: () => {
        set({
            challenges: [],
            currentChallengeIndex: 0,
            words: [],
            currentWordIndex: 0,
            completedWords: [],
            currentCharIndex: 0,
            inputValue: '',
            hasError: false,
            errorCount: 0,
            isComplete: false,
            isChallengeComplete: false,
            isAllComplete: false,
        });
    },
}));
