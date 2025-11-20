# Requirements Document

## Introduction

This feature implements the core "Weeping Angel" mechanic for the Type to Death game. The monster will move toward the player (camera) when not being looked at, and freeze when the player's gaze (cursor) is on it. This creates the tension mechanic where players must balance looking at the monster and looking at the typing area.

## Glossary

- **Monster**: The 3D character that approaches the player using the Weeping Angel mechanic
- **Weeping Angel Mechanic**: Gameplay pattern where the monster only moves when not being observed
- **Raycast**: Unity physics technique to detect what the cursor is pointing at
- **Goal Distance**: The minimum distance at which the monster triggers game over
- **Starting Distance**: The initial distance the monster spawns from the camera

## Requirements

### Requirement 1

**User Story:** As a player, I want the monster to freeze when I look at it, so that I can control its approach by managing my attention

#### Acceptance Criteria

1. THE Monster SHALL detect when the cursor is positioned over it using raycast
2. WHEN the cursor is on the Monster, THE Monster SHALL stop moving
3. WHEN the cursor is NOT on the Monster, THE Monster SHALL resume moving toward the camera
4. THE Monster SHALL have a collider component for raycast detection
5. THE Monster SHALL respond immediately to cursor position changes

### Requirement 2

**User Story:** As a player, I want the monster to move toward me when I'm not looking at it, so that there is a constant threat requiring my attention

#### Acceptance Criteria

1. THE Monster SHALL move in a straight line toward the camera position
2. THE Monster SHALL move at a configurable speed (walkSpeed)
3. THE Monster SHALL face the camera while moving
4. THE Monster SHALL use Time.deltaTime for frame-rate independent movement
5. THE Monster SHALL continue moving until reaching the goal distance

### Requirement 3

**User Story:** As a player, I want to see the monster's walk animation when it moves, so that the movement feels natural and threatening

#### Acceptance Criteria

1. THE Monster SHALL play the "walk" animation when moving
2. THE Monster SHALL pause/stop the animation when frozen by player's gaze
3. THE Monster SHALL use the Animator component to control animation
4. THE animation speed SHALL be configurable (animationSpeed parameter)
5. THE animation SHALL resume from where it paused when movement resumes

### Requirement 4

**User Story:** As a developer, I want configurable parameters for the monster behavior, so that I can balance the game difficulty

#### Acceptance Criteria

1. THE Monster SHALL have a configurable starting distance from the camera
2. THE Monster SHALL have a configurable walk speed
3. THE Monster SHALL have a configurable animation speed
4. THE Monster SHALL have a configurable goal distance for game over trigger
5. ALL parameters SHALL be visible and editable in the Unity Inspector
6. THE Monster SHALL position itself at the starting distance when the game starts

### Requirement 5

**User Story:** As a player, I want the game to end when the monster gets too close, so that there are consequences for not managing my attention

#### Acceptance Criteria

1. THE Monster SHALL check its distance from the camera every frame
2. WHEN the Monster reaches the goal distance, THE Monster SHALL trigger game over
3. WHEN game over is triggered, THE Monster SHALL stop all movement
4. WHEN game over is triggered, THE Monster SHALL stop all animation
5. THE Monster SHALL log "Game Over" message for debugging
6. THE Monster SHALL provide a public method to check if goal has been reached

### Requirement 6

**User Story:** As a developer, I want the monster to use Unity 6.1 compatible APIs, so that the code is future-proof and follows best practices

#### Acceptance Criteria

1. THE Monster SHALL use TryGetComponent for component access
2. THE Monster SHALL cache all component references in Awake
3. THE Monster SHALL use Camera.main to reference the main camera
4. THE Monster SHALL follow Unity 6.1 coding standards
5. THE Monster SHALL use SerializeField for inspector-visible variables
