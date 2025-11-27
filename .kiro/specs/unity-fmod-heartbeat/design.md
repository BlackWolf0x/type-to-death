# Unity FMOD Heartbeat - Design

## Architecture Overview

The Heartbeat system extends AudioManager to:
1. Store 4 heartbeat intensity EventReferences in a serialized array
2. Subscribe to GameObserver.Notifier for lose completion updates
3. Calculate which intensity to play based on percentage ranges
4. Switch heartbeat intensity when crossing range boundaries
5. Use a dedicated EventInstance for looping heartbeat playback

This creates dynamic audio feedback that intensifies with danger level using FMOD.

## Component Structure

### AudioManager Extensions

**New Responsibilities:**
- Store heartbeat intensity EventReferences array
- Manage dedicated heartbeat EventInstance
- Subscribe to GameObserver.Notifier
- Calculate intensity index from lose completion percentage
- Switch heartbeat intensity when needed
- Play/stop heartbeat on loop
- Release heartbeat EventInstance properly

**New Dependencies:**
- GameObserver (Notifier action)
- 4 heartbeat FMOD events

## Data Model

### Configuration Variables

```csharp
[Header("Heartbeat System")]
[SerializeField] private EventReference[] heartbeatIntensities = new EventReference[4];
```

### Runtime State

```csharp
private EventInstance heartbeatInstance;
private int currentHeartbeatIndex = -1;
```

## Core Algorithms

### 1. Heartbeat EventInstance Initialization

```
In Awake:
1. Initialize heartbeatInstance as default EventInstance
2. No need to create immediately (created on first play)
```

### 2. Heartbeat Validation

```
In Start (after existing validation):
1. For i = 0 to 3:
   - If heartbeatIntensities[i].IsNull:
     - Log warning: "Heartbeat intensity {i} not assigned"
```

### 3. GameObserver Subscription

```
In OnEnable:
1. Subscribe: GameObserver.Notifier += OnLoseCompletionChanged

In OnDisable:
1. Unsubscribe: GameObserver.Notifier -= OnLoseCompletionChanged
```

### 4. Intensity Calculation

```
GetHeartbeatIndex(float loseCompletion):
1. If loseCompletion < 25: return 0
2. Else if loseCompletion < 50: return 1
3. Else if loseCompletion < 75: return 2
4. Else: return 3
```

### 5. Heartbeat Intensity Switching

```
OnLoseCompletionChanged(float percentage):
1. Calculate newIndex = GetHeartbeatIndex(percentage)
2. If newIndex != currentHeartbeatIndex:
   - Set currentHeartbeatIndex = newIndex
   - Call PlayHeartbeat()
```

### 6. Heartbeat Playback

```
PlayHeartbeat():
1. Stop and release existing heartbeat if playing
2. If currentHeartbeatIndex < 0 or >= 4: return
3. Get eventRef = heartbeatIntensities[currentHeartbeatIndex]
4. If eventRef.IsNull: return
5. Create heartbeatInstance = RuntimeManager.CreateInstance(eventRef)
6. Call heartbeatInstance.start()
```

### 7. Heartbeat Stop

```
StopHeartbeat():
1. heartbeatInstance.stop(FMOD.Studio.STOP_MODE.IMMEDIATE)
2. heartbeatInstance.release()
3. Set currentHeartbeatIndex = -1
```

## Correctness Properties

### P1: Intensity Array Size
**Property:** The heartbeatIntensities array always has exactly 4 elements
**Verification:** Array initialized with size 4
**Covers:** AC1.1, AC1.2

### P2: Intensity Range Mapping
**Property:** For any lose completion percentage, the correct intensity index is calculated
**Verification:** GetHeartbeatIndex returns 0 for 0-24%, 1 for 25-49%, 2 for 50-74%, 3 for 75-100%
**Covers:** AC3.1, AC3.2, AC3.3, AC3.4

### P3: Looping Playback
**Property:** When heartbeat plays, it loops continuously until stopped
**Verification:** FMOD events configured with looping enabled
**Covers:** AC2.3

### P4: Intensity Switching
**Property:** Heartbeat intensity switches only when crossing range boundaries
**Verification:** newIndex != currentHeartbeatIndex check
**Covers:** AC3.5, AC4.4

### P5: GameObserver Integration
**Property:** AudioManager receives lose completion updates from GameObserver
**Verification:** Subscribe to Notifier in OnEnable, unsubscribe in OnDisable
**Covers:** AC4.1, AC4.2, AC4.3

### P6: Dedicated EventInstance
**Property:** Heartbeat uses separate EventInstance from game over sound
**Verification:** heartbeatInstance is separate from gameOverInstance
**Covers:** AC2.4

### P7: Stop Functionality
**Property:** StopHeartbeat immediately stops playback and releases resources
**Verification:** stop() and release() called
**Covers:** AC5.2, AC5.3, AC5.4

## Implementation Details

### Heartbeat EventInstance Initialization

```csharp
void Awake()
{
    // ... existing singleton setup ...
    
    // Heartbeat instance initialized on first play
    heartbeatInstance = default;
}
```

### Subscription Management

```csharp
void OnEnable()
{
    GameObserver.Notifier += OnLoseCompletionChanged;
}

void OnDisable()
{
    GameObserver.Notifier -= OnLoseCompletionChanged;
    
    // Clean up heartbeat instance
    if (heartbeatInstance.isValid())
    {
        heartbeatInstance.stop(FMOD.Studio.STOP_MODE.IMMEDIATE);
        heartbeatInstance.release();
    }
}
```

### Intensity Calculation

```csharp
int GetHeartbeatIndex(float loseCompletion)
{
    if (loseCompletion < 25f) return 0;
    if (loseCompletion < 50f) return 1;
    if (loseCompletion < 75f) return 2;
    return 3;
}
```

### Lose Completion Handler

```csharp
void OnLoseCompletionChanged(float percentage)
{
    int newIndex = GetHeartbeatIndex(percentage);
    
    if (newIndex != currentHeartbeatIndex)
    {
        currentHeartbeatIndex = newIndex;
        PlayHeartbeat();
    }
}
```

### Playback Methods

```csharp
public void PlayHeartbeat()
{
    // Stop existing heartbeat if playing
    if (heartbeatInstance.isValid())
    {
        heartbeatInstance.stop(FMOD.Studio.STOP_MODE.IMMEDIATE);
        heartbeatInstance.release();
    }
    
    if (currentHeartbeatIndex < 0 || currentHeartbeatIndex >= heartbeatIntensities.Length)
    {
        return;
    }
    
    EventReference eventRef = heartbeatIntensities[currentHeartbeatIndex];
    if (eventRef.IsNull) return;
    
    heartbeatInstance = RuntimeManager.CreateInstance(eventRef);
    heartbeatInstance.start();
}

public void StopHeartbeat()
{
    if (heartbeatInstance.isValid())
    {
        heartbeatInstance.stop(FMOD.Studio.STOP_MODE.IMMEDIATE);
        heartbeatInstance.release();
    }
    currentHeartbeatIndex = -1;
}
```

## Edge Cases

### E1: Missing Heartbeat EventReferences
**Scenario:** One or more heartbeat EventReferences not assigned
**Handling:** Log warning at Start, PlayHeartbeat checks for IsNull

### E2: Rapid Percentage Changes
**Scenario:** Lose completion changes rapidly across multiple ranges
**Handling:** Each change triggers intensity check, switches only when needed

### E3: Game Over
**Scenario:** Lose completion reaches 100%
**Handling:** GameManager should call StopHeartbeat() in game over sequence

### E4: First Heartbeat Start
**Scenario:** Game starts at 0% lose completion
**Handling:** First notification triggers intensity 0 playback

### E5: EventInstance Cleanup
**Scenario:** Scene unloads or game quits
**Handling:** OnDisable releases heartbeat EventInstance

## Performance Considerations

- **Intensity Switching**: O(1) comparison and EventInstance creation
- **Percentage Calculation**: Simple if-else chain, ~0.001ms
- **EventInstance Management**: One active heartbeat instance at a time
- **Memory**: Properly release instances to prevent leaks

## Integration Points

### With GameObserver

```csharp
// AudioManager subscribes to lose completion updates
void OnEnable()
{
    GameObserver.Notifier += OnLoseCompletionChanged;
}

// Receives percentage, switches intensity if needed
void OnLoseCompletionChanged(float percentage)
{
    int newIndex = GetHeartbeatIndex(percentage);
    if (newIndex != currentHeartbeatIndex)
    {
        currentHeartbeatIndex = newIndex;
        PlayHeartbeat();
    }
}
```

### With GameManager

```csharp
// GameManager stops heartbeat on game over
IEnumerator GameOverSequence()
{
    yield return new WaitForSeconds(gameOverDelay);
    
    blackScreenPanel.SetActive(true);
    AudioManager.Instance.PlayGameOver();
    AudioManager.Instance.StopHeartbeat(); // Stop heartbeat
    monsterObject.SetActive(false);
}
```

## Usage Examples

### Example 1: Manual Heartbeat Control

```csharp
// Start heartbeat manually
AudioManager.Instance.PlayHeartbeat();

// Stop heartbeat manually
AudioManager.Instance.StopHeartbeat();
```

### Example 2: Automatic Intensity Switching

```csharp
// Heartbeat automatically switches as lose completion changes
// 0% → Intensity 1 (index 0)
// 30% → Intensity 2 (index 1)
// 55% → Intensity 3 (index 2)
// 80% → Intensity 4 (index 3)
```

## FMOD Event Configuration

### Heartbeat Events Setup

Each heartbeat intensity should be configured in FMOD Studio:

1. **Event Path**: `event:/SFX/Heartbeat/Intensity_1` (through Intensity_4)
2. **Looping**: Enable loop region in FMOD Studio
3. **3D/2D**: Configure as 2D event
4. **Volume**: Adjust per intensity level in FMOD Studio

## Future Enhancements (Out of Scope)

- Volume control per intensity level via FMOD parameters
- Crossfade between intensities
- Pitch variation based on percentage
- BPM synchronization
- Heartbeat visualization
- More than 4 intensity levels
- Random variation within intensity
- FMOD parameter automation for smooth transitions
