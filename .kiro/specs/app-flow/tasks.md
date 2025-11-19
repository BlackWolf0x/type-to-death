# Implementation Plan

- [x] 1. Install required dependencies
  - Run `pnpm add zustand` to install state management library
  - Run `pnpm dlx shadcn@latest add dialog` to install dialog component
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 5.2, 6.2, 7.1_

- [x] 2. Create Zustand store for global state management
  - Create `app/src/stores/appStore.ts` file
  - Define AppStore interface with showMainMenu and skipIntro state
  - Implement store actions: hideMainMenu, showMainMenu, setSkipIntro
  - Implement initializeFromLocalStorage action to read skipIntro from localStorage
  - Implement localStorage sync when setSkipIntro is called
  - Handle localStorage errors with try-catch and default to false for skipIntro
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 4.2, 4.3, 4.4_

- [x] 3. Create modal components with placeholder content

- [x] 3.1 Create IntroModal component
  - Create `app/src/components/modals/IntroModal.tsx` file
  - Implement using shadcn Dialog component with open and onClose props
  - Add placeholder content (e.g., "Intro content coming soon")
  - Set appropriate z-index styling (z-50)
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 3.2 Create EyeTrackingModal component
  - Create `app/src/components/modals/EyeTrackingModal.tsx` file
  - Implement using shadcn Dialog component with open and onOpenChange props
  - Add placeholder content (e.g., "Eye tracking calibration coming soon")
  - Set appropriate z-index styling (z-50)
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 3.3 Create LeaderboardModal component
  - Create `app/src/components/modals/LeaderboardModal.tsx` file
  - Implement using shadcn Dialog component with open and onOpenChange props
  - Add placeholder content (e.g., "Leaderboard coming soon")
  - Set appropriate z-index styling (z-50)
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 4. Update MainMenu component with full functionality
  - Import useAppStore hook from Zustand store
  - Add state for controlling each modal (showIntroModal, showEyeTrackingModal, showLeaderboardModal)
  - Implement header with "Type To Death" title
  - Add "Start Game" button with click handler that checks skipIntro state
  - Add "Eye Tracking Calibration" button that opens EyeTrackingModal
  - Add "Leaderboard" button that opens LeaderboardModal
  - Add "Skip Intro" checkbox with label that calls setSkipIntro on toggle
  - Implement start game logic: if skipIntro is false, show intro modal; if true, call hideMainMenu
  - Handle intro modal close callback to call hideMainMenu
  - Apply conditional visibility based on showMainMenu state from store
  - Ensure z-index is set to z-40
  - Remove unused UnicornScene import
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 5.1, 6.1_

- [x] 5. Update App component to initialize store
  - Import useAppStore hook
  - Add useEffect to call initializeFromLocalStorage on mount
  - Ensure all components (MainMenu, UnityGame, Game) are rendered without conditional logic
  - _Requirements: 2.1, 2.2, 4.4_

- [x] 6. Update Game component visibility logic
  - Import useAppStore hook
  - Add conditional visibility or CSS class based on showMainMenu state (hide when menu is shown)
  - Ensure z-index remains at z-10
  - _Requirements: 3.2, 3.3_

- [x] 7. Verify and test the complete app flow
  - Manually test that Unity game loads in background on app start
  - Verify main menu displays over Unity game with all buttons visible
  - Test "Start Game" button with skip intro unchecked (should show intro modal)
  - Test "Start Game" button with skip intro checked (should hide menu immediately)
  - Test skip intro checkbox persists across page refreshes
  - Test all modal buttons open their respective dialogs
  - Verify modals can be closed without affecting main menu state
  - Verify z-index layering is correct (modals > menu > game UI > unity)
  - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 4.3, 4.4, 4.5, 5.1, 5.3, 6.1, 6.3, 7.2, 7.3_
