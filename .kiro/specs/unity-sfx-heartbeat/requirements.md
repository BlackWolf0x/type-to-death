# Unity SFX Heartbeat - Requirements

## Introduction

The Heartbeat SFX system provides dynamic audio feedback that intensifies as the player gets closer to losing. It plays looping heartbeat sounds that increase in intensity based on the lose completion percentage.

## Context

As the player loses lives and approaches game over, the heartbeat sound should intensify to create tension and provide audio feedback about danger level. The system uses 4 different heartbeat intensity levels that switch automatically based on lose completion percentage.

## Glossary

- **Heartbeat Intensity**: Different heartbeat audio tracks representing increasing danger levels
- **Lose Completion**: Percentage from GameObserver (0-100%)
- **Looping Audio**: Audio that plays continuously until stopped or switched

## Requirements

### Requirement 1: Heartbeat Audio Storage

**User Story:** As a developer, I want to store 4 heartbeat intensity tracks, so that the system can switch between them based on danger level.

#### Acceptance Criteria

1. THE SFXManager SHALL provide a serialized array for 4 heartbeat AudioClips
2. THE array SHALL be named heartbeatIntensities
3. THE array SHALL be assignable in the Inspector
4. THE system SHALL validate that all 4 AudioClips are assigned at startup

### Requirement 2: Heartbeat Playback Control

**User Story:** As a system, I want to play heartbeat audio on loop, so that it provides continuous audio feedback.

#### Acceptance Criteria

1. THE SFXManager SHALL provide a PlayHeartbeat() method
2. WHEN PlayHeartbeat() is called, THE system SHALL start playing the appropriate heartbeat intensity
3. THE heartbeat SHALL loop continuously until stopped or switched
4. THE system SHALL use a dedicated AudioSource for heartbeat playback

### Requirement 3: Intensity Switching Based on Lose Completion

**User Story:** As a player, I want the heartbeat to intensify as I lose lives, so that I have audio feedback about danger level.

#### Acceptance Criteria

1. WHEN lose completion is 0-24%, THE system SHALL play heartbeat at index 0 (intensity 1)
2. WHEN lose completion is 25-49%, THE system SHALL play heartbeat at index 1 (intensity 2)
3. WHEN lose completion is 50-74%, THE system SHALL play heartbeat at index 2 (intensity 3)
4. WHEN lose completion is 75-100%, THE system SHALL play heartbeat at index 3 (intensity 4)
5. THE system SHALL switch to the new intensity when lose completion changes ranges

### Requirement 4: GameObserver Integration

**User Story:** As a system, I want to monitor lose completion percentage, so that I can update heartbeat intensity automatically.

#### Acceptance Criteria

1. THE SFXManager SHALL subscribe to GameObserver.Notifier in OnEnable
2. THE SFXManager SHALL unsubscribe in OnDisable
3. WHEN lose completion percentage changes, THE system SHALL check if intensity needs to change
4. THE system SHALL switch heartbeat intensity only when crossing range boundaries

### Requirement 5: Heartbeat Stop Control

**User Story:** As a system, I want to stop the heartbeat on game over, so that it doesn't continue playing.

#### Acceptance Criteria

1. THE SFXManager SHALL provide a StopHeartbeat() method
2. WHEN StopHeartbeat() is called, THE system SHALL stop the heartbeat AudioSource
3. THE heartbeat SHALL stop playing immediately

## Non-Functional Requirements

### NFR1: Performance
- Smooth transitions between intensities (no audio gaps)
- Minimal CPU usage for intensity switching
- Efficient AudioSource management

### NFR2: Usability
- Clear intensity progression (1-4)
- Automatic intensity switching based on danger
- Easy to assign tracks in Inspector

## Constraints

- Must use separate AudioSource for heartbeat (not the main SFX AudioSource)
- Must loop continuously until stopped
- Must switch intensities based on exact percentage ranges
- 4 intensity levels required (no more, no less)

## Dependencies

- SFXManager script (existing)
- GameObserver script (Notifier action)
- 4 heartbeat AudioClip assets (different intensities)

## Success Metrics

- Heartbeat plays continuously during gameplay
- Intensity switches at correct percentage thresholds
- Smooth transitions between intensities
- Heartbeat stops on game over
- No audio-related errors in Console

## Out of Scope

- Volume control per intensity
- Fade in/out between intensities
- Pitch variation
- Random heartbeat selection
- More than 4 intensity levels
- Heartbeat visualization
- BPM synchronization
