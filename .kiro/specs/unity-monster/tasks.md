# Unity Monster - Implementation Plan

## Tasks Overview

- [x] 1. Create MonsterController Script Structure
  - Create `MonsterController.cs` in `Assets/Scripts/`
  - Add serialized configuration variables (lives, startingDistance, goalDistance, sprintSpeed)
  - Add private runtime state variables (currentLives, isSprinting, teleportDistance)
  - Add component references (mainCamera, animator)
  - Implement Awake() to cache references
  - Add validation for required components
  - _Properties: P2_
  - _Requirements: AC2, AC6_

- [x] 2. Implement Monster Spawn Logic
  - Implement Start() method
  - Calculate spawn position at startingDistance from camera
  - Use camera forward direction for positioning
  - Set monster Y position to 0
  - Rotate monster to face camera
  - Initialize currentLives = lives
  - Calculate teleportDistance = (startingDistance - goalDistance) / (lives - 1)
  - _Properties: P1, P5_
  - _Requirements: AC1, AC2_

- [x] 3. Implement Blink Event Handler
  - Create public method `OnBlinkDetected()`
  - Check if already sprinting (early return if true)
  - Decrement currentLives
  - Add logic branching for lives > 1, lives == 1, and lives == 0
  - Add debug logging for blink events
  - _Properties: P4, P10_
  - _Requirements: AC3, AC4_

- [x] 4. Implement Teleportation Logic
  - In OnBlinkDetected(), when currentLives > 1:
    - Calculate new position toward camera
    - Move by teleportDistance units
    - Maintain direction toward camera
    - Set Y position to 0
    - Update transform.position instantly (no lerp, no animation)
  - When currentLives == 1:
    - Teleport to exactly goalDistance from camera
    - Set Y position to 0
    - Do NOT trigger sprint yet
  - _Properties: P3, P5, P11_
  - _Requirements: AC3_

- [x] 5. Implement Sprint Trigger
  - In OnBlinkDetected(), when currentLives == 0 (final blink):
    - Monster should already be at goalDistance (from previous blink)
    - Set isSprinting = true
    - Trigger animator parameter "sprint" (if animator exists)
    - Add debug log for sprint trigger
    - This is when visible movement begins
  - _Properties: P6, P7_
  - _Requirements: AC4, AC5_


- [x] 6. Implement Sprint Movement and Editor Testing
  - Implement Update() or FixedUpdate()
  - Check if isSprinting is true
  - Calculate direction from monster to camera
  - Move monster toward camera at sprintSpeed
  - Maintain Y position at 0
  - Check if monster reached camera (distance < 0.5f)
  - Add Unity Editor only: Check for Spacebar input
  - If Spacebar pressed in Editor, call OnBlinkDetected()
  - Use #if UNITY_EDITOR preprocessor directive
  - _Properties: P8, P9, P5, P12_
  - _Requirements: AC5, AC7_


- [x] 7. Implement Game Over Detection
  - In sprint movement logic, detect when monster reaches camera
  - Trigger game over state
  - Stop further movement
  - Optionally send game over event to React (if WebGL build)
  - Add debug log for game over
  - _Properties: None (game state management)_
  - _Requirements: AC5_

- [x] 8. Add Configuration Validation
  - In Start(), validate configuration values
  - Clamp lives to minimum of 2 (need at least 1 teleport + 1 sprint)
  - Ensure goalDistance < startingDistance
  - Log warnings for invalid configurations
  - Auto-correct invalid values
  - _Properties: Edge cases E1, E2_
  - _Requirements: AC6_

- [x] 9. Testing and Polish
  - Test all blink scenarios (2 lives, 5 lives, 10 lives)
  - Verify teleport distances are accurate
  - Test sprint animation and movement
  - Verify Y position always stays at 0
  - Test edge cases (invalid configs)
  - Test Spacebar input in Unity Editor
  - Add code comments and documentation
  - _Properties: All_
  - _Requirements: All ACs_

---

## Implementation Notes
- Tasks 4 and 5 are implemented in the same method (OnBlinkDetected)
- Testing (Task 9) should be done incrementally after each task
- Use Spacebar in Unity Editor to test blink events
- Monster only moves visibly during sprint - all other movement is instant teleportation

## Estimated Effort
- Total Tasks: 9
- Estimated Time: 2-3 hours
- Complexity: Medium
- Risk Level: Low
