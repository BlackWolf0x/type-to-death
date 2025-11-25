# Unity SFX System - Requirements

## Introduction

The SFX System provides centralized management of sound effects in the game. It handles playback, muting, and provides global access to all sound effects through a singleton pattern. This system focuses exclusively on sound effects (SFX), not music or ambiance.

## Context

The game requires sound effects to enhance player experience and provide audio feedback for game events. The monster's scream when sprinting is a critical audio cue that signals imminent danger. A centralized SFX manager ensures consistent audio playback and easy access from any script.

## Glossary

- **SFX**: Sound Effects - short audio clips triggered by game events
- **Singleton**: Design pattern ensuring only one instance exists globally
- **AudioClip**: Unity's audio data container
- **AudioSource**: Unity component that plays audio

## Requirements

### Requirement 1: SFX Manager Singleton

**User Story:** As a developer, I want a single global SFX manager, so that I can access sound effects from any script without references.

#### Acceptance Criteria

1. THE SFXManager SHALL implement the singleton pattern with a public static Instance property
2. WHEN the scene loads, THE SFXManager SHALL ensure only one instance exists
3. IF a second SFXManager is created, THEN THE system SHALL destroy the duplicate instance
4. THE SFXManager SHALL persist across scene loads using DontDestroyOnLoad

### Requirement 2: Sound Effect Storage

**User Story:** As a developer, I want to define and assign sound effects in the Inspector, so that I can manage audio assets centrally.

#### Acceptance Criteria

1. THE SFXManager SHALL provide a serialized field for the Scream AudioClip
2. THE SFXManager SHALL expose a public property to retrieve the Scream AudioClip
3. THE system SHALL validate that AudioClips are assigned at startup
4. IF an AudioClip is missing, THEN THE system SHALL log a warning

### Requirement 3: Sound Effect Playback

**User Story:** As a developer, I want to play sound effects with a simple API, so that I can trigger audio from any script easily.

#### Acceptance Criteria

1. THE SFXManager SHALL provide a public Play(AudioClip) method
2. WHEN Play() is called with a valid AudioClip, THE system SHALL play the sound effect
3. THE Play() method SHALL respect the mute state
4. IF muted, THEN THE Play() method SHALL not play any sound
5. IF the AudioClip parameter is null, THEN THE system SHALL log a warning and not play

### Requirement 4: Mute Control

**User Story:** As a player, I want to mute/unmute sound effects, so that I can control audio output.

#### Acceptance Criteria

1. THE SFXManager SHALL provide a public Mute() method
2. THE SFXManager SHALL provide a public Unmute() method
3. WHEN Mute() is called, THE system SHALL prevent all sound effects from playing
4. WHEN Unmute() is called, THE system SHALL allow sound effects to play
5. THE mute state SHALL default to unmuted (false)

### Requirement 5: Monster Scream Integration

**User Story:** As a player, I want to hear a scream when the monster starts sprinting, so that I know danger is imminent.

#### Acceptance Criteria

1. WHEN the monster's isSprinting becomes true, THE system SHALL play the Scream sound effect
2. THE scream SHALL be triggered from MonsterController
3. THE scream SHALL use the SFXManager.Instance.Play() API
4. THE scream SHALL only play once per sprint (not repeatedly)

### Requirement 6: Audio Component Management

**User Story:** As a developer, I want the SFX manager to handle AudioSource components, so that I don't need to manage them manually.

#### Acceptance Criteria

1. THE SFXManager SHALL have an AudioSource component attached
2. THE AudioSource SHALL be used to play all sound effects
3. IF no AudioSource exists, THE system SHALL add one automatically in Awake
4. THE AudioSource SHALL be configured for 2D spatial blend (UI/SFX)

## Non-Functional Requirements

### NFR1: Performance
- Sound effect playback SHALL have minimal latency (<10ms)
- No allocations during Play() method execution
- AudioSource component reuse (no instantiation per sound)

### NFR2: Usability
- API SHALL be simple: `SFXManager.Instance.Play(SFXManager.Instance.Scream)`
- No Inspector references required in calling scripts
- Clear error messages for missing AudioClips

### NFR3: Maintainability
- Easy to add new sound effects (add field + property)
- Centralized audio management
- Minimal code in calling scripts

### NFR4: Compatibility
- Unity 6.1 compatible
- Works with Unity's audio system
- No external audio plugins required

## Constraints

- Must use Unity's built-in audio system
- Singleton pattern required for global access
- Only one AudioSource for all SFX playback
- No audio mixing or effects processing
- No volume control (future enhancement)

## Dependencies

- Unity 6.1 audio system
- MonsterController script (for scream integration)
- AudioClip assets (Scream.wav or similar)

## Success Metrics

- SFX manager accessible from any script via Instance
- Scream plays when monster starts sprinting
- Mute/unmute functions work correctly
- No audio-related errors in Console
- Zero per-frame overhead when no sounds playing

## Out of Scope

- Music system (separate system)
- Ambiance/background sounds
- Volume control (future enhancement)
- Audio mixing/effects
- 3D spatial audio
- Multiple AudioSource pooling
- Audio fade in/out
- Pitch variation
- Random sound selection from arrays
- Audio priority system
- Sound effect categories/groups
