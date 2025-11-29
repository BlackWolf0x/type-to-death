# Unity FMOD Ambiance - Implementation Plan

## Tasks Overview

- [x] 1. Add Ambiance Fields to AudioManager
  - Add [Header("Ambiance")] section
  - Add [SerializeField] private EventReference ambianceRef
  - Add private EventInstance ambianceInstance
  - _Properties: P1_
  - _Requirements: AC1.1_

- [x] 2. Initialize Ambiance Instance
  - In InitializeWhenBanksLoaded(), after other instances
  - Create ambianceInstance from ambianceRef if not null
  - Call PlayAmbiance() after initialization
  - _Properties: P1_
  - _Requirements: AC1.2, AC2.1_

- [x] 3. Implement PlayAmbiance Method
  - Create public PlayAmbiance() method
  - Check isInitialized, return if false
  - Check ambianceInstance.isValid(), return if false
  - Call ambianceInstance.start()
  - _Properties: P1_
  - _Requirements: AC2.3_

- [x] 4. Implement StopAmbiance Method
  - Create public StopAmbiance() method
  - Check ambianceInstance.isValid()
  - Call ambianceInstance.stop(STOP_MODE.ALLOWFADEOUT)
  - _Properties: P2_
  - _Requirements: AC2.4_

- [x] 5. Add Cleanup in OnDisable
  - Stop and release ambianceInstance if valid
  - _Properties: P2_
  - _Requirements: AC3.3_

- [x] 6. Integrate with GameManager
  - In GameOverSequence(), add AudioManager.Instance.StopAmbiance()
  - In GameWon(), add AudioManager.Instance.StopAmbiance()
  - _Properties: P2_
  - _Requirements: AC3.1, AC3.2_

## Manual Setup Tasks

### Setup Task A: Create FMOD Ambiance Event
1. Create looping ambiance event in FMOD Studio
2. Build banks

### Setup Task B: Assign in Unity
1. Select AudioManager GameObject
2. Assign ambiance EventReference

## Estimated Effort

- Total Tasks: 6
- Estimated Time: 20 minutes
- Complexity: Low
