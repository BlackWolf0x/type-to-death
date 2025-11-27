# Unity FMOD Heartbeat - Implementation Report

**Date:** 2025-11-27  
**Status:** ✅ All Coding Tasks Complete

## Summary

Successfully implemented the FMOD-based heartbeat system in AudioManager. The system dynamically switches between 4 heartbeat intensity levels based on lose completion percentage using FMOD EventInstances.

## Implementation Details

### AudioManager Extensions

**Added Fields:**
```csharp
[Header("Heartbeat System")]
[SerializeField] private EventReference[] heartbeatIntensities = new EventReference[4];

private EventInstance heartbeatInstance;
private int currentHeartbeatIndex = -1;
```

**Added Methods:**
- `Start()` - Validates heartbeat EventReferences
- `ValidateHeartbeatReferences()` - Checks for missing EventReferences
- `OnEnable()` - Subscribes to GameObserver.Notifier
- `OnDisable()` - Unsubscribes and cleans up heartbeat EventInstance
- `GetHeartbeatIndex(float)` - Calculates intensity index from percentage
- `OnLoseCompletionChanged(float)` - Handles lose completion updates
- `PlayHeartbeat()` - Starts/switches heartbeat intensity
- `StopHeartbeat()` - Stops and releases heartbeat EventInstance

### GameManager Integration

**Modified:**
- `GameOverSequence()` - Now calls `AudioManager.Instance.StopHeartbeat()` instead of SFXManager

## Key Features

### Automatic Intensity Switching

The heartbeat automatically switches intensity based on lose completion:
- **0-24%**: Intensity 1 (index 0)
- **25-49%**: Intensity 2 (index 1)
- **50-74%**: Intensity 3 (index 2)
- **75-100%**: Intensity 4 (index 3)

### FMOD EventInstance Management

- Properly stops and releases EventInstance before creating new one
- Cleans up EventInstance in OnDisable to prevent memory leaks
- Uses `STOP_MODE.IMMEDIATE` for instant stopping

### GameObserver Integration

- Subscribes to `GameObserver.Notifier` in OnEnable
- Unsubscribes in OnDisable
- Automatically responds to lose completion changes

## Completed Tasks

✅ Task 1: Add Heartbeat Data Structures  
✅ Task 2: Add Heartbeat Validation  
✅ Task 3: Implement GameObserver Subscription  
✅ Task 4: Implement Intensity Calculation  
✅ Task 5: Implement Lose Completion Handler  
✅ Task 6: Implement PlayHeartbeat Method  
✅ Task 7: Implement StopHeartbeat Method  
✅ Task 8: Integrate with GameManager  

## Manual Setup Required

### Setup Task A: Create Heartbeat FMOD Events

You need to create 4 FMOD events in FMOD Studio:

1. **Event Paths:**
   - `event:/SFX/Heartbeat/Intensity_1`
   - `event:/SFX/Heartbeat/Intensity_2`
   - `event:/SFX/Heartbeat/Intensity_3`
   - `event:/SFX/Heartbeat/Intensity_4`

2. **Configuration for each event:**
   - Enable looping (loop region in timeline)
   - Set as 2D audio
   - Adjust volume per intensity (louder for higher intensities)

3. **Build FMOD banks** after creating events

### Setup Task B: Assign EventReferences in Unity

1. Select AudioManager GameObject in scene
2. Find "Heartbeat Intensities" array in Inspector
3. Set array size to 4
4. Assign EventReferences:
   - Element 0: `event:/SFX/Heartbeat/Intensity_1`
   - Element 1: `event:/SFX/Heartbeat/Intensity_2`
   - Element 2: `event:/SFX/Heartbeat/Intensity_3`
   - Element 3: `event:/SFX/Heartbeat/Intensity_4`

### Setup Task C: Test Heartbeat System

1. Press Play in Unity Editor
2. Trigger blinks to increase lose completion
3. Verify heartbeat starts at intensity 1 (0%)
4. Verify heartbeat switches to intensity 2 at 25%
5. Verify heartbeat switches to intensity 3 at 50%
6. Verify heartbeat switches to intensity 4 at 75%
7. Verify heartbeat stops on game over
8. Check Console for FMOD errors

## Code Quality

✅ No compilation errors  
✅ Follows Unity 6.1 standards  
✅ Proper FMOD EventInstance management  
✅ Memory leak prevention (release in OnDisable)  
✅ Clean code with minimal comments  
✅ Self-documenting method names  

## Usage Examples

### Automatic (Recommended)

The heartbeat starts and switches automatically based on GameObserver notifications. No manual calls needed during gameplay.

### Manual Control

```csharp
// Start/restart heartbeat at current intensity
AudioManager.Instance.PlayHeartbeat();

// Stop heartbeat
AudioManager.Instance.StopHeartbeat();
```

## Performance Notes

- **EventInstance Management**: One active heartbeat instance at a time
- **Intensity Switching**: O(1) comparison, negligible cost
- **Looping**: FMOD handles efficiently, no per-frame cost
- **Memory**: Properly releases instances to prevent leaks

## Integration Points

### With GameObserver
- Subscribes to lose completion updates
- Automatically switches intensity when crossing range boundaries

### With GameManager
- Stops heartbeat during game over sequence
- Ensures clean audio state on game end

## Next Steps

1. Create 4 heartbeat FMOD events in FMOD Studio
2. Configure looping and volume for each intensity
3. Build FMOD banks
4. Assign EventReferences in Unity Inspector
5. Test intensity switching during gameplay
6. Verify heartbeat stops on game over

## Notes

- The system mirrors the SFXManager heartbeat functionality but uses FMOD instead of Unity AudioClips
- FMOD provides better audio performance and more control over sound design
- Looping is configured in FMOD Studio, not in code
- EventInstance cleanup is critical to prevent memory leaks
