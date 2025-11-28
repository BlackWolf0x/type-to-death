# Unity SFX System - Implementation Plan

## Tasks Overview

- [x] 1. Create SFXManager Script Structure
  - Create `SFXManager.cs` in `Assets/Scripts/`
  - Add singleton instance field and property
  - Add AudioSource component reference
  - Add isMuted boolean field
  - Add serialized field for GameOver AudioClip
  - Add public property for GameOver AudioClip
  - _Properties: P1, P3, P8_
  - _Requirements: AC1.1, AC2.1, AC2.2, AC4.5_

- [x] 2. Implement Singleton Pattern
  - Implement Awake() method
  - Check if instance is null, set to this
  - If instance exists and is not this, destroy gameObject
  - Call DontDestroyOnLoad on singleton instance
  - Add debug logging for singleton initialization
  - _Properties: P1, P2_
  - _Requirements: AC1.1, AC1.2, AC1.3, AC1.4_

- [x] 3. Implement AudioSource Setup
  - In Awake(), get or add AudioSource component
  - Use TryGetComponent, if false then AddComponent
  - Set spatialBlend = 0 (2D audio)
  - Set playOnAwake = false
  - Add debug logging for AudioSource setup
  - _Properties: P9_
  - _Requirements: AC6.1, AC6.2, AC6.3, AC6.4_

- [x] 4. Implement AudioClip Validation
  - Implement Start() method
  - Check if gameOver AudioClip is null
  - If null, log warning message
  - Continue execution (non-critical)
  - _Properties: P3_
  - _Requirements: AC2.3, AC2.4_

- [x] 5. Implement Play Method
  - Create public Play(AudioClip clip) method
  - Check if clip is null, log warning and return
  - Check if isMuted, return early
  - Call audioSource.PlayOneShot(clip)
  - _Properties: P4, P5, P6_
  - _Requirements: AC3.1, AC3.2, AC3.3, AC3.4, AC3.5_

- [x] 6. Implement Mute/Unmute Methods
  - Create public Mute() method
  - Set isMuted = true
  - Create public Unmute() method
  - Set isMuted = false
  - _Properties: P7_
  - _Requirements: AC4.1, AC4.2, AC4.3, AC4.4_

- [x] 7. Integrate with GameManager
  - Open GameManager.cs
  - Find GameOverSequence() coroutine
  - After blackScreenPanel.SetActive(true)
  - Add line: SFXManager.Instance.Play(SFXManager.Instance.GameOver);
  - Place before monsterObject.SetActive(false)
  - _Properties: P10_
  - _Requirements: AC5.1, AC5.2, AC5.3, AC5.4_

- [x] 8. Testing and Validation
  - Verify code compiles without errors
  - Test singleton pattern (only one instance)
  - Test Play() with valid AudioClip
  - Test Play() with null AudioClip
  - Test Mute() prevents playback
  - Test Unmute() allows playback
  - Test game over sound plays when black screen appears
  - Test DontDestroyOnLoad persistence
  - _Properties: All_
  - _Requirements: All_

## Implementation Notes

- **Singleton Pattern**: Standard Unity singleton with DontDestroyOnLoad
- **AudioSource Reuse**: Single AudioSource for all SFX (PlayOneShot allows overlapping)
- **Minimal Comments**: Code should be self-explanatory, avoid over-commenting
- **No XML Summaries**: Skip XML documentation comments for brevity
- **Simple API**: SFXManager.Instance.Play(SFXManager.Instance.Scream)
- **Mute State**: Simple boolean flag, no complex state management
- **Integration**: One line added to GameManager

## Unity Setup Tasks (Manual)

### Setup Task A: Create SFXManager GameObject
1. Create empty GameObject in scene
2. Name it "SFXManager"
3. Attach SFXManager script
4. Assign GameOver AudioClip in Inspector

### Setup Task B: Import GameOver Audio
1. Import game over audio file (e.g., GameOver.wav)
2. Place in Assets/Audio/ folder
3. Configure as AudioClip in Inspector
4. Assign to SFXManager's GameOver field

### Setup Task C: Test in Play Mode
1. Press Play in Unity Editor
2. Open Console window
3. Trigger game over (blinks until 100% lose completion)
4. Verify game over sound plays when black screen appears
5. Test mute/unmute (via Inspector or test script)

### Setup Task D: Test Singleton Persistence
1. Create second scene
2. Add scene transition logic
3. Verify SFXManager persists across scenes
4. Verify only one instance exists

## Estimated Effort

- Total Tasks: 8 coding tasks + 4 manual setup tasks
- Estimated Coding Time: 1 hour
- Estimated Testing Time: 30 minutes
- Complexity: Low
- Risk Level: Low

## Dependencies

- Unity 6.1 audio system
- MonsterController script (for integration)
- Scream AudioClip asset
- Understanding of singleton pattern

## Integration Notes

### Adding New Sound Effects

To add a new sound effect:

1. **Add serialized field**
```csharp
[SerializeField] private AudioClip newSound;
```

2. **Add public property**
```csharp
public AudioClip NewSound => newSound;
```

3. **Validate in Start()**
```csharp
if (newSound == null)
{
    Debug.LogWarning("SFXManager: NewSound AudioClip not assigned");
}
```

4. **Use from any script**
```csharp
SFXManager.Instance.Play(SFXManager.Instance.NewSound);
```

### Usage Pattern

```csharp
// From any script, no references needed
SFXManager.Instance.Play(SFXManager.Instance.Scream);

// Mute control
SFXManager.Instance.Mute();
SFXManager.Instance.Unmute();
```

## Performance Notes

- **Singleton Access**: O(1) static property lookup
- **Play Method**: ~0.01ms per call
- **No Allocations**: Play() allocates nothing
- **AudioSource Reuse**: Efficient, no instantiation overhead
- **Mute Check**: Simple boolean comparison, negligible cost

## Code Style Notes

- **No XML summaries**: Keep code clean and readable
- **Minimal comments**: Only comment non-obvious logic
- **Self-documenting**: Use clear variable and method names
- **Concise**: Avoid verbose implementations
- **Unity conventions**: Follow Unity C# naming standards
