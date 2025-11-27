# Unity SFX Heartbeat - Design

## Architecture Overview

The Heartbeat system extends SFXManager to:
1. Store 4 heartbeat intensity AudioClips in a serialized array
2. Subscribe to GameObserver.Notifier for lose completion updates
3. Calculate which intensity to play based on percentage ranges
4. Switch heartbeat intensity when crossing range boundaries
5. Use a dedicated AudioSource for looping heartbeat playback

This creates dynamic audio feedback that intensifies with danger level.

## Component Structure

### SFXManager Extensions

**New Responsibilities:**
- Store heartbeat intensity AudioClips array
- Manage dedicated heartbeat AudioSource
- Subscribe to GameObserver.Notifier
- Calculate intensity index from lose completion percentage
- Switch heartbeat intensity when needed
- Play/stop heartbeat on loop

**New Dependencies:**
- GameObserver (Notifier action)
- 4 heartbeat AudioClip assets

## Data Model

### Configuration Variables

```csharp
[Header("Heartbeat System")]
[SerializeField] private AudioClip[] heartbeatIntensities = new AudioClip[4];
```

### Runtime State

```csharp
private AudioSource heartbeatSource;
private int currentHeartbeatIndex = -1;
```

## Core Algorithms

### 1. Heartbeat AudioSource Setup

```
In Awake (after main AudioSource setup):
1. Create new AudioSource component: AddComponent<AudioSource>()
2. Store reference as heartbeatSource
3. Set heartbeatSource.loop = true
4. Set heartbeatSource.spatialBlend = 0 (2D audio)
5. Set heartbeatSource.playOnAwake = false
```

### 2. Heartbeat Validation

```
In Start (after existing validation):
1. For i = 0 to 3:
   - If heartbeatIntensities[i] == null:
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
1. If isMuted: return
2. If currentHeartbeatIndex < 0 or >= 4: return
3. Get clip = heartbeatIntensities[currentHeartbeatIndex]
4. If clip == null: return
5. Set heartbeatSource.clip = clip
6. Call heartbeatSource.Play()
```

### 7. Heartbeat Stop

```
StopHeartbeat():
1. heartbeatSource.Stop()
2. Set currentHeartbeatIndex = -1
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
**Verification:** heartbeatSource.loop = true
**Covers:** AC2.3

### P4: Intensity Switching
**Property:** Heartbeat intensity switches only when crossing range boundaries
**Verification:** newIndex != currentHeartbeatIndex check
**Covers:** AC3.5, AC4.4

### P5: GameObserver Integration
**Property:** SFXManager receives lose completion updates from GameObserver
**Verification:** Subscribe to Notifier in OnEnable, unsubscribe in OnDisable
**Covers:** AC4.1, AC4.2, AC4.3

### P6: Dedicated AudioSource
**Property:** Heartbeat uses separate AudioSource from main SFX
**Verification:** heartbeatSource is separate component
**Covers:** AC2.4

### P7: Stop Functionality
**Property:** StopHeartbeat immediately stops playback
**Verification:** heartbeatSource.Stop() called
**Covers:** AC5.2, AC5.3

## Implementation Details

### Heartbeat AudioSource Setup

```csharp
void Awake()
{
    // ... existing singleton and main AudioSource setup ...
    
    heartbeatSource = gameObject.AddComponent<AudioSource>();
    heartbeatSource.loop = true;
    heartbeatSource.spatialBlend = 0f;
    heartbeatSource.playOnAwake = false;
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
    if (isMuted) return;
    
    if (currentHeartbeatIndex < 0 || currentHeartbeatIndex >= heartbeatIntensities.Length)
    {
        return;
    }
    
    AudioClip clip = heartbeatIntensities[currentHeartbeatIndex];
    if (clip == null) return;
    
    heartbeatSource.clip = clip;
    heartbeatSource.Play();
}

public void StopHeartbeat()
{
    heartbeatSource.Stop();
    currentHeartbeatIndex = -1;
}
```

## Edge Cases

### E1: Missing Heartbeat AudioClips
**Scenario:** One or more heartbeat AudioClips not assigned
**Handling:** Log warning at Start, PlayHeartbeat checks for null

### E2: Muted State
**Scenario:** PlayHeartbeat called while muted
**Handling:** PlayHeartbeat checks isMuted flag and returns early

### E3: Rapid Percentage Changes
**Scenario:** Lose completion changes rapidly across multiple ranges
**Handling:** Each change triggers intensity check, switches only when needed

### E4: Game Over
**Scenario:** Lose completion reaches 100%
**Handling:** GameManager should call StopHeartbeat() in game over sequence

### E5: First Heartbeat Start
**Scenario:** Game starts at 0% lose completion
**Handling:** First notification triggers intensity 0 playback

## Performance Considerations

- **Intensity Switching**: O(1) comparison and AudioSource.Play()
- **Percentage Calculation**: Simple if-else chain, ~0.001ms
- **AudioSource Management**: Two AudioSources (main + heartbeat)
- **No Allocations**: All operations use existing references

## Integration Points

### With GameObserver

```csharp
// SFXManager subscribes to lose completion updates
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
    SFXManager.Instance.Play(SFXManager.Instance.GameOver);
    SFXManager.Instance.StopHeartbeat(); // Stop heartbeat
    monsterObject.SetActive(false);
}
```

## Usage Examples

### Example 1: Manual Heartbeat Control

```csharp
// Start heartbeat manually
SFXManager.Instance.PlayHeartbeat();

// Stop heartbeat manually
SFXManager.Instance.StopHeartbeat();
```

### Example 2: Automatic Intensity Switching

```csharp
// Heartbeat automatically switches as lose completion changes
// 0% → Intensity 1 (index 0)
// 30% → Intensity 2 (index 1)
// 55% → Intensity 3 (index 2)
// 80% → Intensity 4 (index 3)
```

## Future Enhancements (Out of Scope)

- Volume control per intensity level
- Crossfade between intensities
- Pitch variation based on percentage
- BPM synchronization
- Heartbeat visualization
- More than 4 intensity levels
- Random variation within intensity
