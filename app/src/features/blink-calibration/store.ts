import { create } from 'zustand';

export type SetupStep = 'requestPermission' | 'error' | 'calibrating';

interface BlinkCalibrationStore {
    // State
    setupStep: SetupStep;

    // Actions
    setSetupStep: (step: SetupStep) => void;
    reset: () => void;
}

export const useBlinkCalibrationStore = create<BlinkCalibrationStore>((set) => ({
    // Initial state
    setupStep: 'requestPermission',

    // Actions
    setSetupStep: (step) => set({ setupStep: step }),
    reset: () => set({ setupStep: 'requestPermission' }),
}));
