import { create } from 'zustand';

interface GameStatsStore {
    // Time tracking
    elapsedTime: number; // in seconds
    isTimerRunning: boolean;

    // Typing stats
    charactersTyped: number;
    totalKeystrokes: number;
    correctKeystrokes: number;

    // Actions
    startTimer: () => void;
    stopTimer: () => void;
    resetStats: () => void;
    tick: () => void;
    addCharacters: (count: number) => void;
    recordKeystroke: (isCorrect: boolean) => void;
}

export const useGameStatsStore = create<GameStatsStore>((set) => ({
    // Initial state
    elapsedTime: 0,
    isTimerRunning: false,
    charactersTyped: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,

    // Actions
    startTimer: () => set({ isTimerRunning: true }),

    stopTimer: () => set({ isTimerRunning: false }),

    resetStats: () => set({
        elapsedTime: 0,
        isTimerRunning: false,
        charactersTyped: 0,
        totalKeystrokes: 0,
        correctKeystrokes: 0,
    }),

    tick: () => set((state) => ({
        elapsedTime: state.isTimerRunning ? state.elapsedTime + 1 : state.elapsedTime,
    })),

    addCharacters: (count: number) => set((state) => ({
        charactersTyped: state.charactersTyped + count,
    })),

    recordKeystroke: (isCorrect: boolean) => set((state) => ({
        totalKeystrokes: state.totalKeystrokes + 1,
        correctKeystrokes: isCorrect ? state.correctKeystrokes + 1 : state.correctKeystrokes,
    })),
}));

// Helper to format time as MM:SS
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Calculate WPM (standard: 5 characters = 1 word)
export function calculateWPM(charactersTyped: number, elapsedSeconds: number): number {
    if (elapsedSeconds === 0) return 0;
    const minutes = elapsedSeconds / 60;
    const words = charactersTyped / 5;
    return Math.round(words / minutes);
}

// Calculate accuracy percentage
export function calculateAccuracy(correctKeystrokes: number, totalKeystrokes: number): number {
    if (totalKeystrokes === 0) return 100;
    return Math.round((correctKeystrokes / totalKeystrokes) * 100);
}
