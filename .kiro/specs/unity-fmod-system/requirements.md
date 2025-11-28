# Unity FMOD System - Requirements

## Introduction

The FMOD System provides centralized management of sound effects using FMOD Studio. It handles SFX playback through FMOD's event system with EventReference and EventInstance.

## Context

The game uses FMOD Studio for audio instead of Unity's built-in audio system. FMOD provides more advanced audio features and better performance. The AudioManager creates EventInstances from EventReferences and provides simple playback control.

## Glossary

- **FMOD**: Audio middleware for games
- **EventReference**: FMOD reference to an audio event
- **EventInstance**: Runtime instance of an FMOD event
- **RuntimeManager**: FMOD's manager for creating instances

## Requirements

### Requirement 1: AudioManager Singleton

**User Story:** As a developer, I want a single global AudioManager, so that I can access FMOD audio from any script.

#### Acceptance Criteria

1. THE AudioManager SHALL implement the singleton pattern with a public static Instance property
2. WHEN the scene loads, THE AudioManager SHALL ensure only one instance exists
3. THE AudioManager SHALL persist across scene loads using DontDestroyOnLoad

### Requirement 2: SFX Storage

**User Story:** As a developer, I want to define FMOD event references in the Inspector, so that I can manage audio events centrally.

#### Acceptance Criteria

1. THE AudioManager SHALL provide a serialized EventReference field for GameOver SFX
2. THE AudioManager SHALL provide a public EventInstance field for GameOver SFX
3. THE EventReference SHALL be assignable in the Inspector

### Requirement 3: SFX Instantiation

**User Story:** As a system, I want to create EventInstances from EventReferences, so that I can play FMOD events.

#### Acceptance Criteria

1. THE AudioManager SHALL provide an InstantiateSFXs() method
2. THE method SHALL be called in Awake()
3. THE method SHALL use RuntimeManager.CreateInstance() to create EventInstances
4. THE GameOver EventInstance SHALL be created from GameOver EventReference

### Requirement 4: SFX Playback

**User Story:** As a developer, I want to play FMOD sound effects, so that I can trigger audio from any script.

#### Acceptance Criteria

1. THE AudioManager SHALL provide a public PlaySfx(EventInstance) method
2. WHEN PlaySfx() is called, THE system SHALL call sfx.start()
3. THE method SHALL accept any EventInstance as parameter

### Requirement 5: GameOver SFX Integration

**User Story:** As a system, I want to play game over sound, so that players hear audio feedback on game over.

#### Acceptance Criteria

1. THE GameManager SHALL call AudioManager.Instance.PlaySfx() on game over
2. THE call SHALL pass AudioManager.Instance.GameOverSfx
3. THE call SHALL happen in GameOverSequence() after black screen activates

## Non-Functional Requirements

### NFR1: Performance
- EventInstances created once in Awake
- Minimal overhead for playback
- No allocations during PlaySfx()

### NFR2: Compatibility
- Must work with FMOD Studio Unity Integration
- Must work with Unity 6.1
- Must support FMOD EventReference/EventInstance pattern

## Constraints

- Must use FMOD Studio Unity Integration
- Must use EventReference for Inspector assignment
- Must use EventInstance for runtime playback
- Must use RuntimeManager.CreateInstance()
- Single AudioManager instance

## Dependencies

- FMOD Studio Unity Integration package
- GameManager script (for integration)
- FMOD Studio project with audio events

## Success Metrics

- AudioManager accessible via Instance
- GameOver SFX plays on game over
- EventInstances created successfully
- No FMOD-related errors in Console

## Out of Scope

- Mute/unmute functionality
- Heartbeat system
- Volume control
- Multiple AudioManager instances
- 3D spatial audio
- Audio parameters
- Event callbacks
- Audio pooling
