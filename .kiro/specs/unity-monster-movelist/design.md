# Unity Monster Movelist - Design

## Architecture Overview

The movelist system extends the existing MonsterController to add dynamic pose variation during teleportation. It manages three categories of poses: starting pose, random poses, and final pose. The system uses Unity's Animator component to apply static poses at specific game moments.

## Component Structure

### MonsterController (Extended)

**New Responsibilities:**
- Manage pose animation clip references
- Select random poses during teleportation
- Apply poses to the Animator at appropriate times
- Validate pose assignments

**New Dependencies:**
- AnimationClip references for poses
- Random number generation for pose selection

## Data Model

### New Configuration Variables

```csharp
[Header("Pose Configuration")]
[SerializeField] private AnimationClip startingPose;
[SerializeField] private AnimationClip finalPose;
[SerializeField] private AnimationClip[] randomPoses;
```

### New Runtime State

```csharp
// No additional runtime state needed
// Pose selection happens inline during teleportation
```

## Core Algorithms

### 1. Pose Validation

```
On Start (after existing validation):
1. Check if startingPose is assigned
   - If null: Log error, disable script
2. Check if finalPose is assigned
   - If null: Log error, disable script
3. Check if randomPoses array has at least 1 element
   - If empty: Log error, disable script
4. Check if all randomPoses elements are assigned
   - If any null: Log warning, continue with valid poses
```

### 2. Starting Pose Application

```
On Spawn (in Start method, after position setup):
1. Call ApplyPose(startingPose)
2. Log pose application
```

### 3. Random Pose Selection and Application

```
On Teleport (when currentLives > 1):
1. Generate random index: Random.Range(0, randomPoses.Length)
2. Select pose: selectedPose = randomPoses[randomIndex]
3. Call ApplyPose(selectedPose)
4. Log pose selection and index
```

### 4. Final Pose Application

```
On Teleport to Goal Distance (when currentLives == 1):
1. Call ApplyPose(finalPose)
2. Log pose application
```

### 5. Pose Application Method

```csharp
private void ApplyPose(AnimationClip poseClip)
{
    if (animator == null || poseClip == null)
    {
        return;
    }
    
    // Play the animation clip at time 0
    animator.Play(poseClip.name, 0, 0f);
    
    // Alternative approach if direct clip play doesn't work:
    // Use animator.CrossFade with 0 transition time
    // animator.CrossFade(poseClip.name, 0f, 0, 0f);
}
```

## Integration with Existing MonsterController

### Modified Methods

#### Start()
```
Existing logic...
+ Validate pose assignments
+ Apply starting pose after spawn position setup
```

#### OnBlinkDetected()
```
Existing logic for lives decrement...

if (currentLives > 1):
    TeleportTowardCamera(teleportDistance)
    + SelectAndApplyRandomPose()
    
else if (currentLives == 1):
    TeleportToGoalDistance()
    + ApplyPose(finalPose)
    
else if (currentLives == 0):
    Existing sprint trigger logic...
```

## Animation Setup Requirements

### Animator Controller Configuration

The Animator Controller must be set up to support direct animation clip playback:

**Option 1: Simple State Machine**
```
- Create a state for each pose animation clip
- States should have:
  - Speed: 0 (to hold at frame 0)
  - Write Defaults: Off (recommended)
- No transitions needed between pose states
- Use animator.Play() to jump directly to states
```

**Option 2: Any State Transitions**
```
- Create states for each pose
- Add "Any State" transitions to each pose state
- Transitions should have:
  - Has Exit Time: false
  - Transition Duration: 0
  - Can Transition To Self: true
```

**Option 3: Override Controller (Recommended)**
```
- Create a base animator controller with generic "Pose" state
- Use AnimatorOverrideController at runtime
- Override the "Pose" clip with selected pose
- Most flexible for dynamic pose management
```

## Correctness Properties

### P1: Starting Pose Display
**Property:** Monster displays starting pose when spawned  
**Verification:** Animator is playing startingPose clip at spawn  
**Covers:** Requirements 2.1, 2.2, 2.3, 2.4

### P2: Random Pose Selection
**Property:** For any teleport when currentLives > 1, a pose is randomly selected from randomPoses array  
**Verification:** Selected index is within [0, randomPoses.Length)  
**Covers:** Requirements 3.1, 3.2, 3.3

### P3: Random Pose Application
**Property:** Selected random pose is applied immediately after teleportation  
**Verification:** Animator is playing the selected pose clip after teleport  
**Covers:** Requirements 3.2, 3.5

### P4: Final Pose Display
**Property:** Monster displays final pose when currentLives equals 1  
**Verification:** Animator is playing finalPose clip at goal distance  
**Covers:** Requirements 4.1, 4.2, 4.3, 4.4

### P5: Pose Timing
**Property:** Poses are applied immediately after position updates  
**Verification:** Pose application occurs in same frame as teleport  
**Covers:** Requirements 5.1, 5.2, 5.3

### P6: Sprint Override
**Property:** Sprint animation overrides any active pose  
**Verification:** When sprint begins, animator transitions to sprint animation  
**Covers:** Requirements 5.4, 6.2

### P7: Pose Validation
**Property:** All required pose references are validated at start  
**Verification:** Script logs errors and disables if poses are missing  
**Covers:** Requirements 1.5

### P8: Uniform Distribution
**Property:** Random pose selection uses uniform distribution  
**Verification:** All poses have equal probability of selection  
**Covers:** Requirements 3.3

## Implementation Approaches

### Approach 1: Direct Animator.Play() (Simplest)

**Pros:**
- Simple implementation
- Direct control over animation state
- No complex animator setup needed

**Cons:**
- Requires animator states for each pose
- Manual animator controller setup

**Implementation:**
```csharp
animator.Play(poseClip.name, 0, 0f);
```

### Approach 2: AnimatorOverrideController (Recommended)

**Pros:**
- Dynamic pose management
- Single "Pose" state in animator
- Easy to add/remove poses without animator changes
- Most flexible

**Cons:**
- Slightly more complex setup
- Requires understanding of override controllers

**Implementation:**
```csharp
AnimatorOverrideController overrideController;

void Awake()
{
    // Create override controller
    overrideController = new AnimatorOverrideController(animator.runtimeAnimatorController);
    animator.runtimeAnimatorController = overrideController;
}

void ApplyPose(AnimationClip poseClip)
{
    overrideController["Pose"] = poseClip;
    animator.Play("Pose", 0, 0f);
}
```

### Approach 3: Animation Playables API (Advanced)

**Pros:**
- Most control over animation playback
- No animator controller needed
- Can blend and layer animations

**Cons:**
- Complex implementation
- Overkill for static poses
- More code to maintain

**Not recommended for this use case.**

## Implemented Approach: AnimatorOverrideController

This approach provides the best balance of flexibility and simplicity:

1. Create a simple animator controller with:
   - "Pose" state (any animation clip as placeholder)
   - "Sprint" state (sprint animation)
   - Transition from Pose to Sprint triggered by "sprint" trigger

2. At runtime, create AnimatorOverrideController in Awake()

3. When applying poses, override the "Pose" clip and play it:
   ```csharp
   overrideController["Pose"] = poseClip;
   animator.Play("Pose", 0, 0f);
   ```

4. Sprint animation works as before

**Benefits:**
- Only need one "Pose" state in animator
- Dynamically swap motion clips at runtime
- Easy to add/remove poses without animator changes
- Clean and maintainable

## Edge Cases

### E1: Missing Pose References
**Scenario:** startingPose, finalPose, or randomPoses not assigned  
**Handling:** Log error, disable script to prevent null reference exceptions

### E2: Empty Random Poses Array
**Scenario:** randomPoses array has length 0  
**Handling:** Log error, disable script

### E3: Null Elements in Random Poses
**Scenario:** Some elements in randomPoses array are null  
**Handling:** Log warning, filter out null elements, continue with valid poses

### E4: Missing Animator Component
**Scenario:** Animator component not found (already handled in base MonsterController)  
**Handling:** Poses won't be applied, but script continues (log warning)

### E5: Animation Clip Name Conflicts
**Scenario:** Multiple clips with same name  
**Handling:** Use AnimatorOverrideController to avoid name-based lookup

### E6: Pose Animation Not Holding
**Scenario:** Pose animation plays instead of holding at frame 0  
**Handling:** Set animation state speed to 0 or use normalized time 0

## Performance Considerations

- Random.Range() is fast and suitable for runtime use
- Animator.Play() is efficient for state changes
- AnimationClip references are lightweight
- No per-frame overhead (poses applied only on teleport)
- Array access is O(1) for random pose selection

## Testing Strategy

### Manual Testing in Unity Editor
1. Assign starting pose, final pose, and random poses in Inspector
2. Press Play and observe starting pose
3. Press Spacebar to trigger blinks
4. Verify random poses appear during intermediate teleports
5. Verify final pose appears at goal distance
6. Verify sprint animation plays after final blink
7. Test with different pose counts (1, 5, 10+ random poses)

### Edge Case Testing
1. Test with missing pose references
2. Test with empty random poses array
3. Test with single random pose
4. Test with many random poses
5. Test rapid blinking to verify pose changes

### Visual Verification
1. Poses should be clearly visible and distinct
2. No animation blending or transitions
3. Poses should hold without drift
4. Sprint animation should play smoothly after final pose

## Unity Setup Guide

### Step 1: Import Mixamo FBX Files
1. Download poses from Mixamo
2. Import FBX files into Unity project
3. Place in `Assets/Animation/MonsterPoses/` folder

### Step 2: Extract Animation Clips
1. Select FBX file in Project window
2. Go to Animation tab in Inspector
3. Ensure animation clips are generated
4. Clips will be nested under FBX file

### Step 3: Create Animator Controller
1. Create new Animator Controller: `MonsterPoseController`
2. Add "Pose" state with any placeholder animation
3. Add "Sprint" state with sprint animation
4. Add "sprint" trigger parameter
5. Add transition: Pose → Sprint (triggered by "sprint")

### Step 4: Configure MonsterController
1. Select monster GameObject
2. Assign MonsterPoseController to Animator component
3. In MonsterController component:
   - Assign Starting Pose clip
   - Assign Final Pose clip
   - Set Random Poses array size
   - Assign random pose clips

### Step 5: Test
1. Press Play
2. Use Spacebar to test pose changes

## Future Enhancements (Out of Scope)

- Pose preview in Inspector
- Pose categories (aggressive, defensive, idle)
- Weighted random selection
- Pose exclusion rules (don't repeat last N poses)
- Pose transition effects
- Multiple pose sets for different difficulty levels
