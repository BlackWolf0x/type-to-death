# Unity FMOD Humming - Implementation Plan

## Tasks Overview

- [x] 1. Add Humming Fields to AudioManager


  - Add serialized EventReference field for humming
  - Add private EventInstance field for humming
  - Add fields under "Humming" header
  - _Properties: P3_
  - _Requirements: AC1.1, AC1.2, AC1.3_

- [x] 2. Implement Humming Instance Creation


  - Add humming instance creation in InstantiateSFXs()
  - Check if hummingRef is not null before creating
  - Store created instance in hummingInstance field
  - _Properties: P3_
  - _Requirements: AC1.4_

- [x] 3. Implement PlayHumming Method
  - Create public PlayHumming() method
  - Check isInitialized flag
  - Check if hummingInstance is valid
  - Call hummingInstance.start()
  - _Properties: P1_
  - _Requirements: AC2.1, AC2.2, AC2.3_

- [x] 4. Implement StopHumming Method
  - Create public StopHumming() method
  - Check if hummingInstance is valid
  - Call hummingInstance.stop() with ALLOWFADEOUT mode
  - _Properties: P2_
  - _Requirements: AC3.1, AC3.2_

- [x] 5. Add Humming Cleanup in OnDisable
  - Add humming instance cleanup in OnDisable()
  - Check if hummingInstance is valid
  - Stop with IMMEDIATE mode
  - Release the instance
  - _Properties: P3_
  - _Requirements: AC1.4_

- [x] 6. Add Lose Completion Monitoring to AudioManager
  - Add isHummingPlaying boolean flag
  - Modify OnLoseCompletionChanged() to play humming at 75%
  - Add check to prevent duplicate playback
  - Update StopHumming() to reset isHummingPlaying flag
  - _Properties: P1, P2_
  - _Requirements: AC2.4, AC2.5, AC5.1, AC5.2, AC5.3, AC5.4_

- [x] 7. Add Pitch Increase Field to AudioManager
  - Add serialized float field hummingPitchIncrease
  - Set default value to 2.0
  - Place under "Humming" header
  - _Properties: P3_
  - _Requirements: AC3.1, AC3.2, AC3.3_

- [x] 8. Implement IncreaseHummingPitch Method with Whispers
  - Create public IncreaseHummingPitch() method
  - Check if hummingInstance is valid and set pitch
  - Check if whispersInstance is valid and start it
  - Add whispersRef EventReference field and whispersInstance
  - Create whispers instance in InstantiateSFXs()
  - Stop whispers in StopHumming() and OnDisable()
  - _Properties: P3_
  - _Requirements: AC3.4, AC3.5, AC3.6, AC3.7_

- [x] 9. Integrate Pitch Increase in MonsterController
  - Call AudioManager.Instance.IncreaseHummingPitch() in currentLives == 1 branch
  - Place call after ApplyPose(finalPose)
  - _Properties: P3_
  - _Requirements: AC3.6_

- [x] 10. Add Humming Stop to StopHeartbeat
  - Modify StopHeartbeat() to call StopHumming()
  - Ensure humming stops on game over
  - _Properties: P4_
  - _Requirements: AC4.2, AC4.3_

## Implementation Notes

- Follow existing AudioManager patterns (similar to heartbeat and ambiance)
- Humming plays automatically at 75% lose completion (no manual trigger needed)
- Pitch increase is sudden (not gradual) when currentLives == 1
- Use STOP_MODE.ALLOWFADEOUT for smooth stop transition
- Use STOP_MODE.IMMEDIATE for cleanup in OnDisable
- Ensure humming EventReference is assigned in Unity Inspector after implementation
- Test with actual FMOD humming event to verify looping behavior
- Adjust hummingPitchIncrease value in Inspector to control pitch intensity

## Unity Setup Tasks (Manual)

### Setup Task A: Assign Humming Event Reference
1. Open Unity Editor
2. Select GameObject with AudioManager component
3. In Inspector, find "Humming" section
4. Assign the humming FMOD event to "Humming Ref" field
5. Adjust "Humming Pitch Increase" value (default: 2.0) to desired pitch
6. Verify event is set to loop in FMOD Studio

## Estimated Effort

- Total Tasks: 10 coding tasks + 1 manual setup
- Estimated Time: 45-60 minutes
- Complexity: Low-Medium
- Risk Level: Low

## Completion Status

✅ All tasks completed successfully!

**Implementation Summary:**
- Humming plays automatically at 75% lose completion
- Pitch increases suddenly when player reaches 1 life
- Pitch value is controllable from Inspector (default: 2.0)
- Humming stops automatically on game over
- No manual playback calls needed from MonsterController (except pitch increase)

## Dependencies

- AudioManager script (existing)
- MonsterController script (existing)
- Humming FMOD event (must be created in FMOD Studio)
- FMOD Unity Integration package (already installed)
