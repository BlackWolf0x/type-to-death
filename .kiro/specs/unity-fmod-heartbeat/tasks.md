# Unity FMOD Heartbeat - Implementation Plan

## Tasks Overview

- [x] 1. Add Heartbeat Data Structures
  - Add serialized array: EventReference[] heartbeatIntensities (size 4)
  - Add private EventInstance heartbeatInstance field
  - Add private int currentHeartbeatIndex field (initialize to -1)
  - _Properties: P1, P6_
  - _Requirements: AC1.1, AC1.2, AC1.3, AC2.4_

- [x] 2. Add Heartbeat Validation
  - In Start(), after existing validation
  - Loop through heartbeatIntensities array (0 to 3)
  - Check if each EventReference.IsNull
  - Log warning for missing EventReferences
  - _Properties: P1_
  - _Requirements: AC1.4_

- [x] 3. Implement GameObserver Subscription
  - Add OnEnable() method (or extend existing)
  - Subscribe: GameObserver.Notifier += OnLoseCompletionChanged
  - Modify OnDisable() method (or create if missing)
  - Unsubscribe: GameObserver.Notifier -= OnLoseCompletionChanged
  - Add cleanup: stop and release heartbeatInstance if valid
  - _Properties: P5, P7_
  - _Requirements: AC4.1, AC4.2, AC5.4_

- [x] 4. Implement Intensity Calculation
  - Create GetHeartbeatIndex(float loseCompletion) method
  - If loseCompletion < 25f: return 0
  - Else if loseCompletion < 50f: return 1
  - Else if loseCompletion < 75f: return 2
  - Else: return 3
  - _Properties: P2_
  - _Requirements: AC3.1, AC3.2, AC3.3, AC3.4_

- [x] 5. Implement Lose Completion Handler
  - Create OnLoseCompletionChanged(float percentage) method
  - Calculate newIndex = GetHeartbeatIndex(percentage)
  - If newIndex != currentHeartbeatIndex:
    - Set currentHeartbeatIndex = newIndex
    - Call PlayHeartbeat()
  - _Properties: P4_
  - _Requirements: AC3.5, AC4.3, AC4.4_

- [x] 6. Implement PlayHeartbeat Method
  - Create public PlayHeartbeat() method
  - If heartbeatInstance.isValid(): stop and release it
  - Validate currentHeartbeatIndex is in range [0, 3]
  - Get eventRef from heartbeatIntensities[currentHeartbeatIndex]
  - Check if eventRef.IsNull, return if true
  - Create heartbeatInstance = RuntimeManager.CreateInstance(eventRef)
  - Call heartbeatInstance.start()
  - _Properties: P3_
  - _Requirements: AC2.1, AC2.2, AC2.3_

- [x] 7. Implement StopHeartbeat Method
  - Create public StopHeartbeat() method
  - If heartbeatInstance.isValid():
    - Call heartbeatInstance.stop(FMOD.Studio.STOP_MODE.IMMEDIATE)
    - Call heartbeatInstance.release()
  - Set currentHeartbeatIndex = -1
  - _Properties: P7_
  - _Requirements: AC5.1, AC5.2, AC5.3_

- [x] 8. Integrate with GameManager
  - Open GameManager.cs
  - Find GameOverSequence() coroutine
  - After AudioManager.Instance.PlayGameOver()
  - Add: AudioManager.Instance.StopHeartbeat()
  - _Properties: P7_
  - _Requirements: AC5.1_

## Manual Unity Setup Tasks

### Setup Task A: Create Heartbeat FMOD Events
1. Open FMOD Studio project
2. Create 4 heartbeat events:
   - event:/SFX/Heartbeat/Intensity_1
   - event:/SFX/Heartbeat/Intensity_2
   - event:/SFX/Heartbeat/Intensity_3
   - event:/SFX/Heartbeat/Intensity_4
3. Configure each event:
   - Enable looping
   - Set as 2D audio
   - Adjust volume per intensity
4. Build FMOD banks

### Setup Task B: Assign Heartbeat EventReferences
1. Select AudioManager GameObject in scene
2. Find "Heartbeat Intensities" array in Inspector
3. Set array size to 4 (should be default)
4. Assign heartbeat EventReferences to array:
   - Element 0: event:/SFX/Heartbeat/Intensity_1
   - Element 1: event:/SFX/Heartbeat/Intensity_2
   - Element 2: event:/SFX/Heartbeat/Intensity_3
   - Element 3: event:/SFX/Heartbeat/Intensity_4

### Setup Task C: Test Heartbeat System
1. Press Play in Unity Editor
2. Trigger blinks to increase lose completion
3. Verify heartbeat starts at intensity 1
4. Verify heartbeat switches to intensity 2 at 25%
5. Verify heartbeat switches to intensity 3 at 50%
6. Verify heartbeat switches to intensity 4 at 75%
7. Verify heartbeat stops on game over
8. Check Console for FMOD errors

## Implementation Notes

- **EventInstance Management**: Stop and release before creating new instance
- **Automatic Switching**: Heartbeat intensity updates automatically via GameObserver
- **Clean Stop**: StopHeartbeat releases EventInstance properly
- **Minimal Comments**: Keep code clean and self-explanatory
- **FMOD Looping**: Configure looping in FMOD Studio, not in code

## Estimated Effort

- Total Tasks: 8 coding tasks + 3 manual setup tasks
- Estimated Coding Time: 45 minutes
- Estimated Setup Time: 20 minutes (FMOD event creation)
- Complexity: Low-Medium
- Risk Level: Low

## Dependencies

- AudioManager script (existing)
- GameObserver script (Notifier action)
- GameManager script (for stop integration)
- 4 heartbeat FMOD events
- FMOD Unity Integration package

## Integration Notes

### Heartbeat Intensity Ranges

```
Lose Completion → Heartbeat Index
0-24%  → Index 0 (Intensity 1)
25-49% → Index 1 (Intensity 2)
50-74% → Index 2 (Intensity 3)
75-100% → Index 3 (Intensity 4)
```

### Usage Pattern

```csharp
// Automatic (via GameObserver)
// Heartbeat starts and switches automatically based on lose completion

// Manual control
AudioManager.Instance.PlayHeartbeat();  // Start/restart heartbeat
AudioManager.Instance.StopHeartbeat();  // Stop heartbeat
```

## Performance Notes

- **EventInstance Management**: One active heartbeat instance at a time
- **Intensity Switching**: O(1) comparison, negligible cost
- **Looping**: FMOD handles efficiently, no per-frame cost
- **Memory**: Properly release instances to prevent leaks

## Code Style Notes

- **No XML summaries**: Keep code clean
- **Minimal comments**: Only comment non-obvious logic
- **Self-documenting**: Clear variable and method names
- **Concise**: Avoid verbose implementations

## FMOD-Specific Notes

- **EventReference.IsNull**: Check before creating instance
- **EventInstance.isValid()**: Check before stop/release
- **STOP_MODE.IMMEDIATE**: Stop immediately without fade
- **RuntimeManager.CreateInstance**: Create new instance from EventReference
- **release()**: Always release after stop to prevent memory leaks
