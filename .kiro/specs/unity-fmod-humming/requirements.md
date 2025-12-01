# Unity FMOD Humming - Requirements

## Introduction

The Humming FMOD system plays a looping humming sound when lose completion reaches 75%, creating an ominous atmosphere. When the player reaches exactly 1 life remaining, the humming pitch increases suddenly to heighten tension before the final sprint attack.

## Context

When lose completion reaches 75%, a humming sound begins playing automatically. When the player reaches 1 life remaining, the monster teleports to the goal distance, displays the final pose, and the humming pitch increases suddenly to create maximum tension before the final blink triggers the sprint attack.

## Glossary

- **Humming Sound**: Looping FMOD event that plays when player has 1 life left
- **FMOD EventInstance**: Runtime instance of an FMOD event that can be controlled
- **EventReference**: Reference to an FMOD event in the FMOD Studio project
- **Final Life State**: Game state when currentLives equals 1

## Requirements

### Requirement 1: Humming Event Storage

**User Story:** As a developer, I want to store a humming event reference in AudioManager, so that it can be played when the player reaches 1 life.

#### Acceptance Criteria

1. THE AudioManager SHALL provide a serialized EventReference field for the humming sound
2. THE field SHALL be named hummingRef
3. THE field SHALL be assignable in the Inspector under an "Humming" header
4. THE system SHALL create an EventInstance from the reference at initialization

### Requirement 2: Humming Playback Trigger

**User Story:** As a player, I want to hear humming when lose completion reaches 75%, so that I know I'm approaching critical danger.

#### Acceptance Criteria

1. THE AudioManager SHALL provide a PlayHumming() method
2. WHEN PlayHumming() is called, THE system SHALL start the humming EventInstance
3. THE humming SHALL loop continuously until stopped
4. THE AudioManager SHALL automatically call PlayHumming() when lose completion reaches 75%
5. THE system SHALL prevent playing humming multiple times if already playing

### Requirement 3: Humming Pitch Increase

**User Story:** As a player, I want the humming pitch to increase when I reach 1 life, so that I feel maximum tension before the final moment.

#### Acceptance Criteria

1. THE AudioManager SHALL provide a serialized float field for humming pitch increase value
2. THE field SHALL be named hummingPitchIncrease and default to 2.0
3. THE field SHALL be assignable in the Inspector under "Humming" header
4. THE AudioManager SHALL provide an IncreaseHummingPitch() method
5. WHEN IncreaseHummingPitch() is called, THE system SHALL set the humming pitch to hummingPitchIncrease value
6. THE MonsterController SHALL call IncreaseHummingPitch() when currentLives equals 1

### Requirement 4: Humming Stop Control

**User Story:** As a system, I want to stop the humming when game over occurs, so that it doesn't continue playing.

#### Acceptance Criteria

1. THE AudioManager SHALL provide a StopHumming() method
2. WHEN StopHumming() is called, THE system SHALL stop the humming EventInstance with fade out
3. THE AudioManager SHALL call StopHumming() when StopHeartbeat() is called (game over scenario)

### Requirement 5: Lose Completion Integration

**User Story:** As a system, I want humming to respond to lose completion percentage, so that it plays automatically at the right time.

#### Acceptance Criteria

1. THE AudioManager SHALL subscribe to GameObserver.Notifier for lose completion updates
2. WHEN lose completion reaches 75% or higher, THE system SHALL play humming automatically
3. THE system SHALL track humming playing state to prevent duplicate playback
4. THE humming SHALL continue playing as lose completion increases from 75% to 100%

## Non-Functional Requirements

### NFR1: Performance
- Minimal CPU usage for humming playback
- Efficient EventInstance management
- No audio stuttering or gaps

### NFR2: Usability
- Clear audio cue for critical danger state
- Smooth start and stop transitions
- Easy to assign event reference in Inspector

## Constraints

- Must use dedicated EventInstance for humming (separate from other sounds)
- Must loop continuously while player has 1 life
- Must stop when sprint begins (currentLives == 0)
- Must properly release EventInstance to prevent memory leaks

## Dependencies

- AudioManager script (existing)
- MonsterController script (existing)
- Humming FMOD event (looping)
- FMOD Unity Integration package

## Success Metrics

- Humming plays automatically when lose completion reaches 75%
- Humming loops continuously during final life phase
- Humming pitch increases suddenly when player reaches 1 life
- Pitch increase value is controllable from Inspector
- Humming stops smoothly on game over
- No audio-related errors in Console
- No FMOD memory leaks

## Out of Scope

- Volume control
- Gradual pitch ramping (only sudden increase implemented)
- Multiple humming variations
- Fade in duration control
- Humming visualization
- Advanced FMOD parameter automation
- Spatial audio positioning
- Pitch decrease or reset functionality
