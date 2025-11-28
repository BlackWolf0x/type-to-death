# Unity FMOD System - Implementation Plan

## Tasks Overview

- [x] 1. Create AudioManager Script Structure
  - Create `AudioManager.cs` in `Assets/Scripts/`
  - Add using FMOD.Studio
  - Add using FMODUnity
  - Add singleton instance field and property
  - Add serialized EventReference field for gameOverRef
  - Add public EventInstance field for gameOverSfx
  - Add public property for GameOverSfx
  - _Properties: P1, P3_
  - _Requirements: AC1.1, AC2.1, AC2.2, AC2.3_

- [x] 2. Implement Singleton Pattern
  - Implement Awake() method
  - Check if instance is null, set to this
  - If instance exists and is not this, destroy gameObject
  - Call DontDestroyOnLoad on singleton instance
  - Call InstantiateSFXs() at end of Awake
  - _Properties: P1, P2_
  - _Requirements: AC1.1, AC1.2, AC1.3_

- [x] 3. Implement InstantiateSFXs Method
  - Create InstantiateSFXs() method
  - Call RuntimeManager.CreateInstance(gameOverRef)
  - Assign result to gameOverSfx
  - _Properties: P4_
  - _Requirements: AC3.1, AC3.2, AC3.3, AC3.4_

- [x] 4. Implement PlaySfx Method
  - Create public PlaySfx(EventInstance sfx) method
  - Call sfx.start()
  - _Properties: P5_
  - _Requirements: AC4.1, AC4.2, AC4.3_

- [x] 5. Integrate with GameManager
  - Open GameManager.cs
  - In GameOverSequence(), after blackScreenPanel.SetActive(true)
  - Replace SFXManager.Instance.Play(SFXManager.Instance.GameOver)
  - With: AudioManager.Instance.PlaySfx(AudioManager.Instance.GameOverSfx)
  - _Properties: P6_
  - _Requirements: AC5.1, AC5.2, AC5.3_

## Manual Unity Setup Tasks

### Setup Task A: Install FMOD Unity Integration
1. Download FMOD Studio Unity Integration from FMOD website
2. Import package into Unity project
3. Configure FMOD settings in Unity
4. Verify FMOD Studio link is working

### Setup Task B: Create FMOD Events
1. Open FMOD Studio
2. Create GameOver event
3. Add audio to event
4. Build banks
5. Verify banks are in Unity project

### Setup Task C: Create AudioManager GameObject
1. Create empty GameObject in scene
2. Name it "AudioManager"
3. Attach AudioManager script
4. Assign GameOver EventReference in Inspector

### Setup Task D: Test FMOD Audio
1. Press Play in Unity Editor
2. Trigger game over
3. Verify FMOD GameOver sound plays
4. Check Console for FMOD errors

## Implementation Notes

- **FMOD Integration**: Requires FMOD Studio Unity Integration package
- **EventReference**: Assigned in Inspector, links to FMOD Studio events
- **EventInstance**: Created at runtime, reusable
- **RuntimeManager**: FMOD's manager for creating instances
- **Minimal Comments**: Keep code clean

## Estimated Effort

- Total Tasks: 5 coding tasks + 4 manual setup tasks
- Estimated Coding Time: 30 minutes
- Estimated Setup Time: 30 minutes (FMOD setup)
- Complexity: Low-Medium
- Risk Level: Low

## Dependencies

- FMOD Studio Unity Integration package
- FMOD Studio project with audio events
- GameManager script (existing)
- Unity 6.1

## Integration Notes

### FMOD Studio Setup

1. Create FMOD Studio project
2. Create events for game audio
3. Build banks
4. Link to Unity project

### EventReference Assignment

In Unity Inspector:
1. Select AudioManager GameObject
2. Find "Game Over Ref" field
3. Click dropdown to select FMOD event
4. Event must exist in FMOD Studio banks

### Adding New SFX

```csharp
// In AudioManager
[SerializeField] private EventReference newSfxRef;
public EventInstance newSfx;

void InstantiateSFXs()
{
    gameOverSfx = RuntimeManager.CreateInstance(gameOverRef);
    newSfx = RuntimeManager.CreateInstance(newSfxRef);
}

// Usage
AudioManager.Instance.PlaySfx(AudioManager.Instance.newSfx);
```

## Performance Notes

- **EventInstance Creation**: One-time cost in Awake
- **PlaySfx**: Minimal overhead, direct FMOD call
- **No Allocations**: EventInstances reused
- **FMOD Efficiency**: More efficient than Unity AudioSource

## Code Style Notes

- **No XML summaries**: Keep code clean
- **Minimal comments**: Only comment non-obvious logic
- **Self-documenting**: Clear variable and method names
- **Concise**: Avoid verbose implementations
