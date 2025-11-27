# Unity Interop System - Implementation Plan

## Tasks Overview

- [x] 1. Create React.jslib File
  - Create file at `Assets/Plugins/WebGL/React.jslib`
  - Add mergeInto(LibraryManager.library, {})
  - Define GameIsReady function that calls window.dispatchReactUnityEvent("GameIsReady")
  - Define GameLost function that calls window.dispatchReactUnityEvent("GameLost")
  - _Properties: P1, P2, P3_
  - _Requirements: AC1.1, AC1.2, AC1.3, AC1.4, AC2.1, AC2.2, AC3.1, AC3.2_

- [x] 2. Create MainMenuManager Script
  - Create `MainMenuManager.cs` in `Assets/Scripts/`
  - Add using System.Runtime.InteropServices
  - Add DllImport declaration for GameIsReady
  - Implement Start() method
  - Call GameIsReady() with #if UNITY_WEBGL && !UNITY_EDITOR
  - _Properties: P4, P5_
  - _Requirements: AC2.3, AC2.4, AC2.5, AC4.1, AC4.2, AC4.3, AC4.4_

- [x] 3. Integrate GameLost with GameManager
  - Open GameManager.cs
  - Add using System.Runtime.InteropServices at top
  - Add DllImport declaration for GameLost
  - In GameOverSequence(), after blackScreenPanel.SetActive(true)
  - Add GameLost() call with #if UNITY_WEBGL && !UNITY_EDITOR
  - _Properties: P4, P6_
  - _Requirements: AC3.3, AC3.4, AC3.5, AC4.1, AC4.2, AC4.3_

## Manual Unity Setup Tasks

### Setup Task A: Create Plugins Folder Structure
1. In Unity Project window, navigate to Assets
2. Create folder: Plugins (if doesn't exist)
3. Inside Plugins, create folder: WebGL
4. Verify path: Assets/Plugins/WebGL/

### Setup Task B: Create MainMenuManager GameObject
1. Create empty GameObject in scene
2. Name it "MainMenuManager"
3. Attach MainMenuManager script
4. Verify it's in the scene at startup

### Setup Task C: Test in Unity Editor
1. Press Play in Unity Editor
2. Verify no errors in Console
3. Verify game runs normally
4. Note: Events won't fire in Editor (expected)

### Setup Task D: Test in WebGL Build
1. Build for WebGL
2. Run in browser with React app
3. Verify "GameIsReady" event received in React
4. Play until game over
5. Verify "GameLost" event received in React

## Implementation Notes

- **jslib Syntax**: JavaScript file, not C#
- **DllImport**: Use "__Internal" for WebGL
- **Conditional Compilation**: Prevents Editor errors
- **No Parameters**: Simple event notifications
- **Minimal Comments**: Keep code clean

## Estimated Effort

- Total Tasks: 3 coding tasks + 4 manual setup tasks
- Estimated Coding Time: 30 minutes
- Estimated Setup Time: 15 minutes
- Complexity: Low
- Risk Level: Low

## Dependencies

- Unity 6.1 WebGL build target
- react-unity-webgl library (React side)
- GameManager script (existing)
- Assets/Plugins/WebGL/ folder

## Integration Notes

### React Side Setup

```typescript
// In React component
import { useUnityContext } from "react-unity-webgl";

const { addEventListener, removeEventListener } = useUnityContext({
  loaderUrl: "build/myGame.loader.js",
  dataUrl: "build/myGame.data",
  frameworkUrl: "build/myGame.framework.js",
  codeUrl: "build/myGame.wasm",
});

useEffect(() => {
  function handleGameIsReady() {
    console.log("Unity loaded!");
  }
  
  function handleGameLost() {
    console.log("Game over!");
  }
  
  addEventListener("GameIsReady", handleGameIsReady);
  addEventListener("GameLost", handleGameLost);
  
  return () => {
    removeEventListener("GameIsReady", handleGameIsReady);
    removeEventListener("GameLost", handleGameLost);
  };
}, [addEventListener, removeEventListener]);
```

### Event Names

- **GameIsReady**: Fired when Unity finishes loading
- **GameLost**: Fired when player loses (game over)

## Performance Notes

- **JavaScript Calls**: Minimal overhead
- **Conditional Compilation**: Zero runtime cost in non-WebGL builds
- **No Allocations**: Simple function calls
- **No Per-Frame Cost**: Events fire once per occurrence

## Code Style Notes

- **No XML summaries**: Keep code clean
- **Minimal comments**: Only comment non-obvious logic
- **Self-documenting**: Clear function names
- **Concise**: Avoid verbose implementations
