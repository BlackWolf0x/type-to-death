import { create } from 'zustand';

interface GameStatsStore {
    // Time tracking
    elapsedTime: number; // in seconds
    isTimerRunning: boolean;

    // Typing stats
    charactersTyped: number;

    // Actions
    startTimer: () => void;
    stopTimer: () => void;
    resetStats: () => void;
    tick: () => void;
    addCharacters: (count: number) => void;
}

export const useGameStatsStore = create<GameStatsStore>((set) => ({
    // Initial state
    elapsedTime: 0,
    isTimerRunning: false,
    charactersTyped: 0,

    // Actions
    startTimer: () => set({ isTimerRunning: true }),

    stopTimer: () => set({ isTimerRunning: false }),

    resetStats: () => set({
        elapsedTime: 0,
        isTimerRunning: false,
        charactersTyped: 0,
    }),

    tick: () => set((state) => ({
        elapsedTime: state.isTimerRunning ? state.elapsedTime + 1 : state.elapsedTime,
    })),

    addCharacters: (count: number) => set((state) => ({
        charactersTyped: state.charactersTyped + count,
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
