# Unity Interop System - Design

## Architecture Overview

The Unity Interop System consists of:
1. React.jslib file with JavaScript functions
2. MainMenuManager script that calls GameIsReady on Start
3. GameManager integration that calls GameLost on game over
4. DllImport declarations for JavaScript interop
5. Conditional compilation for WebGL builds only

This creates simple one-way communication from Unity to React.

## Component Structure

### React.jslib (JavaScript Library)

**Responsibilities:**
- Define GameIsReady JavaScript function
- Define GameLost JavaScript function
- Call window.dispatchReactUnityEvent for each

**Dependencies:**
- react-unity-webgl library (React side)
- window.dispatchReactUnityEvent function

### MainMenuManager (MonoBehaviour)

**Responsibilities:**
- Call GameIsReady() on Start
- Use conditional compilation for WebGL only

**Dependencies:**
- React.jslib

### GameManager Integration

**Responsibilities:**
- Call GameLost() in GameOverSequence
- Use conditional compilation for WebGL only

**Dependencies:**
- React.jslib
- Existing GameManager script

## Data Model

### JavaScript Functions

```javascript
// In React.jslib
GameIsReady: function () {
    window.dispatchReactUnityEvent("GameIsReady");
}

GameLost: function () {
    window.dispatchReactUnityEvent("GameLost");
}
```

### C# DllImport Declarations

```csharp
[DllImport("__Internal")]
private static extern void GameIsReady();

[DllImport("__Internal")]
private static extern void GameLost();
```

## Core Algorithms

### 1. React.jslib Structure

```
mergeInto(LibraryManager.library, {
    GameIsReady: function () {
        window.dispatchReactUnityEvent("GameIsReady");
    },
    
    GameLost: function () {
        window.dispatchReactUnityEvent("GameLost");
    }
});
```

### 2. MainMenuManager Start

```
On Start:
1. Check if UNITY_WEBGL && !UNITY_EDITOR
2. If true: Call GameIsReady()
```

### 3. GameManager Integration

```
In GameOverSequence (after black screen):
1. Check if UNITY_WEBGL && !UNITY_EDITOR
2. If true: Call GameLost()
```

## Correctness Properties

### P1: jslib File Location
**Property:** React.jslib exists in Assets/Plugins/WebGL/
**Verification:** File path is Assets/Plugins/WebGL/React.jslib
**Covers:** AC1.2

### P2: JavaScript Function Definition
**Property:** GameIsReady and GameLost functions are defined in jslib
**Verification:** Functions exist in mergeInto block
**Covers:** AC1.3, AC2.1, AC3.1

### P3: Event Dispatch
**Property:** JavaScript functions call window.dispatchReactUnityEvent
**Verification:** Each function calls dispatchReactUnityEvent with event name
**Covers:** AC1.4, AC2.2, AC3.2

### P4: WebGL Conditional Compilation
**Property:** DllImport calls only execute in WebGL builds
**Verification:** #if UNITY_WEBGL && !UNITY_EDITOR wraps all calls
**Covers:** AC2.5, AC3.4, AC4.1, AC4.2, AC4.3

### P5: GameIsReady Timing
**Property:** GameIsReady fires when Unity loads
**Verification:** Called in MainMenuManager.Start()
**Covers:** AC2.3, AC2.4

### P6: GameLost Timing
**Property:** GameLost fires on game over
**Verification:** Called in GameManager.GameOverSequence()
**Covers:** AC3.3, AC3.5

## Implementation Details

### React.jslib File

```javascript
mergeInto(LibraryManager.library, {
    GameIsReady: function () {
        window.dispatchReactUnityEvent("GameIsReady");
    },
    
    GameLost: function () {
        window.dispatchReactUnityEvent("GameLost");
    }
});
```

### MainMenuManager Script

```csharp
using System.Runtime.InteropServices;
using UnityEngine;

public class MainMenuManager : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void GameIsReady();
    
    void Start()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        GameIsReady();
#endif
    }
}
```

### GameManager Integration

```csharp
// Add to top of GameManager.cs
using System.Runtime.InteropServices;

// Add DllImport declaration
[DllImport("__Internal")]
private static extern void GameLost();

// In GameOverSequence coroutine
IEnumerator GameOverSequence()
{
    yield return new WaitForSeconds(gameOverDelay);
    
    blackScreenPanel.SetActive(true);
    
#if UNITY_WEBGL && !UNITY_EDITOR
    GameLost();
#endif
    
    // ... rest of game over logic
}
```

## Edge Cases

### E1: Unity Editor Execution
**Scenario:** Code runs in Unity Editor
**Handling:** Conditional compilation prevents DllImport calls

### E2: Non-WebGL Build
**Scenario:** Code runs in non-WebGL build (e.g., Windows)
**Handling:** Conditional compilation prevents DllImport calls

### E3: React Not Listening
**Scenario:** React hasn't set up event listener yet
**Handling:** Event is dispatched but not received (expected behavior)

### E4: Multiple GameLost Calls
**Scenario:** GameOverSequence called multiple times
**Handling:** GameManager's gameOverTriggered flag prevents this

## Performance Considerations

- **JavaScript Calls**: Minimal overhead, simple function calls
- **Conditional Compilation**: Zero runtime cost (compiled out)
- **No Parameters**: Simplest possible event dispatch
- **No Allocations**: No memory allocations for these calls

## Integration Points

### With react-unity-webgl (React Side)

```typescript
// React component
import { Unity, useUnityContext } from "react-unity-webgl";

const { addEventListener, removeEventListener } = useUnityContext({
  // ... config
});

useEffect(() => {
  function handleGameIsReady() {
    console.log("Unity is ready!");
    // Show game UI
  }
  
  function handleGameLost() {
    console.log("Game over!");
    // Show game over UI
  }
  
  addEventListener("GameIsReady", handleGameIsReady);
  addEventListener("GameLost", handleGameLost);
  
  return () => {
    removeEventListener("GameIsReady", handleGameIsReady);
    removeEventListener("GameLost", handleGameLost);
  };
}, [addEventListener, removeEventListener]);
```

## Usage Examples

### Example 1: MainMenuManager Usage

```csharp
// Attach MainMenuManager to a GameObject in the scene
// It will automatically call GameIsReady() on Start
```

### Example 2: Testing in Unity Editor

```csharp
// In Editor, the calls are compiled out
// No errors, no warnings
// Test game logic normally
```

### Example 3: WebGL Build

```csharp
// In WebGL build, events are dispatched to React
// React receives "GameIsReady" when Unity loads
// React receives "GameLost" when game ends
```

## Future Enhancements (Out of Scope)

- Events with parameters (score, time, etc.)
- React to Unity communication
- More game events (pause, resume, etc.)
- Event queuing system
- Error handling and retry logic
- Event acknowledgment from React
