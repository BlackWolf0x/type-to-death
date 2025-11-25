# Unity SFX System - Design

## Architecture Overview

The SFX System consists of a single `SFXManager` singleton that:
1. Stores references to all AudioClip assets
2. Provides public properties to retrieve AudioClips
3. Plays sound effects through a single AudioSource
4. Manages mute state globally
5. Provides simple API for sound playback

This creates a centralized, globally accessible sound effect system.

## Component Structure

### SFXManager (MonoBehaviour, Singleton)

**Responsibilities:**
- Implement singleton pattern with Instance property
- Store AudioClip references (Scream, future SFX)
- Provide public properties for AudioClip retrieval
- Play sound effects through AudioSource
- Manage mute/unmute state
- Validate AudioClip assignments

**Dependencies:**
- Unity AudioSource component
- AudioClip assets

## Data Model

### Configuration Variables

```csharp
[Header("Sound Effects")]
[SerializeField] private AudioClip scream;
```

### Runtime State

```csharp
private static SFXManager instance;
private AudioSource audioSource;
private bool isMuted = false;
```

### Public Properties

```csharp
public static SFXManager Instance => instance;
public AudioClip Scream => scream;
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
   - Return (prevent further execution)
3. Get or add AudioSource component
4. Configure AudioSource (spatialBlend = 0 for 2D)
5. Validate AudioClip assignments
```

### 2. Sound Effect Playback

```
Play(AudioClip clip):
1. If clip == null:
   - Log warning
   - Return
2. If isMuted:
   - Return (don't play)
3. audioSource.PlayOneShot(clip)
```

### 3. Mute Control

```
Mute():
1. Set isMuted = true

Unmute():
1. Set isMuted = false
```

### 4. AudioClip Validation

```
On Start:
1. If scream == null:
   - Log warning: "Scream AudioClip not assigned"
```

## Correctness Properties

### P1: Singleton Uniqueness
**Property:** For any game state, only one SFXManager instance exists
**Verification:** instance != null and only one GameObject with SFXManager
**Covers:** AC1.1, AC1.2, AC1.3

### P2: Singleton Persistence
**Property:** For any scene load, the SFXManager instance persists
**Verification:** DontDestroyOnLoad called on singleton instance
**Covers:** AC1.4

### P3: AudioClip Accessibility
**Property:** For any assigned AudioClip, it can be retrieved via public property
**Verification:** SFXManager.Instance.Scream returns the assigned AudioClip
**Covers:** AC2.2

### P4: Playback Correctness
**Property:** For any valid AudioClip, Play() triggers audio playback when not muted
**Verification:** audioSource.PlayOneShot() called with correct clip
**Covers:** AC3.1, AC3.2

### P5: Mute Enforcement
**Property:** For any Play() call when muted, no audio plays
**Verification:** Play() returns early when isMuted == true
**Covers:** AC3.3, AC3.4

### P6: Null Safety
**Property:** For any null AudioClip passed to Play(), no error occurs
**Verification:** Play() checks for null and logs warning
**Covers:** AC3.5

### P7: Mute State Control
**Property:** For any Mute() call, isMuted becomes true; for any Unmute() call, isMuted becomes false
**Verification:** isMuted flag updated correctly
**Covers:** AC4.1, AC4.2, AC4.3, AC4.4

### P8: Default Unmuted State
**Property:** At game start, sound effects are not muted
**Verification:** isMuted initialized to false
**Covers:** AC4.5

### P9: AudioSource Existence
**Property:** For any SFXManager instance, an AudioSource component exists
**Verification:** TryGetComponent or AddComponent ensures AudioSource
**Covers:** AC6.1, AC6.2, AC6.3

### P10: Scream Integration
**Property:** When monster starts sprinting, scream plays exactly once
**Verification:** MonsterController calls Play(Scream) when isSprinting becomes true
**Covers:** AC5.1, AC5.2, AC5.3, AC5.4

## Integration with MonsterController

### Integration Point

In `MonsterController.OnBlinkDetected()`, when `currentLives == 0`:

```csharp
if (currentLives == 0)
{
    isSprinting = true;
    
    // Play scream sound effect
    SFXManager.Instance.Play(SFXManager.Instance.Scream);
    
    // ... rest of sprint logic ...
}
```

**Benefits:**
- Simple one-line integration
- No AudioSource needed in MonsterController
- No Inspector references required
- Respects mute state automatically

## Implementation Details

### Singleton Pattern

```csharp
private static SFXManager instance;

public static SFXManager Instance => instance;

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
    
    // Initialize AudioSource...
}
```

### AudioSource Setup

```csharp
void Awake()
{
    // ... singleton logic ...
    
    if (!TryGetComponent(out audioSource))
    {
        audioSource = gameObject.AddComponent<AudioSource>();
    }
    
    audioSource.spatialBlend = 0f; // 2D sound
    audioSource.playOnAwake = false;
}
```

### Play Method

```csharp
public void Play(AudioClip clip)
{
    if (clip == null)
    {
        Debug.LogWarning("SFXManager: Cannot play null AudioClip");
        return;
    }
    
    if (isMuted)
    {
        return;
    }
    
    audioSource.PlayOneShot(clip);
}
```

### Mute Methods

```csharp
public void Mute()
{
    isMuted = true;
}

public void Unmute()
{
    isMuted = false;
}
```

## Edge Cases

### E1: Multiple SFXManager Instances
**Scenario:** Two SFXManager GameObjects in scene
**Handling:** Singleton pattern destroys duplicate, keeps first instance

### E2: Missing AudioClip Assignment
**Scenario:** Scream AudioClip not assigned in Inspector
**Handling:** Log warning at Start, Play() handles null gracefully

### E3: Play Called Before Initialization
**Scenario:** Script calls SFXManager.Instance.Play() before Awake
**Handling:** Instance property returns null, calling script gets NullReferenceException (expected Unity behavior)

### E4: Rapid Play Calls
**Scenario:** Play() called multiple times quickly
**Handling:** PlayOneShot allows overlapping sounds, each plays independently

### E5: Mute During Playback
**Scenario:** Mute() called while sound is playing
**Handling:** Current sound continues, new sounds blocked (expected behavior)

### E6: Scene Reload
**Scenario:** Scene reloads with DontDestroyOnLoad SFXManager
**Handling:** Singleton persists, continues working across scenes

## Performance Considerations

- **Singleton Access**: O(1) static property access
- **Play Method**: ~0.01ms (Unity AudioSource.PlayOneShot)
- **Memory**: Minimal (AudioClip references, one AudioSource)
- **No Allocations**: Play() method allocates nothing
- **AudioSource Reuse**: Single AudioSource for all SFX (efficient)

## Testing Strategy

### Manual Testing
1. Create SFXManager GameObject in scene
2. Assign Scream AudioClip in Inspector
3. Press Play
4. Trigger monster sprint (press Spacebar until lives = 0)
5. Verify scream plays
6. Test mute/unmute functionality
7. Verify no errors in Console

### Integration Testing
1. Test SFXManager.Instance access from multiple scripts
2. Test Play() with valid AudioClip
3. Test Play() with null AudioClip
4. Test Mute() prevents playback
5. Test Unmute() allows playback
6. Test scream plays on monster sprint

### Edge Case Testing
1. Test with missing AudioClip assignment
2. Test multiple SFXManager instances (should destroy duplicates)
3. Test rapid Play() calls
4. Test scene reload (singleton persistence)

## Usage Examples

### Example 1: Play Scream from MonsterController

```csharp
// In MonsterController.OnBlinkDetected()
if (currentLives == 0)
{
    isSprinting = true;
    SFXManager.Instance.Play(SFXManager.Instance.Scream);
}
```

### Example 2: Mute/Unmute from UI

```csharp
public class SettingsUI : MonoBehaviour
{
    public void OnMuteToggle(bool muted)
    {
        if (muted)
        {
            SFXManager.Instance.Mute();
        }
        else
        {
            SFXManager.Instance.Unmute();
        }
    }
}
```

### Example 3: Play from Any Script

```csharp
public class AnyScript : MonoBehaviour
{
    void SomeMethod()
    {
        // Access singleton, get AudioClip, play
        SFXManager.Instance.Play(SFXManager.Instance.Scream);
    }
}
```

## Future Enhancements (Out of Scope)

- Volume control (master volume, per-SFX volume)
- Audio categories/groups (UI, gameplay, environment)
- Multiple AudioSource pooling for overlapping sounds
- Pitch variation for variety
- Random sound selection from arrays
- Audio fade in/out
- 3D spatial audio support
- Audio priority system
- Sound effect queueing
- Audio mixing/effects
- Save/load mute preference
- Per-category mute control
