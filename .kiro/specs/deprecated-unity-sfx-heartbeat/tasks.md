# Unity SFX Heartbeat - Implementation Plan

## Tasks Overview

- [x] 1. Add Heartbeat Data Structures
  - Add serialized array: AudioClip[] heartbeatIntensities (size 4)
  - Add private AudioSource heartbeatSource field
  - Add private int currentHeartbeatIndex field (initialize to -1)
  - _Properties: P1, P6_
  - _Requirements: AC1.1, AC1.2, AC1.3, AC2.4_

- [x] 2. Setup Heartbeat AudioSource
  - In Awake(), after main AudioSource setup
  - Add AudioSource component: heartbeatSource = gameObject.AddComponent<AudioSource>()
  - Set heartbeatSource.loop = true
  - Set heartbeatSource.spatialBlend = 0f (2D audio)
  - Set heartbeatSource.playOnAwake = false
  - _Properties: P3, P6_
  - _Requirements: AC2.4_

- [x] 3. Add Heartbeat Validation
  - In Start(), after existing validation
  - Loop through heartbeatIntensities array (0 to 3)
  - Check if each element is null
  - Log warning for missing AudioClips
  - _Properties: P1_
  - _Requirements: AC1.4_

- [x] 4. Implement GameObserver Subscription
  - Add OnEnable() method (or extend existing)
  - Subscribe: GameObserver.Notifier += OnLoseCompletionChanged
  - Add OnDisable() method (or extend existing)
  - Unsubscribe: GameObserver.Notifier -= OnLoseCompletionChanged
  - _Properties: P5_
  - _Requirements: AC4.1, AC4.2_

- [x] 5. Implement Intensity Calculation
  - Create GetHeartbeatIndex(float loseCompletion) method
  - If loseCompletion < 25f: return 0
  - Else if loseCompletion < 50f: return 1
  - Else if loseCompletion < 75f: return 2
  - Else: return 3
  - _Properties: P2_
  - _Requirements: AC3.1, AC3.2, AC3.3, AC3.4_

- [x] 6. Implement Lose Completion Handler
  - Create OnLoseCompletionChanged(float percentage) method
  - Calculate newIndex = GetHeartbeatIndex(percentage)
  - If newIndex != currentHeartbeatIndex:
    - Set currentHeartbeatIndex = newIndex
    - Call PlayHeartbeat()
  - _Properties: P4_
  - _Requirements: AC3.5, AC4.3, AC4.4_

- [x] 7. Implement PlayHeartbeat Method
  - Create public PlayHeartbeat() method
  - Check if isMuted, return early if true
  - Validate currentHeartbeatIndex is in range [0, 3]
  - Get clip from heartbeatIntensities[currentHeartbeatIndex]
  - Check if clip is null, return if true
  - Set heartbeatSource.clip = clip
  - Call heartbeatSource.Play()
  - _Properties: P3_
  - _Requirements: AC2.1, AC2.2, AC2.3_

- [x] 8. Implement StopHeartbeat Method
  - Create public StopHeartbeat() method
  - Call heartbeatSource.Stop()
  - Set currentHeartbeatIndex = -1
  - _Properties: P7_
  - _Requirements: AC5.1, AC5.2, AC5.3_

- [x] 9. Integrate with GameManager
  - Open GameManager.cs
  - Find GameOverSequence() coroutine
  - After SFXManager.Instance.Play(SFXManager.Instance.GameOver)
  - Add: SFXManager.Instance.StopHeartbeat()
  - _Properties: P7_
  - _Requirements: AC5.1_

## Manual Unity Setup Tasks

### Setup Task A: Import Heartbeat Audio Files
1. Import 4 heartbeat audio files (intensity 1-4)
2. Place in Assets/Audio/Heartbeat/ folder
3. Configure as AudioClips in Inspector
4. Name them clearly (e.g., Heartbeat_1, Heartbeat_2, etc.)

### Setup Task B: Assign Heartbeat AudioClips
1. Select SFXManager GameObject in scene
2. Find "Heartbeat Intensities" array in Inspector
3. Set array size to 4 (should be default)
4. Assign heartbeat AudioClips to array:
   - Element 0: Intensity 1 (lowest)
   - Element 1: Intensity 2
   - Element 2: Intensity 3
   - Element 3: Intensity 4 (highest)

### Setup Task C: Test Heartbeat System
1. Press Play in Unity Editor
2. Trigger blinks to increase lose completion
3. Verify heartbeat starts at intensity 1
4. Verify heartbeat switches to intensity 2 at 25%
5. Verify heartbeat switches to intensity 3 at 50%
6. Verify heartbeat switches to intensity 4 at 75%
7. Verify heartbeat stops on game over

## Implementation Notes

- **Two AudioSources**: Main for SFX, heartbeatSource for looping heartbeat
- **Automatic Switching**: Heartbeat intensity updates automatically via GameObserver
- **Mute Respect**: PlayHeartbeat checks isMuted flag
- **Clean Stop**: StopHeartbeat resets currentHeartbeatIndex to -1
- **Minimal Comments**: Keep code clean and self-explanatory

## Estimated Effort

- Total Tasks: 9 coding tasks + 3 manual setup tasks
- Estimated Coding Time: 45 minutes
- Estimated Setup Time: 15 minutes
- Complexity: Low-Medium
- Risk Level: Low

## Dependencies

- SFXManager script (existing)
- GameObserver script (Notifier action)
- GameManager script (for stop integration)
- 4 heartbeat AudioClip assets

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
SFXManager.Instance.PlayHeartbeat();  // Start/restart heartbeat
SFXManager.Instance.StopHeartbeat();  // Stop heartbeat
```

## Performance Notes

- **Two AudioSources**: Minimal overhead, standard Unity approach
- **Intensity Switching**: O(1) comparison, negligible cost
- **Looping**: Unity handles efficiently, no per-frame cost
- **No Allocations**: All operations use existing references

## Code Style Notes

- **No XML summaries**: Keep code clean
- **Minimal comments**: Only comment non-obvious logic
- **Self-documenting**: Clear variable and method names
- **Concise**: Avoid verbose implementations
