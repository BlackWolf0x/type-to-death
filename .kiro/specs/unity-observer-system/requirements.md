# Unity Observer System - Requirements

## Introduction

This feature implements an observer pattern system that tracks the player's progression toward losing the game. The system calculates and broadcasts the "lose completion percentage" based on lives lost, allowing other game systems to react dynamically to the player's danger level.

## Context

In the Type to Death game, the monster advances toward the player with each blink, creating escalating tension. Various game systems (audio, visual effects, UI) need to respond to how close the player is to losing. This observer system provides a centralized way to track and broadcast this information without tight coupling between systems.

## Glossary

- **Observer System**: A script that tracks game state and notifies subscribers of changes
- **Lose Completion Percentage**: A value from 0-100 representing how close the player is to losing (0% = just started, 100% = game over)
- **Lives Lost**: The number of lives the player has lost from their initial total
- **Observer**: A system that subscribes to and receives notifications from the observer system
- **Event**: A notification sent when the lose completion percentage changes
- **MonsterController**: The existing script that manages monster behavior and lives

## Requirements

### Requirement 1: Lose Completion Tracking

**User Story:** As a developer, I want to track how close the player is to losing, so that I can create dynamic responses based on danger level.

#### Acceptance Criteria

1. THE GameObserver SHALL calculate lose completion percentage as: `(livesLost / totalLives) * 100`
2. THE GameObserver SHALL update the lose completion percentage whenever lives change
3. THE lose completion percentage SHALL be a float value between 0 and 100
4. WHEN no lives are lost, THE lose completion percentage SHALL be 0
5. WHEN all lives are lost, THE lose completion percentage SHALL be 100

### Requirement 2: Observer Pattern Implementation

**User Story:** As a developer, I want to use the observer pattern, so that multiple systems can react to game state changes without tight coupling.

#### Acceptance Criteria

1. THE GameObserver SHALL implement a C# event for lose completion changes
2. THE GameObserver SHALL allow external scripts to subscribe to the event
3. THE GameObserver SHALL allow external scripts to unsubscribe from the event
4. WHEN the lose completion percentage changes, THE GameObserver SHALL invoke the event with the new percentage
5. THE event SHALL pass the current lose completion percentage as a parameter

### Requirement 3: Lives Monitoring

**User Story:** As a developer, I want the observer to automatically track lives from MonsterController, so that I don't need to manually update it.

#### Acceptance Criteria

1. THE GameObserver SHALL reference the MonsterController component
2. THE GameObserver SHALL read the initial lives count from MonsterController at game start
3. THE GameObserver SHALL monitor the current lives count from MonsterController
4. WHEN lives change in MonsterController, THE GameObserver SHALL detect the change
5. THE GameObserver SHALL calculate lives lost as: `initialLives - currentLives`

### Requirement 4: Public Access to Percentage

**User Story:** As a developer, I want to query the current lose completion percentage, so that systems can check the value on-demand without subscribing to events.

#### Acceptance Criteria

1. THE GameObserver SHALL expose a public property for lose completion percentage
2. THE property SHALL be read-only from external scripts
3. THE property SHALL return the current lose completion percentage as a float
4. THE property SHALL always return a value between 0 and 100
5. THE property SHALL be accessible at any time during gameplay

### Requirement 5: Initialization and Validation

**User Story:** As a developer, I want the observer to validate its setup, so that I can catch configuration errors early.

#### Acceptance Criteria

1. THE GameObserver SHALL validate that MonsterController reference is assigned
2. WHEN MonsterController is not assigned, THE GameObserver SHALL log an error and disable itself
3. THE GameObserver SHALL initialize the lose completion percentage to 0 at game start
4. THE GameObserver SHALL cache the initial lives count at game start
5. THE GameObserver SHALL log initialization success for debugging

### Requirement 6: Update Frequency

**User Story:** As a developer, I want the observer to update efficiently, so that it doesn't impact game performance.

#### Acceptance Criteria

1. THE GameObserver SHALL check for lives changes in Update() method
2. THE GameObserver SHALL only invoke events when the percentage actually changes
3. THE GameObserver SHALL not invoke events if the percentage remains the same
4. THE GameObserver SHALL calculate percentage only when lives have changed
5. THE GameObserver SHALL use minimal CPU resources per frame

## Non-Functional Requirements

### NFR1: Performance
The observer system must have negligible performance impact, with calculations only occurring when lives change.

### NFR2: Decoupling
The observer system must not depend on specific subscriber implementations, maintaining loose coupling.

### NFR3: Unity 6.1 Compatibility
All code must be compatible with Unity 6.1 LTS and follow C# event patterns.

### NFR4: Extensibility
The system should be easily extensible for tracking additional game state metrics in the future.

## Constraints

- Must integrate with existing MonsterController without modifying it
- Must use C# events (not UnityEvents) for performance
- Percentage must be calculated from lives, not distance or time
- Observer must be a MonoBehaviour component
- Only one GameObserver instance should exist per scene

## Dependencies

- MonsterController script (from unity-monster spec)
- Unity 6.1 project
- C# event system

## Success Metrics

- Observer correctly calculates 0% at game start
- Observer correctly calculates 100% at game over
- Observer correctly calculates intermediate percentages (e.g., 50% at half lives lost)
- Events fire only when percentage changes
- External scripts can successfully subscribe and receive updates
- No performance impact measurable in profiler

## Out of Scope

- Specific implementations of observer subscribers (SFX manager, VFX manager, etc.)
- UI display of the percentage
- Multiple observer instances or singleton pattern
- Tracking metrics other than lose completion (distance, time, etc.)
- Saving/loading observer state
- Network synchronization
- Observer pattern for other game events
