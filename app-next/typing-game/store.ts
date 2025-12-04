import { create } from 'zustand';
import { parseWords } from './utils/wordParser';
import { useGameStatsStore } from '@/stores/gameStatsStore';
import type { Story, Chapter } from '@/types';

interface TypingGameStore {
    // Story metadata
    storyTitle: string;
    storyIntroduction: string;

    // Chapter management
    chapters: Chapter[];
    currentChapterIndex: number;
    totalChapters: number;

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
    isChapterComplete: boolean;
    isStoryComplete: boolean;

    // Loaded story reference (for restarts)
    loadedStory: Story | null;

    // Actions
    loadStory: (story: Story) => void;
    reloadStory: () => void;
    setInputValue: (value: string) => void;
    validateCharacter: () => void;
    handleSpaceOrEnter: () => void;
    nextChapter: () => void;
    reset: () => void;
}

export const useTypingGameStore = create<TypingGameStore>((set, get) => ({
    // Initial state
    storyTitle: '',
    storyIntroduction: '',
    chapters: [],
    currentChapterIndex: 0,
    totalChapters: 0,
    words: [],
    currentWordIndex: 0,
    completedWords: [],
    currentCharIndex: 0,
    inputValue: '',
    hasError: false,
    errorCount: 0,
    isComplete: false,
    isChapterComplete: false,
    isStoryComplete: false,
    loadedStory: null,

    // Actions
    loadStory: (story: Story) => {
        try {
            const { title, introduction, chapters } = story;

            if (!chapters || chapters.length === 0) {
                const fallbackChapter: Chapter = {
                    text: "Welcome to Type to Death. This is a fallback chapter.",
                    difficulty: 'easy'
                };
                const words = parseWords(fallbackChapter.text);
                const completedWords = new Array(words.length).fill(false);

                set({
                    storyTitle: 'Type to Death',
                    storyIntroduction: '',
                    chapters: [fallbackChapter],
                    currentChapterIndex: 0,
                    totalChapters: 1,
                    words,
                    currentWordIndex: 0,
                    completedWords,
                    currentCharIndex: 0,
                    inputValue: '',
                    hasError: false,
                    errorCount: 0,
                    isComplete: false,
                    isChapterComplete: false,
                    isStoryComplete: false,
                    loadedStory: story,
                });
                return;
            }

            const firstChapter = chapters[0];
            const words = parseWords(firstChapter.text);
            const completedWords = new Array(words.length).fill(false);

            set({
                storyTitle: title,
                storyIntroduction: introduction,
                chapters,
                currentChapterIndex: 0,
                totalChapters: chapters.length,
                words,
                currentWordIndex: 0,
                completedWords,
                currentCharIndex: 0,
                inputValue: '',
                hasError: false,
                errorCount: 0,
                isComplete: false,
                isChapterComplete: false,
                isStoryComplete: false,
                loadedStory: story,
            });
        } catch (error) {
            console.error('Error loading story:', error);
        }
    },

    reloadStory: () => {
        const { loadedStory, loadStory } = get();
        if (loadedStory) {
            loadStory(loadedStory);
        }
    },

    setInputValue: (value: string) => {
        set((state) => {
            const currentWord = state.words[state.currentWordIndex];

            // Guard against undefined currentWord (game ended or invalid state)
            if (!currentWord) {
                return state;
            }

            if (value === '') {
                return {
                    inputValue: '',
                    hasError: false,
                    currentCharIndex: 0,
                };
            }

            // Record keystroke if a new character was typed (not backspace)
            // Defer to next microtask to avoid blocking the main thread during typing
            if (value.length > state.inputValue.length) {
                const newCharPos = value.length - 1;
                const typedChar = value[newCharPos];
                const expectedChar = currentWord[newCharPos];
                const isCorrect = typedChar === expectedChar;
                // Use queueMicrotask to batch this update separately from the typing state
                queueMicrotask(() => {
                    useGameStatsStore.getState().recordKeystroke(isCorrect);
                });
            }

            // Find the first error position and count errors
            let firstErrorIndex = -1;
            for (let i = 0; i < value.length; i++) {
                if (i >= currentWord.length || value[i] !== currentWord[i]) {
                    firstErrorIndex = i;
                    break;
                }
            }

            const hasAnyError = firstErrorIndex !== -1;
            // Error count is only the characters after the first error
            const currentErrorCount = hasAnyError ? value.length - firstErrorIndex : 0;

            // Limit errors to 10 (only counting actual error characters, not correct prefix)
            if (hasAnyError && currentErrorCount > 10) {
                const limitedValue = value.substring(0, firstErrorIndex + 10);
                return {
                    inputValue: limitedValue,
                    currentCharIndex: limitedValue.length,
                    hasError: true,
                    errorCount: 10,
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

                // Track characters typed for the last word (no space needed)
                useGameStatsStore.getState().addCharacters(currentWord.length);

                setTimeout(() => {
                    useTypingGameStore.getState().nextChapter();
                }, 500);

                return {
                    inputValue: value,
                    currentCharIndex: newCharIndex,
                    hasError: false,
                    errorCount: 0,
                    completedWords: newCompletedWords,
                    isChapterComplete: true,
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

            // Track characters typed (word length + 1 for space)
            useGameStatsStore.getState().addCharacters(currentWord.length + 1);

            const newCurrentWordIndex = state.currentWordIndex + 1;
            const newCompletedWords = [...state.completedWords];
            newCompletedWords[state.currentWordIndex] = true;

            const isChapterComplete = newCurrentWordIndex >= state.words.length;

            return {
                currentWordIndex: newCurrentWordIndex,
                completedWords: newCompletedWords,
                currentCharIndex: 0,
                inputValue: '',
                hasError: false,
                errorCount: 0,
                isChapterComplete,
            };
        });

        const state = useTypingGameStore.getState();
        if (state.isChapterComplete) {
            setTimeout(() => {
                useTypingGameStore.getState().nextChapter();
            }, 500);
        }
    },

    nextChapter: () => {
        set((state) => {
            const newChapterIndex = state.currentChapterIndex + 1;

            if (newChapterIndex >= state.chapters.length) {
                return {
                    isComplete: true,
                    isChapterComplete: true,
                    isStoryComplete: true,
                };
            }

            const nextChapter = state.chapters[newChapterIndex];
            const words = parseWords(nextChapter.text);
            const completedWords = new Array(words.length).fill(false);

            return {
                currentChapterIndex: newChapterIndex,
                words,
                currentWordIndex: 0,
                completedWords,
                currentCharIndex: 0,
                inputValue: '',
                hasError: false,
                errorCount: 0,
                isChapterComplete: false,
            };
        });
    },

    reset: () => {
        set({
            storyTitle: '',
            storyIntroduction: '',
            chapters: [],
            currentChapterIndex: 0,
            totalChapters: 0,
            words: [],
            currentWordIndex: 0,
            completedWords: [],
            currentCharIndex: 0,
            inputValue: '',
            hasError: false,
            errorCount: 0,
            isComplete: false,
            isChapterComplete: false,
            isStoryComplete: false,
        });
    },
}));
