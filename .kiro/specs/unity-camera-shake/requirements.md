# Unity Camera Shake - Requirements

## Introduction

The Camera Shake system provides continuous visual feedback through camera movement that intensifies with danger level. It shakes the camera perpetually on the X and Y axes while preserving the Z position, with intensity automatically adjusting based on lose completion percentage.

## Context

Camera shake enhances game feel by providing continuous visual feedback that increases as the player gets closer to losing. The shake runs perpetually in Update(), with intensity automatically switching between 4 levels based on lose completion ranges (0-24%, 25-49%, 50-74%, 75-100%). When intensity is 0, the camera stays at its original position.

## Glossary

- **Camera Shake**: Random camera movement on X and Y axes
- **Shake Intensity**: Magnitude of camera displacement
- **Original Position**: Camera's starting position to return to

## Requirements

### Requirement 1: Camera Shake Script

**User Story:** As a developer, I want a camera shake script, so that I can add continuous visual feedback.

#### Acceptance Criteria

1. THE CameraShake script SHALL be a MonoBehaviour
2. THE script SHALL be attachable to the Main Camera GameObject
3. THE script SHALL cache the camera's original position on Start
4. THE script SHALL shake the camera every frame in Update()

### Requirement 2: Shake Intensity Levels

**User Story:** As a developer, I want 4 intensity levels, so that shake increases with danger.

#### Acceptance Criteria

1. THE script SHALL provide a serialized array for 4 shake intensities
2. THE array SHALL be named shakeIntensities
3. THE array SHALL be assignable in the Inspector
4. THE intensities SHALL control the magnitude of camera displacement at each danger level

### Requirement 3: X and Y Axis Shake Only

**User Story:** As a system, I want to shake only X and Y axes, so that camera depth is preserved.

#### Acceptance Criteria

1. WHEN intensity > 0, THE camera SHALL move randomly on the X axis every frame
2. WHEN intensity > 0, THE camera SHALL move randomly on the Y axis every frame
3. THE camera's Z position SHALL never change during shake
4. THE shake SHALL use Random.Range for displacement

### Requirement 4: GameObserver Integration

**User Story:** As a system, I want shake intensity to respond to lose completion, so that shake increases with danger.

#### Acceptance Criteria

1. THE script SHALL subscribe to GameObserver.Notifier in OnEnable
2. THE script SHALL unsubscribe in OnDisable
3. WHEN lose completion is 0-24%, THE system SHALL use intensity at index 0
4. WHEN lose completion is 25-49%, THE system SHALL use intensity at index 1
5. WHEN lose completion is 50-74%, THE system SHALL use intensity at index 2
6. WHEN lose completion is 75-100%, THE system SHALL use intensity at index 3

### Requirement 5: Perpetual Shake

**User Story:** As a system, I want the camera to shake continuously, so that it provides constant visual feedback.

#### Acceptance Criteria

1. THE shake SHALL run every frame in Update()
2. THE shake SHALL continue indefinitely while currentIntensity > 0
3. THE original position SHALL be cached on Start
4. THE shake SHALL apply offset from original position each frame

### Requirement 6: Stop Shake Control

**User Story:** As a system, I want to stop shake on game over, so that the camera stops moving.

#### Acceptance Criteria

1. THE script SHALL provide a public StopShake() method
2. WHEN StopShake() is called, THE currentIntensity SHALL be set to 0
3. THE camera SHALL return to original position when stopped
4. THE GameManager SHALL call StopShake() on game over

## Non-Functional Requirements

### NFR1: Performance
- Shake uses coroutine (no per-frame overhead when not shaking)
- Minimal CPU usage during shake

### NFR2: Usability
- Simple API: CameraShake.Shake()
- Inspector controls for intensity and duration
- Easy to attach to camera

## Constraints

- Must preserve camera Z position
- Must run in Update() every frame
- Must stop shaking when intensity is 0
- Must shake continuously when intensity > 0

## Dependencies

- Unity 6.1
- Main Camera GameObject
- GameObserver script (Notifier action)
- GameManager script (for stop integration)
- Random.Range for displacement

## Success Metrics

- Camera shakes on X and Y axes only
- Z position never changes
- Camera returns to original position
- Intensity and duration are configurable
- No errors in Console

## Out of Scope

- Shake on Z axis
- Timed shake duration
- Shake curves/easing
- Shake decay over time
- Directional shake
- Shake based on lose completion
- Automatic intensity adjustment
