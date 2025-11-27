# Unity Observer System - Design

## Architecture Overview

The observer system uses an **event-driven architecture** with static actions:
1. MonsterController invokes `GameObserver.BlinkTracker` when a blink is detected
2. GameObserver calculates lose completion percentage
3. GameObserver invokes `GameObserver.Notifier` to broadcast changes
4. All subscribers receive percentage updates
5. Public property provides on-demand access to current percentage

This creates a decoupled, performant way for game systems to react to player danger level with **zero per-frame overhead**.

## Component Structure

### GameObserver (MonoBehaviour)

**Responsibilities:**
- Subscribe to BlinkTracker static action
- Calculate lose completion percentage when triggered
- Invoke Notifier static action to broadcast changes
- Provide public read-only access to current percentage
- Validate configuration at startup

**Dependencies:**
- MonsterController reference (for initial lives only)
- Static Action system (System.Action)

## Data Model

### Configuration Variables

```csharp
[Header("Observer Configuration")]
[SerializeField] private MonsterController monsterController;
```

### Runtime State

```csharp
private int initialLives;
private float loseCompletionPercentage = 0f;
```

### Static Actions

```csharp
// Static action that MonsterController invokes when a blink is detected
// Passes current lives count
public static Action<int> BlinkTracker;

// Static action that GameObserver invokes when percentage changes
// Passes new percentage (0-100) to all subscribers
public static Action<float> Notifier;
```

### Public Properties

```csharp
// Read-only access to current percentage
public float LoseCompletionPercentage => loseCompletionPercentage;
```

## Core Algorithms

### 1. Initialization

```
On Start:
1. Validate monsterController reference
   - If null: Log error, disable script, return
2. Get initial lives from monsterController
3. Store as initialLives
4. Set loseCompletionPercentage = 0
5. Subscribe to BlinkTracker static action
6. Log initialization success

On OnDisable:
1. Unsubscribe from BlinkTracker to prevent memory leaks
```

### 2. Event-Driven Monitoring

```
When MonsterController.OnBlinkDetected() is called:
1. MonsterController invokes: GameObserver.BlinkTracker?.Invoke(currentLives)
2. GameObserver.CalculateLoseCompletionPercentage(currentLives) is triggered
3. Calculate new percentage
4. If percentage changed:
   - Update loseCompletionPercentage
   - Invoke GameObserver.Notifier?.Invoke(percentage)
5. All subscribers receive notification
```

### 3. Percentage Calculation

```
Calculate Lose Completion Percentage:
1. livesLost = initialLives - currentLives
2. percentage = (livesLost / initialLives) * 100
3. Clamp percentage to [0, 100] range
4. Return percentage

Example:
- initialLives = 10, currentLives = 10 → 0%
- initialLives = 10, currentLives = 5 → 50%
- initialLives = 10, currentLives = 0 → 100%
```

### 4. Notification Broadcasting

```
After Calculating Percentage:
1. Check if new percentage != current percentage (using Mathf.Approximately)
2. If percentage changed:
   - Update loseCompletionPercentage
   - Invoke GameObserver.Notifier?.Invoke(loseCompletionPercentage)
   - All subscribed systems receive notification
3. If percentage unchanged:
   - Early return (no notification sent)
```

## Correctness Properties

### P1: Percentage Range
**Property:** For any game state, the lose completion percentage is always between 0 and 100 inclusive
**Verification:** 0 <= loseCompletionPercentage <= 100
**Covers:** AC1.3, AC1.4, AC1.5, AC4.4

### P2: Initial State
**Property:** At game start with no lives lost, lose completion percentage equals 0
**Verification:** loseCompletionPercentage == 0 when currentLives == initialLives
**Covers:** AC1.4

### P3: Game Over State
**Property:** When all lives are lost, lose completion percentage equals 100
**Verification:** loseCompletionPercentage == 100 when currentLives == 0
**Covers:** AC1.5

### P4: Linear Progression
**Property:** For any lives lost, percentage equals (livesLost / totalLives) * 100
**Verification:** loseCompletionPercentage == ((initialLives - currentLives) / initialLives) * 100
**Covers:** AC1.1, AC3.5

### P5: Notifier Invocation on Change
**Property:** For any lives change that results in a different percentage, the Notifier action is invoked exactly once
**Verification:** GameObserver.Notifier invoked when percentage changes
**Covers:** AC2.4, AC6.2

### P6: No Notification on Same Percentage
**Property:** For any lives change that results in the same percentage, no Notifier action is invoked
**Verification:** GameObserver.Notifier not invoked when percentage unchanged
**Covers:** AC6.3

### P7: Notifier Parameter Accuracy
**Property:** For any Notifier invocation, the passed percentage equals the current lose completion percentage
**Verification:** Notifier parameter == loseCompletionPercentage
**Covers:** AC2.5

### P9: Event-Driven Efficiency
**Property:** For any frame where no blink occurs, zero calculations are performed
**Verification:** No Update() method, calculations only triggered by BlinkTracker
**Covers:** AC6.1

### P8: Public Property Accuracy
**Property:** For any time during gameplay, the public property returns the current calculated percentage
**Verification:** LoseCompletionPercentage property == loseCompletionPercentage
**Covers:** AC4.2, AC4.3, AC4.5

## Integration with MonsterController

### Event-Driven Integration (Implemented)
- **Minimal code change**: One line added to MonsterController.OnBlinkDetected()
- **Invocation**: `GameObserver.BlinkTracker?.Invoke(currentLives);`
- **Decoupled**: MonsterController doesn't need GameObserver reference
- **Safe**: Null-conditional operator prevents errors if GameObserver doesn't exist
- **Efficient**: No per-frame polling, only triggers on blinks

### Integration Code

```csharp
// In MonsterController.OnBlinkDetected()
public void OnBlinkDetected()
{
    // ... existing code ...
    currentLives--;
    
    // Notify GameObserver via static action
    GameObserver.BlinkTracker?.Invoke(currentLives);
    
    // ... rest of existing code ...
}
```

## Implementation Details

### Static Action Pattern

```csharp
// Define static actions in GameObserver
public static Action<int> BlinkTracker;    // MonsterController invokes this
public static Action<float> Notifier;      // GameObserver invokes this

// GameObserver subscribes to BlinkTracker
void Start()
{
    BlinkTracker += CalculateLoseCompletionPercentage;
}

void OnDisable()
{
    BlinkTracker -= CalculateLoseCompletionPercentage;
}

// GameObserver invokes Notifier
private void CalculateLoseCompletionPercentage(int currentLives)
{
    // ... calculate percentage ...
    Notifier?.Invoke(loseCompletionPercentage);
}
```

### Subscriber Pattern

```csharp
// External script subscribes to Notifier
void OnEnable()
{
    GameObserver.Notifier += HandleLoseCompletionChanged;
}

void OnDisable()
{
    GameObserver.Notifier -= HandleLoseCompletionChanged;
}

void HandleLoseCompletionChanged(float percentage)
{
    // React to percentage change (0-100)
}
```

### Property Access Pattern

```csharp
// External script queries current value
float currentDanger = gameObserver.LoseCompletionPercentage;
```

## Edge Cases

### E1: MonsterController Not Assigned
**Scenario:** monsterController reference is null
**Handling:** Log error, disable script, prevent null reference exceptions

### E2: Initial Lives is Zero
**Scenario:** MonsterController has 0 lives at start
**Handling:** Set percentage to 100, log warning, continue

### E3: Initial Lives is One
**Scenario:** MonsterController has 1 life at start
**Handling:** Calculate normally (0% at start, 100% after first loss)

### E4: Lives Increase (Unexpected)
**Scenario:** currentLives becomes greater than lastKnownLives
**Handling:** Recalculate percentage normally (will decrease percentage)

### E5: Rapid Lives Changes
**Scenario:** Multiple lives lost in single frame
**Handling:** Calculate once per frame, event fires once with final percentage

### E6: No Subscribers
**Scenario:** No scripts subscribe to the event
**Handling:** Event invocation is safe (null-conditional operator), no errors

## Performance Considerations

- **Per-Frame Cost**: **Zero** (no Update() method)
- **Calculation Cost**: ~0.01ms (only when blinks occur)
- **Notification Cost**: ~0.001ms per subscriber (only when percentage changes)
- **Memory**: Minimal (2 integers, 1 float, 2 static actions)
- **Scalability**: Excellent - zero overhead between blinks
- **Event-Driven Advantage**: Eliminates 60 checks per second (at 60 FPS) compared to polling

## Testing Strategy

### Manual Testing in Unity Editor
1. Assign MonsterController reference in Inspector
2. Press Play
3. Verify initial percentage is 0
4. Press Spacebar to trigger blinks
5. Verify percentage increases with each life lost
6. Verify percentage reaches 100 at game over
7. Log percentage changes to Console

### Integration Testing
1. Create test subscriber script
2. Subscribe to OnLoseCompletionChanged event
3. Log received percentages
4. Verify event fires on each life change
5. Verify event does not fire when percentage unchanged

### Edge Case Testing
1. Test with missing MonsterController reference
2. Test with lives = 1
3. Test with lives = 10
4. Test rapid blinking
5. Test with no subscribers

### Property Testing
1. Query LoseCompletionPercentage property at various times
2. Verify it matches expected calculation
3. Verify it's always in [0, 100] range

## Usage Examples

### Example 1: SFX Manager

```csharp
public class SFXManager : MonoBehaviour
{
    [SerializeField] private AudioSource musicSource;
    
    void OnEnable()
    {
        // Subscribe to static Notifier action
        GameObserver.Notifier += UpdateAudioIntensity;
    }
    
    void OnDisable()
    {
        // Unsubscribe to prevent memory leaks
        GameObserver.Notifier -= UpdateAudioIntensity;
    }
    
    void UpdateAudioIntensity(float losePercentage)
    {
        // Increase music intensity as danger increases
        float intensity = losePercentage / 100f;
        musicSource.volume = Mathf.Lerp(0.3f, 1.0f, intensity);
        musicSource.pitch = Mathf.Lerp(0.8f, 1.2f, intensity);
    }
}
```

### Example 2: VFX Manager (Conceptual)

```csharp
public class VFXManager : MonoBehaviour
{
    [SerializeField] private GameObserver gameObserver;
    
    void Update()
    {
        // Query current percentage on-demand
        float danger = gameObserver.LoseCompletionPercentage;
        
        if (danger > 75f)
        {
            // Enable danger effects
        }
    }
}
```

## Future Enhancements (Out of Scope)

- Multiple observer instances for different metrics
- Tracking additional metrics (distance, time remaining, etc.)
- Historical data (percentage over time)
- Percentage change rate calculation
- Threshold-based actions (e.g., OnDangerLevelHigh, OnDangerLevelCritical)
- UnityEvent alternative for Inspector-based subscriptions
- Observer manager for multiple game state observers
- Analytics integration
- Replay system integration
