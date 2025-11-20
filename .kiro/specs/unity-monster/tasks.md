# Implementation Plan

- [x] 1. Create MonsterController script
  - [x] 1.1 Create MonsterController.cs file in Assets/Scripts
    - Create file at `unity/kiroween/Assets/Scripts/MonsterController.cs`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

  - [x] 1.2 Add serialized fields for configuration
    - Add startingDistance field with default value 10f
    - Add walkSpeed field with default value 1f
    - Add goalDistance field with default value 2f
    - Add animationSpeed field with default value 1f
    - Use [SerializeField] attribute for all fields
    - Organize with [Header] attributes for Movement and Animation settings
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.5_

  - [x] 1.3 Add private fields for component references and state
    - Add mainCamera field for Camera reference
    - Add animator field for Animator reference
    - Add isBeingWatched bool field
    - Add hasReachedGoal bool field
    - _Requirements: 6.2_

  - [x] 1.4 Implement Awake method for component caching
    - Cache Camera.main reference
    - Use TryGetComponent to get Animator reference
    - Log error if Animator not found
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 1.5 Implement Start method for initialization
    - Calculate starting position using camera position and forward direction
    - Set monster position at starting distance from camera
    - Set initial animator speed to animationSpeed value
    - _Requirements: 4.6_

- [x] 2. Implement raycast detection system
  - [x] 2.1 Create CheckIfBeingWatched method
    - Create private method CheckIfBeingWatched()
    - Create ray from camera through Input.mousePosition
    - Perform Physics.Raycast with ray
    - Check if hit transform matches monster's transform
    - Set isBeingWatched flag based on raycast result
    - Handle case when raycast hits nothing (set false)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Implement movement system
  - [x] 3.1 Create MoveTowardCamera method
    - Create private method MoveTowardCamera()
    - Calculate normalized direction vector from monster to camera
    - Move position using direction * walkSpeed * Time.deltaTime
    - Use transform.LookAt to face camera
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 Add movement logic to Update
    - Check if not being watched
    - Call MoveTowardCamera when not watched
    - Skip movement if hasReachedGoal is true
    - _Requirements: 1.3, 2.5_

- [x] 4. Implement animation control
  - [x] 4.1 Create PlayWalkAnimation method
    - Create private method PlayWalkAnimation()
    - Set animator.speed to animationSpeed value
    - Add null check for animator
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 4.2 Create StopWalkAnimation method
    - Create private method StopWalkAnimation()
    - Set animator.speed to 0
    - Add null check for animator
    - _Requirements: 3.2, 3.3, 3.5_

  - [x] 4.3 Add animation control to Update
    - Call PlayWalkAnimation when not being watched
    - Call StopWalkAnimation when being watched
    - _Requirements: 3.1, 3.2_

- [x] 5. Implement distance checking and game over
  - [x] 5.1 Create CheckGoalDistance method
    - Create private method CheckGoalDistance()
    - Calculate distance using Vector3.Distance
    - Compare distance with goalDistance
    - Set hasReachedGoal flag if distance <= goalDistance
    - Call TriggerGameOver when goal reached
    - _Requirements: 5.1, 5.2_

  - [x] 5.2 Create TriggerGameOver method
    - Create private method TriggerGameOver()
    - Call StopWalkAnimation to stop animation
    - Log "Game Over! Monster reached the player!" message
    - Add TODO comment for future attack animation
    - _Requirements: 5.3, 5.4, 5.5_

  - [x] 5.3 Add distance check to Update
    - Call CheckGoalDistance every frame
    - Ensure it runs even when being watched
    - _Requirements: 5.1_

- [x] 6. Add public helper methods
  - [x] 6.1 Create HasReachedGoal method
    - Create public method HasReachedGoal() returning bool
    - Return hasReachedGoal field value
    - _Requirements: 5.6_

  - [x] 6.2 Create GetDistanceFromCamera method
    - Create public method GetDistanceFromCamera() returning float
    - Calculate and return Vector3.Distance to camera
    - Return 0 if camera is null
    - _Requirements: 5.6_

- [ ] 7. Unity Editor setup (Manual steps)
  - [ ] 7.1 Attach MonsterController to monster GameObject
    - Open Unity Editor
    - Select monster GameObject in hierarchy
    - Add MonsterController component
    - _Requirements: All_

  - [ ] 7.2 Add Collider component
    - Add BoxCollider, CapsuleCollider, or MeshCollider to monster
    - Adjust collider size to cover monster model
    - Ensure isTrigger is false
    - _Requirements: 1.4_

  - [ ] 7.3 Verify Animator setup
    - Confirm Animator component exists on monster
    - Verify Animator Controller is assigned
    - Verify "walk" animation state exists in controller
    - Set walk animation to loop
    - _Requirements: 3.3_

  - [ ] 7.4 Configure parameters in Inspector
    - Set Starting Distance (recommended: 10)
    - Set Walk Speed (recommended: 1)
    - Set Goal Distance (recommended: 2)
    - Set Animation Speed (recommended: 1)
    - _Requirements: 4.5_

  - [ ] 7.5 Verify camera setup
    - Confirm Main Camera is tagged as "MainCamera"
    - Test that Camera.main returns valid reference
    - _Requirements: 6.3_

- [ ] 8. Testing and validation
  - [ ] 8.1 Test spawn position
    - Enter play mode
    - Verify monster spawns at correct starting distance
    - Verify monster faces camera
    - _Requirements: 4.6_

  - [ ] 8.2 Test movement behavior
    - Move cursor away from monster
    - Verify monster moves toward camera
    - Verify movement is smooth
    - Verify monster faces camera while moving
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 8.3 Test detection and freezing
    - Move cursor over monster
    - Verify monster stops immediately
    - Move cursor away
    - Verify monster resumes movement
    - Test responsiveness of detection
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [ ] 8.4 Test animation control
    - Verify walk animation plays during movement
    - Verify animation pauses when frozen
    - Verify animation resumes from correct frame
    - Test animation speed parameter
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [ ] 8.5 Test game over trigger
    - Let monster reach goal distance
    - Verify "Game Over" message in console
    - Verify monster stops moving
    - Verify animation stops
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 8.6 Test parameter configuration
    - Change starting distance in Inspector
    - Change walk speed in Inspector
    - Change goal distance in Inspector
    - Change animation speed in Inspector
    - Verify all changes affect behavior correctly
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 8.7 Test edge cases
    - Test with camera behind monster
    - Test with very small goal distance
    - Test with very high walk speed
    - Verify no errors in console
    - _Requirements: All_
