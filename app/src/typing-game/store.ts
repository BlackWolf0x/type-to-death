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
    errorCount: number; // Counter to force shake animation retrigger

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
            console.log('Loading challenges from data.ts...');

            // Load all challenges with proper typing
            const challenges = typingChallenges as TypingChallenge[];

            // Handle empty challenges array
            if (!challenges || challenges.length === 0) {
                console.error('No challenges found in data.ts, using fallback challenge');

                // Provide fallback challenge
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

                console.log('Fallback challenge loaded');
                return;
            }

            console.log('Total challenges:', challenges.length);

            // Parse first challenge into words
            const firstChallenge = challenges[0];

            // Validate first challenge has text
            if (!firstChallenge || !firstChallenge.text) {
                throw new Error('First challenge is invalid or missing text');
            }

            console.log('First challenge text:', firstChallenge.text);

            const words = parseWords(firstChallenge.text);
            console.log('Parsed words:', words);
            console.log('Total words in first challenge:', words.length);

            // Validate that words were parsed successfully
            if (!words || words.length === 0) {
                throw new Error('Failed to parse words from challenge text');
            }

            // Initialize completed words array
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

            console.log('Challenges loaded successfully!');
        } catch (error) {
            console.error('Error loading challenges:', error);

            // Provide fallback challenge on any error
            const fallbackChallenge: TypingChallenge = {
                text: "Welcome to Type to Death. This is a fallback challenge due to a loading error.",
                difficulty: 'easy'
            };

            try {
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

                console.log('Fallback challenge loaded after error');
            } catch (fallbackError) {
                console.error('Critical error: Failed to load fallback challenge:', fallbackError);
                // Set minimal state to prevent complete failure
                set({
                    challenges: [],
                    currentChallengeIndex: 0,
                    words: ['Error', 'loading', 'challenges'],
                    currentWordIndex: 0,
                    completedWords: [false, false, false],
                    currentCharIndex: 0,
                    inputValue: '',
                    hasError: false,
                    errorCount: 0,
                    isComplete: false,
                    isChallengeComplete: false,
                    isAllComplete: false,
                });
            }
        }
    },

    setInputValue: (value: string) => {
        set((state) => {
            // Get current word
            const currentWord = state.words[state.currentWordIndex];

            // If input is empty, reset to no error
            if (value === '') {
                return {
                    inputValue: '',
                    hasError: false,
                    currentCharIndex: 0,
                };
            }

            // Allow any characters to be typed (no automatic backtracking)
            // Validate each character in input against target word
            let hasAnyError = false;
            for (let i = 0; i < value.length; i++) {
                // Check if character exists in target word and matches
                if (i >= currentWord.length || value[i] !== currentWord[i]) {
                    hasAnyError = true;
                    break;
                }
            }

            // If there's an error and input length is 10 or more, limit to 10 and show alert
            if (hasAnyError && value.length >= 10) {
                // Show alert when trying to type more than 10 characters with errors
                if (value.length > state.inputValue.length) {
                    alert('Maximum 10 characters allowed when there are errors. Please backspace to correct your mistakes.');
                }
                // Limit to 10 characters
                const limitedValue = value.substring(0, 10);
                return {
                    inputValue: limitedValue,
                    currentCharIndex: limitedValue.length,
                    hasError: true,
                    errorCount: state.errorCount,
                };
            }

            // Cursor follows input length (not matching length)
            const newCharIndex = value.length;

            // Increment error count only when a NEW error is introduced
            const previousHadError = state.hasError;
            const shouldIncrementError = hasAnyError && (!previousHadError || value.length > state.inputValue.length);

            // Check if this is the last word and it's fully typed correctly
            const isLastWord = state.currentWordIndex === state.words.length - 1;
            const isWordComplete = !hasAnyError && value.length === currentWord.length;

            // If last word is fully typed correctly, auto-complete the challenge
            if (isLastWord && isWordComplete) {
                const newCompletedWords = [...state.completedWords];
                newCompletedWords[state.currentWordIndex] = true;

                // Trigger nextChallenge after a delay
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

    validateCharacter: () => {
        // This method is kept for backwards compatibility but is no longer used
        // Validation now happens directly in setInputValue for better performance
    },

    handleSpaceOrEnter: () => {
        set((state) => {
            const currentWord = state.words[state.currentWordIndex];

            // Prevent advancement if there are any errors
            if (state.hasError) {
                // Don't advance if input contains errors
                return state;
            }

            // Check if input exactly matches the target word
            if (state.inputValue !== currentWord) {
                // Word not complete or doesn't match, don't advance
                return state;
            }

            // Word is complete and correct - advance to next word
            const newCurrentWordIndex = state.currentWordIndex + 1;
            const newCompletedWords = [...state.completedWords];
            newCompletedWords[state.currentWordIndex] = true;

            // Check if challenge is complete
            const isChallengeComplete = newCurrentWordIndex >= state.words.length;

            return {
                currentWordIndex: newCurrentWordIndex,
                completedWords: newCompletedWords,
                currentCharIndex: 0,
                inputValue: '', // Clear input field
                hasError: false,
                errorCount: 0,
                isChallengeComplete,
            };
        });

        // After state update, check if we need to progress to next challenge
        const state = useTypingGameStore.getState();
        if (state.isChallengeComplete) {
            // Small delay to allow UI to show completion before transitioning
            setTimeout(() => {
                useTypingGameStore.getState().nextChallenge();
            }, 500);
        }
    },

    nextChallenge: () => {
        set((state) => {
            // Increment challenge index
            const newChallengeIndex = state.currentChallengeIndex + 1;

            // Check if all challenges are complete
            if (newChallengeIndex >= state.challenges.length) {
                console.log('All challenges completed!');
                return {
                    isComplete: true,
                    isChallengeComplete: true,
                    isAllComplete: true,
                };
            }

            // Load next challenge
            const nextChallenge = state.challenges[newChallengeIndex];
            console.log(`Loading challenge ${newChallengeIndex + 1}/${state.challenges.length}`);
            console.log('Challenge text:', nextChallenge.text);

            // Parse challenge into words
            const words = parseWords(nextChallenge.text);
            console.log('Parsed words:', words);
            console.log('Total words:', words.length);

            // Initialize completed words array
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
