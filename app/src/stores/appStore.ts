import { create } from 'zustand';

interface AppStore {
    // UI Visibility State
    showMainMenu: boolean;
    skipIntro: boolean;

    // Actions
    hideMainMenu: () => void;
    setSkipIntro: (skip: boolean) => void;
    initializeFromLocalStorage: () => void;
}

const SKIP_INTRO_KEY = 'skipIntro';

export const useAppStore = create<AppStore>((set) => ({
    // Initial state
    showMainMenu: true,
    skipIntro: false,

    // Actions
    hideMainMenu: () => set({ showMainMenu: false }),

    setSkipIntro: (skip: boolean) => {
        set({ skipIntro: skip });

        // Sync to localStorage
        try {
            localStorage.setItem(SKIP_INTRO_KEY, JSON.stringify(skip));
        } catch (error) {
            console.error('Failed to save skip intro preference to localStorage:', error);
        }
    },

    initializeFromLocalStorage: () => {
        try {
            const stored = localStorage.getItem(SKIP_INTRO_KEY);
            if (stored !== null) {
                const skipIntro = JSON.parse(stored);
                set({ skipIntro: Boolean(skipIntro) });
            }
        } catch (error) {
            console.error('Failed to load skip intro preference from localStorage:', error);
            // Default to false on error
            set({ skipIntro: false });
        }
    },
}));
