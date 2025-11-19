# Implementation Plan

- [x] 1. Install react-unity-webgl dependency
  - Run `pnpm add react-unity-webgl` in the app directory
  - Verify the package is added to package.json
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Create UnityGame component

  - [x] 2.1 Create the unity directory and UnityGame component file
    - Create `src/components/unity/` directory
    - Create `src/components/unity/UnityGame.tsx` file
    - _Requirements: 3.1_

  - [x] 2.2 Implement UnityGame component with useUnityContext hook
    - Import Unity and useUnityContext from react-unity-webgl
    - Configure useUnityContext with correct file paths for loader, data, framework, and wasm files
    - Use paths: `/unity/cursor-test-webgl-build.loader.js`, `/unity/cursor-test-webgl-build.data`, `/unity/cursor-test-webgl-build.framework.js`, `/unity/cursor-test-webgl-build.wasm`
    - Extract unityProvider, loadingProgression, and isLoaded from the hook
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 2.3 Add loading indicator and Unity canvas rendering
    - Display loading percentage when game is not loaded: `Loading... {Math.round(loadingProgression * 100)}%`
    - Render Unity component with unityProvider
    - Use visibility style to hide Unity canvas until isLoaded is true
    - Apply Tailwind classes for full-screen fixed positioning: `fixed inset-0 w-screen h-screen z-0`
    - _Requirements: 2.5, 2.1, 2.2, 2.3_

- [x] 3. Create Game overlay component

  - [x] 3.1 Create the game directory and Game component file
    - Create `src/components/game/` directory
    - Create `src/components/game/Game.tsx` file
    - _Requirements: 5.1_

  - [x] 3.2 Implement Game component with fixed positioning
    - Create a div with red background
    - Apply Tailwind classes: `fixed bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-red-500 z-10`
    - Ensure component is positioned at bottom-center with dimensions 500px × 400px
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 4. Update App.tsx to compose components

  - [x] 4.1 Import UnityGame and Game components
    - Import UnityGame from `./components/unity/UnityGame`
    - Import Game from `./components/game/Game`
    - _Requirements: 3.7, 5.2_

  - [x] 4.2 Render both components in App
    - Create a container div with `relative w-screen h-screen overflow-hidden` classes
    - Render UnityGame component first (background layer)
    - Render Game component second (overlay layer)
    - _Requirements: 5.3_

- [x] 5. Verify the implementation

  - [x] 5.1 Test Unity game loading and rendering
    - Start the development server
    - Verify loading indicator appears with percentage
    - Verify Unity game loads and displays full-screen
    - Verify game covers entire viewport
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 5.2 Test Game overlay positioning and styling
    - Verify red div appears at bottom-center
    - Verify dimensions are 500px × 400px
    - Verify Game component is above Unity game (higher z-index)
    - Test responsiveness by resizing browser window
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
