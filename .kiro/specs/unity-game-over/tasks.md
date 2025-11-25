# Unity Game Over - Implementation Plan

## Tasks Overview

- [x] 1. Create GameManager Script Structure
  - Create `GameManager.cs` in `Assets/Scripts/`
  - Add singleton instance field and property
  - Add serialized fields: blackScreenPanel, monsterObject, gameOverDelay
  - Add gameOverTriggered boolean field
  - _Properties: P1, P7_
  - _Requirements: AC1.1, AC3.1, AC3.3, AC4.1_

- [x] 2. Implement Singleton Pattern
  - Implement Awake() method
  - Check if instance is null, set to this
  - If instance exists and is not this, destroy gameObject
  - _Properties: P1, P2_
  - _Requirements: AC1.1, AC1.2, AC1.3_

- [x] 3. Implement Subscription Management
  - Implement OnEnable() method
  - Subscribe to GameObserver.Notifier
  - Implement OnDisable() method
  - Unsubscribe from GameObserver.Notifier
  - _Properties: P3_
  - _Requirements: AC2.1, AC2.2_

- [x] 4. Implement Lose Completion Handler
  - Create OnLoseCompletionChanged(float percentage) method
  - Check if gameOverTriggered is true, return early
  - Check if percentage >= 100f
  - Set gameOverTriggered = true
  - Start GameOverSequence coroutine
  - _Properties: P4_
  - _Requirements: AC2.3, AC2.4_

- [x] 5. Implement Game Over Coroutine
  - Create GameOverSequence() coroutine (IEnumerator)
  - yield return new WaitForSeconds(gameOverDelay)
  - Activate blackScreenPanel: SetActive(true)
  - Deactivate monsterObject: SetActive(false)
  - Log game over message
  - _Properties: P5, P6_
  - _Requirements: AC3.2, AC3.4, AC4.2, AC4.3_

- [x] 6. Add Reference Validation
  - Implement Start() method
  - Check if blackScreenPanel is null, log warning
  - Check if monsterObject is null, log warning
  - _Properties: P7_
  - _Requirements: AC3.1, AC4.1_

## Manual Unity Setup Tasks

### Setup Task A: Create UI Canvas and Black Screen Panel
1. Right-click in Hierarchy → UI → Canvas
2. Right-click on Canvas → UI → Panel
3. Rename Panel to "BlackScreenPanel"
4. Set Panel color to black (RGBA: 0, 0, 0, 255)
5. Stretch Panel to cover entire screen:
   - Anchor Presets: Stretch/Stretch (bottom-right option)
   - Left: 0, Right: 0, Top: 0, Bottom: 0
6. Disable BlackScreenPanel (uncheck in Inspector)

### Setup Task B: Create GameManager GameObject
1. Create empty GameObject in scene
2. Name it "GameManager"
3. Attach GameManager script
4. Assign BlackScreenPanel to blackScreenPanel field
5. Assign Monster GameObject to monsterObject field
6. Set gameOverDelay (default: 1.0 seconds, adjust as needed)

### Setup Task C: Verify Scene Setup
1. Ensure GameObserver exists in scene
2. Ensure MonsterController exists in scene
3. Ensure BlackScreenPanel is child of Canvas
4. Ensure BlackScreenPanel starts inactive (unchecked)

### Setup Task D: Test Game Over Sequence
1. Press Play in Unity Editor
2. Press Spacebar to trigger blinks until sprint
3. Wait for monster to reach camera
4. Verify black screen appears after delay
5. Verify monster stops moving
6. Check Console for "Game Over" message

## Implementation Notes

- **Singleton Pattern**: Standard Unity singleton with DontDestroyOnLoad
- **Coroutine Delay**: WaitForSeconds allows configurable timing
- **Monster Deactivation**: SetActive(false) stops all components including Update()
- **One-Time Trigger**: gameOverTriggered flag prevents multiple game overs
- **Minimal Comments**: Keep code clean and self-explanatory

## Estimated Effort

- Total Tasks: 6 coding tasks + 4 manual setup tasks
- Estimated Coding Time: 30-45 minutes
- Estimated Setup Time: 15 minutes
- Complexity: Low
- Risk Level: Low

## Dependencies

- GameObserver script (Notifier action)
- MonsterController GameObject in scene
- Unity UI system (Canvas, Panel)

## Integration Notes

### GameManager Usage

```csharp
// GameManager automatically handles game over
// No manual calls needed from other scripts

// Access singleton if needed
GameManager.Instance;
```

### Adjusting Game Over Delay

In Unity Inspector:
1. Select GameManager GameObject
2. Adjust "Game Over Delay" field
3. Test different timings to find best feel

### Black Screen Setup

- Must be UI Panel component
- Must be child of Canvas
- Must start inactive in scene
- Must cover entire screen (stretch anchors)
- Must be black color

## Performance Notes

- **Singleton Access**: O(1) static property lookup
- **Coroutine**: Single coroutine, minimal overhead
- **Monster Deactivation**: Immediately stops Update() calls
- **No Per-Frame Cost**: Only processes on 100% notification

## Code Style Notes

- **No XML summaries**: Keep code clean
- **Minimal comments**: Only comment non-obvious logic
- **Self-documenting**: Clear variable and method names
- **Concise**: Avoid verbose implementations
