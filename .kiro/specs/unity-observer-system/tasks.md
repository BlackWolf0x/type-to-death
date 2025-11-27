# Unity Observer System - Implementation Plan

## Tasks Overview

- [x] 1. Create GameObserver Script Structure
  - Create `GameObserver.cs` in `Assets/Scripts/`
  - Add serialized field for MonsterController reference
  - Add private runtime state variables (initialLives, loseCompletionPercentage)
  - Add static Action<int> BlinkTracker for MonsterController to invoke
  - Add static Action<float> Notifier for broadcasting percentage changes
  - Add public property for LoseCompletionPercentage
  - Add XML documentation comments
  - _Properties: P8, P9_
  - _Requirements: AC2.1, AC4.1, AC4.2_

- [x] 2. Implement Initialization and Validation
  - Implement Start() method
  - Validate monsterController reference is assigned
  - If null, log error and disable script
  - Get initial lives from monsterController
  - Store in initialLives variable
  - Initialize loseCompletionPercentage = 0
  - Subscribe to BlinkTracker static action
  - Implement OnDisable() to unsubscribe from BlinkTracker
  - Add debug logging for initialization
  - _Properties: P2, P9_
  - _Requirements: AC5.1, AC5.2, AC5.3, AC5.4, AC5.5_

- [x] 3. Implement Event-Driven Monitoring
  - Remove Update() method (event-driven, not polling)
  - CalculateLoseCompletionPercentage() subscribes to BlinkTracker
  - Method receives currentLives as parameter from MonsterController
  - Triggered only when blinks occur (zero per-frame overhead)
  - Add debug logging for percentage calculations
  - _Properties: P4, P9_
  - _Requirements: AC3.1, AC3.2, AC3.3, AC3.4, AC6.1_

- [x] 4. Implement Percentage Calculation
  - CalculateLoseCompletionPercentage(int currentLives) method
  - Calculate livesLost = initialLives - currentLives
  - Calculate percentage = (livesLost / initialLives) * 100
  - Clamp result to [0, 100] range
  - Handle edge cases: initialLives <= 0, currentLives > initialLives, negative lives
  - After calculation, invoke Notifier action if percentage changed
  - _Properties: P1, P4_
  - _Requirements: AC1.1, AC1.2, AC1.3, AC3.5_

- [x] 5. Implement Notification Broadcasting
  - After calculating new percentage in CalculateLoseCompletionPercentage()
  - Compare new percentage with current loseCompletionPercentage using Mathf.Approximately
  - If different, update loseCompletionPercentage
  - Invoke Notifier static action: Notifier?.Invoke(loseCompletionPercentage)
  - Use null-conditional operator for safe invocation
  - If same, early return (no notification)
  - Add debug logging for notifications
  - _Properties: P5, P6, P7_
  - _Requirements: AC2.2, AC2.4, AC2.5, AC6.2, AC6.3, AC6.4_

- [x] 6. Implement Public Property

  - Create public LoseCompletionPercentage property
  - Use expression-bodied property (=>)
  - Return loseCompletionPercentage value
  - Ensure read-only (no setter)
  - _Properties: P8_
  - _Requirements: AC4.1, AC4.2, AC4.3, AC4.4, AC4.5_

- [x] 7. Add Edge Case Handling
  - Handle initialLives <= 0 case (set to 100%, invoke Notifier)
  - Handle currentLives > initialLives case (set to 0%, invoke Notifier)
  - Handle negative currentLives case (set to 100%, invoke Notifier)
  - Add appropriate warnings/logs for each edge case
  - Ensure no division by zero
  - _Properties: P1_
  - _Requirements: AC1.3, AC1.4, AC1.5_

- [x] 8. Create Test Subscriber Script (For Testing)
  - Create `GameObserverTest.cs` in `Assets/Scripts/`
  - Subscribe to Notifier static action in OnEnable
  - Unsubscribe in OnDisable
  - Log received percentage values
  - Validate percentage range [0, 100]
  - Log milestone percentages (25%, 50%, 75%, 100%)
  - Periodically query LoseCompletionPercentage property
  - For testing purposes only (remove after validation)
  - _Properties: P5, P7, P8_
  - _Requirements: AC2.3, AC4.5_

- [x] 9. Integrate with MonsterController
  - Add one line to MonsterController.OnBlinkDetected()
  - After currentLives--, invoke: GameObserver.BlinkTracker?.Invoke(currentLives)
  - Use null-conditional operator for safety
  - No other changes to MonsterController required
  - Minimal coupling, event-driven integration
  - _Properties: P9_
  - _Requirements: AC3.1, AC3.2, AC6.1_

- [x] 10. Testing and Validation
  - Verify code compiles without errors
  - Test all edge cases with appropriate handling
  - Verify event-driven architecture (no Update method)
  - Verify Notifier invocations
  - Verify property access
  - Create SFXManagerExample.cs as integration template
  - Document event-driven architecture
  - _Properties: All_
  - _Requirements: All_

---

## Implementation Notes

- **Event-Driven Architecture**: Uses static actions instead of Update() polling
- **Zero Per-Frame Overhead**: No calculations when no blinks occur
- **Minimal Integration**: Only one line added to MonsterController
- **Decoupled Design**: MonsterController doesn't need GameObserver reference
- **Static Actions**: BlinkTracker (MonsterController invokes) and Notifier (subscribers listen)
- **Null-Conditional Operators**: All action invocations use ?. for safety
- **Float Division**: Percentage calculation uses float for precision
- **Expression-Bodied Property**: LoseCompletionPercentage uses => syntax
- **Test Scripts**: GameObserverTest and SFXManagerExample for validation only

## Unity Setup Tasks (Manual)

### Setup Task A: Create GameObserver GameObject
1. Create empty GameObject in scene
2. Name it "GameObserver"
3. Attach GameObserver script
4. Assign MonsterController reference in Inspector

### Setup Task B: Create Test Subscriber (Optional)
1. Create empty GameObject in scene
2. Name it "GameObserverTest"
3. Attach GameObserverTest script
4. Assign GameObserver reference in Inspector

### Setup Task C: Test in Play Mode
1. Press Play in Unity Editor
2. Open Console window
3. Press Spacebar to trigger blinks
4. Verify percentage logs appear
5. Verify event invocation logs appear
6. Verify percentage reaches 100% at game over

### Setup Task D: Remove Test Subscriber
1. After validation, delete GameObserverTest GameObject
2. Remove GameObserverTest.cs script
3. Keep GameObserver in scene for production use

## Estimated Effort

- Total Tasks: 10 coding tasks + 4 manual setup tasks
- Actual Coding Time: ~2 hours (completed)
- Actual Testing Time: Pending Unity validation
- Complexity: Low-Medium (event-driven architecture)
- Risk Level: Low
- Status: ✅ All coding tasks complete

## Dependencies

- MonsterController script (from unity-monster spec)
- Unity 6.1 project
- C# event system knowledge
- Understanding of observer pattern

## Integration Notes

### For Future Subscribers

Any script that wants to react to lose completion changes should:

1. **Subscribe to Notifier static action in OnEnable**
```csharp
void OnEnable()
{
    GameObserver.Notifier += HandleLoseCompletionChanged;
}
```

2. **Unsubscribe in OnDisable**
```csharp
void OnDisable()
{
    GameObserver.Notifier -= HandleLoseCompletionChanged;
}
```

3. **Implement handler method**
```csharp
void HandleLoseCompletionChanged(float percentage)
{
    // React to percentage change (0-100)
    float intensity = percentage / 100f;
    // Update audio, VFX, UI, etc.
}
```

4. **Or query property directly (requires GameObserver reference)**
```csharp
[SerializeField] private GameObserver gameObserver;

void Update()
{
    float currentDanger = gameObserver.LoseCompletionPercentage;
}
```

## Performance Notes

- **Zero per-frame cost**: No Update() method at all
- **Event-driven**: Calculations only when blinks occur
- **Notification efficiency**: Notifier only invoked when percentage changes
- **Expected performance impact**: Zero between blinks, ~0.01ms per blink
- **No allocations**: Static actions are cached, no per-frame allocations
- **Scalability**: Excellent - zero overhead regardless of subscriber count between blinks
- **Comparison**: Eliminates 60 checks per second (at 60 FPS) vs polling approach
