# Unity FMOD System - Design

## Architecture Overview

The FMOD System consists of an `AudioManager` singleton that:
1. Stores FMOD EventReference fields (serialized)
2. Stores FMOD EventInstance fields (public)
3. Creates EventInstances from EventReferences in Awake
4. Provides PlaySfx() method to play any EventInstance
5. Integrates with GameManager for game over sound
6. Plays intro SFX after a configurable delay from game start

This creates centralized FMOD audio management.

## Component Structure

### AudioManager (MonoBehaviour, Singleton)

**Responsibilities:**
- Implement singleton pattern
- Store EventReference fields (Inspector-assignable)
- Store EventInstance fields (public access)
- Create EventInstances in InstantiateSFXs()
- Provide PlaySfx() method for playback
- Play intro SFX after configurable delay

**Dependencies:**
- FMOD Studio Unity Integration
- FMOD.Studio.EventReference
- FMOD.Studio.EventInstance
- FMODUnity.RuntimeManager

## Data Model

### Configuration Variables

```csharp
[Header("FMOD Events")]
[SerializeField] private EventReference gameOverRef;
[SerializeField] private EventReference introRef;

[Header("Timing")]
[SerializeField] private float introDelay = 3f;
```

### Runtime State

```csharp
private static AudioManager instance;
public EventInstance gameOverSfx;
public EventInstance introSfx;
```

### Public Properties

```csharp
public static AudioManager Instance => instance;
public EventInstance GameOverSfx => gameOverSfx;
public EventInstance IntroSfx => introSfx;
```

## Core Algorithms

### 1. Singleton Initialization

```
On Awake:
1. If instance == null:
   - Set instance = this
   - Call DontDestroyOnLoad(gameObject)
2. Else if instance != this:
   - Destroy(gameObject)
   - Return
3. Call InstantiateSFXs()
```

### 2. SFX Instantiation

```
InstantiateSFXs():
1. gameOverSfx = RuntimeManager.CreateInstance(gameOverRef)
2. introSfx = RuntimeManager.CreateInstance(introRef)
```

### 3. SFX Playback

```
PlaySfx(EventInstance sfx):
1. sfx.start()
```

### 4. Intro SFX Delayed Playback

```
On Awake (after InstantiateSFXs):
1. StartCoroutine(PlayIntroAfterDelay())

PlayIntroAfterDelay():
1. yield return new WaitForSeconds(introDelay)
2. PlaySfx(introSfx)
```

## Correctness Properties

### P1: Singleton Uniqueness
**Property:** For any game state, only one AudioManager instance exists
**Verification:** instance != null and only one GameObject with AudioManager
**Covers:** AC1.1, AC1.2

### P2: Singleton Persistence
**Property:** For any scene load, the AudioManager instance persists
**Verification:** DontDestroyOnLoad called on singleton instance
**Covers:** AC1.3

### P3: EventReference Storage
**Property:** EventReferences are serialized and assignable in Inspector
**Verification:** [SerializeField] private EventReference fields
**Covers:** AC2.1, AC2.3

### P4: EventInstance Creation
**Property:** EventInstances are created from EventReferences in Awake
**Verification:** RuntimeManager.CreateInstance() called in InstantiateSFXs()
**Covers:** AC3.1, AC3.2, AC3.3, AC3.4

### P5: Playback Functionality
**Property:** PlaySfx() starts the provided EventInstance
**Verification:** sfx.start() called
**Covers:** AC4.1, AC4.2, AC4.3

### P6: GameOver Integration
**Property:** GameOver SFX plays when game ends
**Verification:** GameManager calls PlaySfx(GameOverSfx)
**Covers:** AC5.1, AC5.2, AC5.3

### P7: Intro SFX Delayed Playback
**Property:** For any configured introDelay, the intro SFX plays exactly introDelay seconds after game start
**Verification:** Coroutine waits introDelay seconds then calls PlaySfx(introSfx)
**Covers:** AC6.1, AC6.2, AC6.3, AC6.4

## Implementation Details

### Singleton Pattern

```csharp
private static AudioManager instance;

public static AudioManager Instance => instance;

void Awake()
{
    if (instance == null)
    {
        instance = this;
        DontDestroyOnLoad(gameObject);
    }
    else if (instance != this)
    {
        Destroy(gameObject);
        return;
    }
    
    InstantiateSFXs();
    StartCoroutine(PlayIntroAfterDelay());
}
```

### SFX Instantiation

```csharp
void InstantiateSFXs()
{
    gameOverSfx = RuntimeManager.CreateInstance(gameOverRef);
    introSfx = RuntimeManager.CreateInstance(introRef);
}
```

### PlaySfx Method

```csharp
public void PlaySfx(EventInstance sfx)
{
    sfx.start();
}
```

### Intro SFX Delayed Playback

```csharp
IEnumerator PlayIntroAfterDelay()
{
    yield return new WaitForSeconds(introDelay);
    PlaySfx(introSfx);
}
```

### EventReference and EventInstance Fields

```csharp
[Header("FMOD Events")]
[SerializeField] private EventReference gameOverRef;
[SerializeField] private EventReference introRef;

[Header("Timing")]
[SerializeField] private float introDelay = 3f;

public EventInstance gameOverSfx;
public EventInstance introSfx;

public EventInstance GameOverSfx => gameOverSfx;
public EventInstance IntroSfx => introSfx;
```

## Integration with GameManager

```csharp
// In GameManager.GameOverSequence()
IEnumerator GameOverSequence()
{
    yield return new WaitForSeconds(gameOverDelay);
    
    blackScreenPanel.SetActive(true);
    
    // Play FMOD game over sound
    AudioManager.Instance.PlaySfx(AudioManager.Instance.GameOverSfx);
    
    // ... rest of game over logic
}
```

## Edge Cases

### E1: Multiple AudioManager Instances
**Scenario:** Two AudioManager GameObjects in scene
**Handling:** Singleton pattern destroys duplicate

### E2: Missing EventReference Assignment
**Scenario:** EventReference not assigned in Inspector
**Handling:** RuntimeManager.CreateInstance() may return invalid instance

### E3: Invalid EventInstance
**Scenario:** EventInstance.start() called on invalid instance
**Handling:** FMOD logs error, no crash

### E4: FMOD Not Initialized
**Scenario:** FMOD Studio not properly set up
**Handling:** RuntimeManager calls may fail, log errors

### E5: Intro Delay Zero or Negative
**Scenario:** introDelay set to 0 or negative value
**Handling:** Coroutine still works, plays immediately or after minimal delay

## Performance Considerations

- **Singleton Access**: O(1) static property access
- **EventInstance Creation**: One-time cost in Awake
- **PlaySfx**: Minimal overhead, direct FMOD call
- **No Allocations**: EventInstances created once, reused

## Usage Examples

### Example 1: Play GameOver SFX

```csharp
// From GameManager
AudioManager.Instance.PlaySfx(AudioManager.Instance.GameOverSfx);
```

### Example 2: Intro SFX Plays After Delay

```csharp
// Automatically plays after introDelay seconds from game start
// No manual triggering needed
// Configure delay in Inspector
```

### Example 3: Add New SFX

```csharp
// In AudioManager
[SerializeField] private EventReference newSfxRef;
public EventInstance newSfx;

void InstantiateSFXs()
{
    gameOverSfx = RuntimeManager.CreateInstance(gameOverRef);
    introSfx = RuntimeManager.CreateInstance(introRef);
    newSfx = RuntimeManager.CreateInstance(newSfxRef);
}

// From any script
AudioManager.Instance.PlaySfx(AudioManager.Instance.newSfx);
```

## Future Enhancements (Out of Scope)

- Mute/unmute functionality
- Heartbeat system with FMOD
- Volume control
- 3D spatial audio
- FMOD parameters
- Event callbacks
- Stop/pause functionality
- Audio pooling for multiple instances
