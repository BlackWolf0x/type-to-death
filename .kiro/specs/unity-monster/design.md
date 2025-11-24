# Unity Monster - Design

## Architecture Overview

The monster system consists of a single `MonsterController` script that manages:
1. Monster positioning and spawning
2. Lives tracking
3. Blink event handling
4. Teleportation logic
5. Sprint attack sequence

## Component Structure

### MonsterController (MonoBehaviour)

**Responsibilities:**
- Initialize monster position at game start
- Track player lives
- Handle blink events
- Calculate and execute teleportation
- Trigger and manage sprint animation
- Manage game over state

**Dependencies:**
- Camera reference (main camera)
- Animator component (for sprint animation)
- Transform component (for positioning)

## Data Model

### Configuration Variables

```csharp
[SerializeField] private int lives = 5;
[SerializeField] private float startingDistance = 10f;
[SerializeField] private float goalDistance = 2f;
[SerializeField] private float sprintSpeed = 5f;
```

### Runtime State

```csharp
private Camera mainCamera;
private Animator animator;
private int currentLives;
private bool isSprinting = false;
private float teleportDistance; // Calculated: (startingDistance - goalDistance) / lives
```

## Core Algorithms

### 1. Monster Spawn Position Calculation

```
Position Calculation:
- Get camera forward direction (normalized)
- Multiply by startingDistance
- Add to camera position
- Set Y to 0
- Result: spawnPosition = cameraPosition + (cameraForward * startingDistance)
- spawnPosition.y = 0
```

### 2. Teleport Distance Calculation

```
Teleport Distance Per Blink:
- teleportDistance = (startingDistance - goalDistance) / (lives - 1)
- Example with 5 lives: (10 - 2) / (5 - 1) = 2 units per blink
- After 4 blinks: monster at goalDistance (2 units from camera)
- 5th blink: triggers sprint from goalDistance
```

### 3. Blink Event Handling Logic

```
On Blink Event:
1. Check if already sprinting → return early
2. Decrement currentLives
3. If currentLives > 1:
   - Calculate new position toward camera
   - Teleport monster to new position (instant, no animation)
   - Keep Y at 0
4. If currentLives == 1:
   - Teleport monster to goalDistance (instant)
   - Keep Y at 0
   - Do NOT trigger sprint yet
5. If currentLives == 0:
   - Trigger sprint animation
   - Set isSprinting = true
   - Monster moves visibly from goalDistance to camera
```

### 4. Sprint Movement

```
During Sprint (in Update/FixedUpdate):
- If isSprinting:
  - Move toward camera at sprintSpeed
  - Direction: (cameraPosition - monsterPosition).normalized
  - New position: monsterPosition + direction * sprintSpeed * deltaTime
  - Keep Y at 0
  - Check if reached camera (distance < threshold)
  - If reached: trigger game over
```

## Correctness Properties

### P1: Spawn Position Correctness
**Property:** Monster spawns at exactly `startingDistance` from camera with Y = 0  
**Verification:** Distance between monster and camera equals startingDistance ± 0.01  
**Covers:** AC1

### P2: Lives Initialization
**Property:** Lives are initialized to configured value at game start  
**Verification:** currentLives == lives at Start()  
**Covers:** AC2

### P3: Teleport Distance Accuracy
**Property:** Each teleport moves monster by exactly `(startingDistance - goalDistance) / (lives - 1)`  
**Verification:** Distance change per blink equals calculated teleportDistance ± 0.01  
**Covers:** AC3

### P4: Lives Decrement
**Property:** Each blink decrements lives by exactly 1  
**Verification:** currentLives decreases by 1 per blink event  
**Covers:** AC3

### P5: Ground Level Constraint
**Property:** Monster Y position always remains at 0  
**Verification:** monster.position.y == 0 after spawn, teleport, and during sprint  
**Covers:** AC1, AC3, AC5

### P6: Goal Distance Positioning
**Property:** When lives reach 1, monster is at exactly goalDistance from camera  
**Verification:** Distance equals goalDistance ± 0.01 after (lives - 1) blinks  
**Covers:** AC3, AC4

### P7: Sprint Trigger
**Property:** Sprint animation triggers only when currentLives reaches 0 (final blink)  
**Verification:** Animator parameter "sprint" is set true only when currentLives == 0  
**Covers:** AC4, AC5

### P11: Teleportation Only Before Sprint
**Property:** Monster only teleports (instant movement) when currentLives > 0, and only moves visibly during sprint  
**Verification:** No visible movement between blinks until sprint triggers  
**Covers:** AC3, AC4

### P8: Sprint Movement Direction
**Property:** During sprint, monster moves directly toward camera  
**Verification:** Movement direction equals normalized vector from monster to camera  
**Covers:** AC5

### P9: Sprint Speed Consistency
**Property:** Monster moves at exactly sprintSpeed during sprint  
**Verification:** Distance traveled per second equals sprintSpeed ± 0.1  
**Covers:** AC5

### P10: No Blink Processing During Sprint
**Property:** Blink events are ignored once sprint has started  
**Verification:** isSprinting flag prevents further blink processing  
**Covers:** AC5

### P12: Editor Testing Mode
**Property:** Spacebar simulates blink events in Unity Editor only  
**Verification:** Spacebar calls OnBlinkDetected() in Editor only  
**Covers:** AC7

## Unity Lifecycle Methods

### Awake()
- Cache Camera.main reference
- Cache Animator component
- Validate required components exist

### Start()
- Initialize currentLives = lives
- Calculate teleportDistance = (startingDistance - goalDistance) / (lives - 1)
- Position monster at starting distance
- Face monster toward camera

### Update() or FixedUpdate()
- If isSprinting:
  - Move monster toward camera
  - Check for game over condition
- In Unity Editor only:
  - Check for Spacebar input
  - If pressed, call OnBlinkDetected()

### OnBlinkDetected() (Public method called from external systems or Spacebar in Editor)
- Handle blink event logic
- Decrement lives
- Teleport or trigger sprint

## Animation Setup

### Animator Configuration
- Parameter: "sprint" (Trigger)
- State: "Sprint" animation clip
- Transition: Any State → Sprint (when trigger set)

### Animation Considerations
- Sprint animation should loop or be long enough
- Movement is handled by script, not animation root motion
- Animation provides visual feedback only

## Edge Cases

### E1: Zero Lives Configuration
**Scenario:** lives set to 0 in Inspector  
**Handling:** Clamp lives to minimum of 1 in Start()

### E2: Invalid Distance Configuration
**Scenario:** goalDistance >= startingDistance  
**Handling:** Log error and clamp goalDistance to startingDistance - 1

### E3: Missing Camera
**Scenario:** Camera.main is null  
**Handling:** Log error and disable script

### E4: Missing Animator
**Scenario:** Animator component not found  
**Handling:** Log warning, continue without animation

### E5: Rapid Blink Events
**Scenario:** Multiple blink events in quick succession  
**Handling:** Process each event sequentially, no debouncing needed

## Performance Considerations

- Teleportation is instant (no lerping) for performance
- Cache camera and animator references
- Use Vector3 operations efficiently
- Minimal calculations per frame during sprint
- No physics-based movement (direct transform manipulation)

## Testing Strategy

### Unit Testing (Manual in Unity)
1. Verify spawn position at startingDistance
2. Press Spacebar to simulate blinks in Editor
3. Test blink event reduces lives
4. Verify teleport distance calculation
5. Test final blink triggers sprint
6. Verify Y position always 0
7. Verify Spacebar only works in Editor

### Integration Testing
1. Verify animation triggers correctly
2. Test with different configuration values

### Edge Case Testing
1. Test with lives = 1
2. Test with lives = 10
3. Test with various distance configurations
4. Test rapid blinking

## Future Enhancements (Out of Scope)

- Smooth teleportation with lerp/animation
- Particle effects on teleport
- Sound effects
- Multiple difficulty presets
- Monster variants with different behaviors
- Pause/resume functionality
