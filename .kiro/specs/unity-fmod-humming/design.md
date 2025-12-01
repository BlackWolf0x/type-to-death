# Unity FMOD Humming - Design

## Architecture Overview

The humming system plays a looping sound automatically when lose completion reaches 75%. When the player reaches 1 life remaining, the humming pitch increases suddenly to create maximum tension. It integrates with AudioManager's lose completion monitoring and MonsterController for pitch control.

**Main Components:**
1. **AudioManager** - Stores humming EventReference and pitch value, creates EventInstance, automatically plays at 75% lose completion, provides pitch increase method
2. **MonsterController** - Triggers pitch increase when currentLives == 1
3. **GameObserver** - Provides lose completion percentage updates via Notifier action

## Component Structure

### AudioManager

**Responsibilities:**
- Store humming EventReference and pitch increase value as serialized fields
- Create humming EventInstance at initialization
- Subscribe to GameObserver.Notifier for lose completion updates
- Automatically play humming when lose completion reaches 75%
- Track humming playing state to prevent duplicate playback
- Provide IncreaseHummingPitch() method to set pitch
- Provide StopHumming() method to stop humming with fade out
- Release humming EventInstance on disable

**Dependencies:**
- FMOD Unity Integration
- Humming FMOD event (assigned in Inspector)
- GameObserver.Notifier action

### MonsterController

**Responsibilities:**
- Call AudioManager.Instance.IncreaseHummingPitch() when currentLives == 1
- Trigger pitch increase after teleport to goal distance and final pose application

**Dependencies:**
- AudioManager singleton instance

## Data Model

### AudioManager Configuration

```csharp
[Header("Humming")]
[SerializeField] private EventReference hummingRef;
[SerializeField] private EventReference whispersRef;
[SerializeField] private float hummingPitchIncrease = 2f;
```

### AudioManager Runtime State

```csharp
private EventInstance hummingInstance;
private EventInstance whispersInstance;
private bool isHummingPlaying = false;
```

## Core Algorithms

### 1. Humming Initialization

```
In InstantiateSFXs():
1. Check if hummingRef is not null
2. Create EventInstance: hummingInstance = RuntimeManager.CreateInstance(hummingRef)
3. Store instance for later use
```

### 2. Play Humming

```
PlayHumming():
1. Check if isInitialized is true
2. Check if hummingInstance is valid
3. Start the instance: hummingInstance.start()
4. Instance will loop automatically (configured in FMOD)
```

### 3. Stop Humming

```
StopHumming():
1. Check if hummingInstance is valid
2. Stop with fade out: hummingInstance.stop(STOP_MODE.ALLOWFADEOUT)
```

### 4. Automatic Humming Playback

```
In OnLoseCompletionChanged(percentage):
1. Update heartbeat intensity as usual
2. If percentage >= 75% AND !isHummingPlaying:
   - Call PlayHumming()
   - Set isHummingPlaying = true
```

### 5. Pitch Increase and Whispers Start

```
IncreaseHummingPitch():
1. Check if hummingInstance is valid
2. Set pitch: hummingInstance.setPitch(hummingPitchIncrease)
3. Check if whispersInstance is valid
4. Start whispers: whispersInstance.start()
```

### 6. MonsterController Integration

```
In OnBlinkDetected():
1. After decrementing currentLives
2. If currentLives == 1:
   - Teleport to goal distance
   - Apply final pose
   - Call AudioManager.Instance.IncreaseHummingPitch()
3. If currentLives == 0:
   - Set isSprinting = true
   - Trigger sprint animation
   - (Humming stops automatically via StopHeartbeat on game over)
```

## Correctness Properties

### P1: Humming Plays at 75% Lose Completion
**Property:** For any game state where lose completion reaches 75% or higher, the humming sound shall be playing
**Verification:** After OnLoseCompletionChanged(75), hummingInstance.isValid() returns true and playback state is PLAYING
**Covers:** AC2.4, AC2.5

### P2: Humming Plays Only Once
**Property:** For any game state where humming is already playing, calling PlayHumming() again shall not create duplicate instances
**Verification:** isHummingPlaying flag prevents multiple calls to hummingInstance.start()
**Covers:** AC2.5

### P3: Pitch Increases at 1 Life
**Property:** For any game state where currentLives equals 1, the humming pitch shall be set to hummingPitchIncrease value
**Verification:** After IncreaseHummingPitch() is called, hummingInstance pitch equals hummingPitchIncrease
**Covers:** AC3.5, AC3.6

### P4: Humming Stops on Game Over
**Property:** For any game over scenario, the humming sound shall be stopped
**Verification:** StopHeartbeat() calls StopHumming(), which stops the instance with fade out
**Covers:** AC4.2, AC4.3

### P5: Humming Instance Lifecycle
**Property:** For any humming EventInstance created, it shall be properly released on AudioManager disable
**Verification:** In OnDisable(), hummingInstance.release() is called if instance is valid
**Covers:** AC1.4

## Integration Points

### AudioManager Modifications

**New Fields:**
```csharp
[Header("Humming")]
[SerializeField] private EventReference hummingRef;
[SerializeField] private EventReference whispersRef;
[SerializeField] private float hummingPitchIncrease = 2f;
private EventInstance hummingInstance;
private EventInstance whispersInstance;
private bool isHummingPlaying = false;
```

**Modified Methods:**

**InstantiateSFXs()** - Add humming and whispers instance creation:
```csharp
if (!hummingRef.IsNull)
{
    hummingInstance = RuntimeManager.CreateInstance(hummingRef);
}

if (!whispersRef.IsNull)
{
    whispersInstance = RuntimeManager.CreateInstance(whispersRef);
}
```

**OnDisable()** - Add humming and whispers instance cleanup:
```csharp
if (hummingInstance.isValid())
{
    hummingInstance.stop(FMOD.Studio.STOP_MODE.IMMEDIATE);
    hummingInstance.release();
}

if (whispersInstance.isValid())
{
    whispersInstance.stop(FMOD.Studio.STOP_MODE.IMMEDIATE);
    whispersInstance.release();
}
```

**Modified Methods:**

**OnLoseCompletionChanged()** - Add automatic humming playback:
```csharp
void OnLoseCompletionChanged(float percentage)
{
    // ... existing heartbeat logic ...
    
    // Play humming when lose completion reaches 75% or higher
    if (percentage >= 75f && !isHummingPlaying)
    {
        PlayHumming();
        isHummingPlaying = true;
    }
}
```

**StopHeartbeat()** - Add humming stop:
```csharp
public void StopHeartbeat()
{
    // ... existing heartbeat stop logic ...
    
    // Also stop humming when stopping heartbeat (game over scenario)
    StopHumming();
}
```

**New Methods:**
```csharp
public void PlayHumming()
{
    if (!isInitialized) return;
    if (!hummingInstance.isValid()) return;
    hummingInstance.start();
}

public void StopHumming()
{
    if (hummingInstance.isValid())
    {
        hummingInstance.stop(FMOD.Studio.STOP_MODE.ALLOWFADEOUT);
        isHummingPlaying = false;
    }
    
    if (whispersInstance.isValid())
    {
        whispersInstance.stop(FMOD.Studio.STOP_MODE.ALLOWFADEOUT);
    }
}

public void IncreaseHummingPitch()
{
    if (hummingInstance.isValid())
    {
        hummingInstance.setPitch(hummingPitchIncrease);
    }
    
    if (whispersInstance.isValid())
    {
        whispersInstance.start();
    }
}
```

### MonsterController Modifications

**Modified Method - OnBlinkDetected():**

In the `currentLives == 1` branch (after applying final pose):
```csharp
else if (currentLives == 1)
{
    TeleportToGoalDistance();
    MonsterLog($"Teleported to goal distance ({goalDistance} units from camera).");
    
    ApplyPose(finalPose);
    MonsterLog("Final pose applied.");
    
    // NEW: Increase humming pitch
    AudioManager.Instance.IncreaseHummingPitch();
}
```

Note: Humming playback and stop are now handled automatically by AudioManager based on lose completion percentage.

## Edge Cases

### E1: Humming Reference Not Assigned
**Scenario:** hummingRef is null in Inspector
**Handling:** InstantiateSFXs() checks IsNull before creating instance, PlayHumming() checks isValid() before starting

### E2: Humming Already Playing
**Scenario:** Lose completion reaches 75% multiple times or PlayHumming() called when already playing
**Handling:** isHummingPlaying flag prevents duplicate playback attempts

### E3: AudioManager Not Initialized
**Scenario:** PlayHumming() called before FMOD banks loaded
**Handling:** PlayHumming() checks isInitialized flag before attempting playback

## Performance Considerations

- Humming uses a single EventInstance (minimal memory overhead)
- No per-frame updates required (event-driven)
- FMOD handles looping internally (no Unity Update loop needed)
- Fade out on stop prevents audio pops

## Testing Strategy

### Manual Testing

1. **Test Humming Start:**
   - Start game with 5 lives
   - Blink until lose completion reaches 75%
   - Verify humming sound starts playing automatically
   - Verify humming loops continuously

2. **Test Pitch Increase:**
   - Continue from humming playing state
   - Blink until currentLives == 1
   - Verify humming pitch increases suddenly
   - Verify pitch matches hummingPitchIncrease value in Inspector

3. **Test Humming Stop:**
   - Continue to game over
   - Verify humming stops smoothly
   - Verify no audio-related errors

4. **Test Inspector Control:**
   - Adjust hummingPitchIncrease value in Inspector
   - Play through to 1 life
   - Verify pitch matches new Inspector value

5. **Test Edge Cases:**
   - Test with hummingRef not assigned (should not error)
   - Test with hummingPitchIncrease set to 0 (should work)
   - Test with very high pitch values (should clamp appropriately)

### Integration Testing

1. Verify humming plays automatically at 75% lose completion
2. Verify pitch increases when currentLives == 1
3. Verify humming stops on game over (via StopHeartbeat)
4. Verify no FMOD errors in Console
5. Verify EventInstance properly released on scene unload
6. Verify isHummingPlaying flag prevents duplicate playback

## Future Enhancements (Out of Scope)

- Volume control based on distance to camera
- Gradual pitch ramping (currently sudden increase only)
- Pitch decrease or reset functionality
- Multiple humming variations (random selection)
- Fade in duration when starting
- Spatial audio positioning (3D sound)
- Advanced FMOD parameter automation
