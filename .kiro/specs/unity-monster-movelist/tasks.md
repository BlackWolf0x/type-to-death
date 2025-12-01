# Unity Monster Movelist - Implementation Plan

## Tasks Overview

- [x] 1. Add Pose Configuration Fields
  - Add serialized fields for startingPose, finalPose, and randomPoses array
  - Add [Header("Pose Configuration")] attribute
  - Add tooltips for each field
  - _Properties: P7_
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Implement Pose Validation
  - Create ValidatePoses() method
  - Check if startingPose is assigned
  - Check if finalPose is assigned
  - Check if randomPoses array has at least 1 element
  - Check for null elements in randomPoses array
  - Log appropriate errors/warnings
  - Call from Start() method
  - _Properties: P7_
  - _Requirements: 1.5_

- [x] 3. Implement Pose Application Method
  - Create ApplyPose(AnimationClip poseClip) method
  - Check if animator and poseClip are not null
  - Use animator.Play() to apply pose at normalized time 0
  - Add debug logging for pose application
  - _Properties: P5_
  - _Requirements: 5.1, 5.2, 5.3, 6.1_

- [x] 4. Apply Starting Pose on Spawn
  - In Start() method, after spawn position setup
  - Call ApplyPose(startingPose)
  - Add debug log for starting pose application
  - _Properties: P1_
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5. Initialize Pose Pool System
  - Create InitializeValidPoses() method
  - Filter out null poses from randomPoses array into validPoses list
  - Create ResetUnusedPoses() method to refill unusedPoses pool
  - Call InitializeValidPoses() from Start() after pose validation
  - Add debug logging for pool initialization
  - _Properties: P9_
  - _Requirements: 3.4, 3.5_

- [x] 6. Implement Random Pose Selection with Pool Tracking
  - Create SelectRandomPose() method
  - Check if unusedPoses pool is empty, reset if needed
  - Use Random.Range(0, unusedPoses.Count) for selection
  - Remove selected pose from unusedPoses pool
  - Return selected AnimationClip
  - Add debug logging with remaining pool size
  - _Properties: P2, P8, P9, P10_
  - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6_

- [x] 7. Apply Random Pose on Intermediate Teleports
  - In OnBlinkDetected(), when currentLives > 1
  - After TeleportTowardCamera() call
  - Call SelectRandomPose() and ApplyPose()
  - Add debug logging
  - _Properties: P3_
  - _Requirements: 3.2, 3.7_

- [x] 8. Apply Final Pose at Goal Distance
  - In OnBlinkDetected(), when currentLives == 1
  - After TeleportToGoalDistance() call
  - Call ApplyPose(finalPose)
  - Add debug logging
  - _Properties: P4_
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 9. Verify Sprint Animation Override
  - Ensure sprint animation still triggers correctly
  - Verify sprint overrides any active pose
  - Test transition from final pose to sprint
  - _Properties: P6_
  - _Requirements: 5.4, 6.2, 6.3_


## Implementation Notes

- Tasks 3-7 modify the existing MonsterController script
- Pose validation should happen early in Start() before pose application
- Random pose selection uses Unity's Random.Range for uniform distribution
- ApplyPose() method is reusable for all pose types
- Sprint animation trigger remains unchanged from base implementation
- All pose-related code should gracefully handle missing Animator component

## Unity Setup Tasks (Manual)

These tasks must be performed manually in Unity Editor:

### Setup Task A: Import Mixamo Poses
1. Download desired poses from Mixamo as FBX files
2. Import FBX files into Unity project
3. Recommended folder: `Assets/Animation/MonsterPoses/`
4. Verify animation clips are extracted from FBX files

### Setup Task B: Create Animator Controller
1. Create new Animator Controller: `MonsterPoseController`
2. Add "Pose" state with placeholder animation
3. Set Pose state speed to 0 (to hold at frame 0)
4. Add "Sprint" state with sprint animation
5. Add "sprint" trigger parameter
6. Add transition: Pose → Sprint (triggered by "sprint")
7. Set transition duration to 0 for instant transition

### Setup Task C: Configure Monster GameObject
1. Select monster GameObject in scene
2. Ensure Animator component is attached
3. Assign MonsterPoseController to Animator component
4. In MonsterController component Inspector:
   - Assign Starting Pose animation clip
   - Assign Final Pose animation clip
   - Set Random Poses array size
   - Assign random pose animation clips

### Setup Task D: Test Configuration
1. Press Play in Unity Editor
2. Verify starting pose displays
3. Press Spacebar to trigger blinks
4. Verify poses change on each teleport
5. Verify final pose before sprint
6. Verify sprint animation plays

## Alternative Implementation (Optional)

If direct animator.Play() doesn't work well, consider using AnimatorOverrideController:

### Optional Task: Implement AnimatorOverrideController
- Create AnimatorOverrideController in Awake()
- Modify ApplyPose() to use override controller
- Override "Pose" clip with selected pose
- This provides more flexibility for dynamic pose management

## Estimated Effort

- Total Tasks: 10 coding tasks + 4 manual setup tasks
- Estimated Coding Time: 1-2 hours
- Estimated Setup Time: 30-60 minutes
- Complexity: Low-Medium
- Risk Level: Low

## Dependencies

- Existing MonsterController implementation (unity-monster spec)
- Mixamo FBX files with pose animations
- Unity Animator component
- Unity Animation system knowledge
