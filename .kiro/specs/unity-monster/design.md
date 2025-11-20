# Design Document

## Overview

The MonsterController script implements the Weeping Angel mechanic by combining raycast detection, movement logic, and animation control. The design prioritizes simplicity and performance for the hackathon MVP while maintaining clean, maintainable code that follows Unity 6.1 best practices.

## Architecture

The monster behavior follows a simple state machine pattern:

```
┌─────────────────────────────────────┐
│         MonsterController           │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   Raycast Detection           │  │
│  │   (Check if being watched)    │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │   Movement Logic              │  │
│  │   (Move if not watched)       │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │   Animation Control           │  │
│  │   (Play/pause walk)           │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │   Distance Check              │  │
│  │   (Trigger game over)         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Component Structure

### MonsterController.cs

**Location**: `unity/kiroween/Assets/Scripts/MonsterController.cs`

**Purpose**: Main script that controls all monster behavior

**Dependencies**:
- UnityEngine
- Camera (Main Camera)
- Animator component on the same GameObject
- Collider component on the same GameObject

**Serialized Fields** (Inspector-visible):
```csharp
[Header("Movement Settings")]
[SerializeField] private float startingDistance = 10f;
[SerializeField] private float walkSpeed = 1f;
[SerializeField] private float goalDistance = 2f;

[Header("Animation Settings")]
[SerializeField] private float animationSpeed = 1f;
```

**Private Fields**:
```csharp
private Camera mainCamera;        // Cached reference to main camera
private Animator animator;        // Cached reference to animator
private bool isBeingWatched;      // Current watch state
private bool hasReachedGoal;      // Game over flag
```

**Public Methods**:
```csharp
public bool HasReachedGoal()              // Returns if game over
public float GetDistanceFromCamera()      // Returns current distance
```

**Private Methods**:
```csharp
private void CheckIfBeingWatched()        // Raycast detection
private void MoveTowardCamera()           // Movement logic
private void PlayWalkAnimation()          // Start/resume animation
private void StopWalkAnimation()          // Pause animation
private void CheckGoalDistance()          // Distance check
private void TriggerGameOver()            // Game over handler
```

## Data Flow

### Update Loop Flow

```
Update() called every frame
    │
    ├─► CheckIfBeingWatched()
    │   └─► Raycast from camera through cursor
    │       └─► Set isBeingWatched flag
    │
    ├─► if (!isBeingWatched)
    │   ├─► MoveTowardCamera()
    │   │   ├─► Calculate direction
    │   │   ├─► Move position
    │   │   └─► Face camera
    │   └─► PlayWalkAnimation()
    │       └─► Set animator.speed = animationSpeed
    │
    ├─► else (isBeingWatched)
    │   └─► StopWalkAnimation()
    │       └─► Set animator.speed = 0
    │
    └─► CheckGoalDistance()
        └─► if (distance <= goalDistance)
            └─► TriggerGameOver()
```

## Implementation Details

### Raycast Detection System

**Method**: `CheckIfBeingWatched()`

**Logic**:
1. Create ray from camera through mouse/cursor position
2. Perform Physics.Raycast
3. Check if hit transform matches monster's transform
4. Update `isBeingWatched` flag

**Code**:
```csharp
private void CheckIfBeingWatched()
{
    Ray ray = mainCamera.ScreenPointToRay(Input.mousePosition);
    
    if (Physics.Raycast(ray, out RaycastHit hit))
    {
        isBeingWatched = hit.transform == transform;
    }
    else
    {
        isBeingWatched = false;
    }
}
```

**Note**: This uses `Input.mousePosition` which will be automatically updated by webgazer.js cursor position in the final integration.

### Movement System

**Method**: `MoveTowardCamera()`

**Logic**:
1. Calculate normalized direction vector toward camera
2. Move position using direction * speed * deltaTime
3. Rotate to face camera using LookAt

**Code**:
```csharp
private void MoveTowardCamera()
{
    Vector3 directionToCamera = (mainCamera.transform.position - transform.position).normalized;
    transform.position += directionToCamera * walkSpeed * Time.deltaTime;
    transform.LookAt(mainCamera.transform.position);
}
```

**Performance**: Uses normalized direction and deltaTime for smooth, frame-rate independent movement.

### Animation Control

**Method**: `PlayWalkAnimation()` and `StopWalkAnimation()`

**Approach**: Control animation through `Animator.speed`
- `speed = 0` → Animation pauses at current frame
- `speed = animationSpeed` → Animation plays at configured speed

**Why this approach**:
- Simple and reliable
- No need for animator parameters
- Animation resumes from exact frame it paused
- Works with any animation state setup

**Code**:
```csharp
private void PlayWalkAnimation()
{
    if (animator != null)
    {
        animator.speed = animationSpeed;
    }
}

private void StopWalkAnimation()
{
    if (animator != null)
    {
        animator.speed = 0f;
    }
}
```

**Alternative Approach** (not used):
Could use Animator parameters with bool "isWalking", but this requires:
- Setting up parameter in Animator Controller
- Creating transitions
- More complex setup for MVP

### Distance Checking

**Method**: `CheckGoalDistance()`

**Logic**:
1. Calculate distance using Vector3.Distance
2. Compare with goalDistance threshold
3. Trigger game over if threshold reached

**Code**:
```csharp
private void CheckGoalDistance()
{
    float currentDistance = Vector3.Distance(transform.position, mainCamera.transform.position);
    
    if (currentDistance <= goalDistance)
    {
        hasReachedGoal = true;
        TriggerGameOver();
    }
}
```

**Note**: Uses Vector3.Distance (not sqrMagnitude) for clarity since this check happens once per frame and readability is more important than micro-optimization for MVP.

### Initialization

**Method**: `Start()`

**Logic**:
1. Position monster at starting distance from camera
2. Calculate position along camera's forward direction
3. Set initial animation speed

**Code**:
```csharp
void Start()
{
    if (mainCamera != null)
    {
        Vector3 startPosition = mainCamera.transform.position + mainCamera.transform.forward * startingDistance;
        transform.position = startPosition;
    }
    
    if (animator != null)
    {
        animator.speed = animationSpeed;
    }
}
```

## Unity Setup Requirements

### GameObject Hierarchy

```
Monster (GameObject)
├── MonsterController (Script)
├── Animator (Component)
├── Collider (BoxCollider/CapsuleCollider/MeshCollider)
└── Model (Child GameObject with mesh)
```

### Animator Setup

**Requirements**:
- Animator Controller assigned
- "walk" animation state exists
- Animation is set to loop
- No special parameters needed (using speed control)

**Setup Steps**:
1. Create Animator Controller asset
2. Add "walk" animation clip to controller
3. Set as default state
4. Assign controller to Animator component

### Collider Setup

**Requirements**:
- Collider covers the monster model
- Collider is on the same GameObject as MonsterController
- Collider is not a trigger (isTrigger = false)

**Recommended**:
- Use CapsuleCollider for humanoid monsters
- Use BoxCollider for simple shapes
- Adjust size to match visual bounds

### Camera Setup

**Requirements**:
- Main camera tagged as "MainCamera"
- Camera.main must return valid reference

## Configuration Guidelines

### Recommended Starting Values

| Parameter | Value | Reasoning |
|-----------|-------|-----------|
| startingDistance | 10.0f | Far enough to see monster clearly |
| walkSpeed | 1.0f | Slow enough to be manageable |
| goalDistance | 2.0f | Close enough to feel threatening |
| animationSpeed | 1.0f | Normal animation playback |

### Balancing Tips

**For Easier Difficulty**:
- Increase startingDistance (more time to react)
- Decrease walkSpeed (slower approach)
- Increase goalDistance (more margin for error)

**For Harder Difficulty**:
- Decrease startingDistance (less time to react)
- Increase walkSpeed (faster approach)
- Decrease goalDistance (less margin for error)

**Animation Speed**:
- Match to walkSpeed for realistic movement
- Higher values = more frantic feeling
- Lower values = more creepy/slow feeling

## Performance Considerations

### Optimization Strategies

1. **Component Caching**: All components cached in Awake
2. **Single Raycast**: Only one raycast per frame
3. **Simple Math**: Basic vector operations only
4. **No Allocations**: No new objects created in Update
5. **Early Exit**: hasReachedGoal flag prevents unnecessary updates

### WebGL Considerations

- Raycast performance is good in WebGL
- Vector math is optimized by Unity
- No physics simulation needed (kinematic movement)
- Animation playback is efficient

### Expected Performance

- Negligible CPU impact (< 0.1ms per frame)
- Single raycast is very cheap
- No garbage collection in Update loop
- Suitable for 60 FPS target with eye tracking

## Error Handling

### Missing Components

**Animator Missing**:
- Logged error in Awake
- Movement still works
- Animation calls are null-checked

**Camera Missing**:
- Movement and raycast disabled
- Monster stays at origin
- No crashes

### Edge Cases

**Monster Already at Goal**:
- hasReachedGoal flag prevents further updates
- Game over only triggered once

**Camera Behind Monster**:
- Monster will turn around and approach
- LookAt handles all orientations

## Testing Strategy

### Manual Testing Checklist

1. **Spawn Position**:
   - [ ] Monster spawns at correct starting distance
   - [ ] Monster faces camera initially

2. **Movement**:
   - [ ] Monster moves toward camera when not watched
   - [ ] Movement is smooth and consistent
   - [ ] Monster faces camera while moving

3. **Detection**:
   - [ ] Monster stops when cursor is over it
   - [ ] Monster resumes when cursor moves away
   - [ ] Detection is responsive (no lag)

4. **Animation**:
   - [ ] Walk animation plays during movement
   - [ ] Animation pauses when frozen
   - [ ] Animation resumes from correct frame

5. **Game Over**:
   - [ ] Game over triggers at goal distance
   - [ ] Monster stops moving after game over
   - [ ] "Game Over" message appears in console

6. **Configuration**:
   - [ ] All parameters visible in Inspector
   - [ ] Changing values affects behavior
   - [ ] Values persist after play mode

### Integration Testing

- Test with webgazer.js cursor control (future)
- Test with React UI overlay
- Test performance with eye tracking active

## Future Enhancements

**Not in this spec** (separate specs later):
- Attack animation and sequence
- Sound effects (footsteps, breathing)
- Visual feedback when frozen (shader effect)
- Multiple movement patterns
- Difficulty scaling over time
- Particle effects
- Idle animations when frozen

## Communication with React

### Events to Send (Future)

- Monster distance updates (for UI display)
- Game over event
- Monster state changes (moving/frozen)

### Events to Receive (Future)

- Game start/reset
- Difficulty settings
- Pause/resume

**Note**: Communication layer will be implemented in a separate spec.
