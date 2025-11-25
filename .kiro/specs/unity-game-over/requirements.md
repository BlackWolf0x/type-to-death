# Unity Game Over - Requirements

## Introduction

The Game Over system detects when the player loses and displays a black screen. It subscribes to the GameObserver's lose completion percentage and triggers the game over sequence when the player reaches 100% lose completion.

## Context

When the monster reaches the player (100% lose completion), the game needs to end gracefully by showing a black screen and stopping unnecessary game logic. This provides clear feedback that the game has ended.

## Glossary

- **Game Over**: The end state when the player loses
- **Black Screen**: UI panel that covers the screen with black color
- **Lose Completion**: Percentage tracked by GameObserver (0-100%)
- **GameManager**: Singleton that manages game state and game over logic

## Requirements

### Requirement 1: GameManager Singleton

**User Story:** As a developer, I want a single GameManager, so that I can manage game state globally.

#### Acceptance Criteria

1. THE GameManager SHALL implement the singleton pattern with a public static Instance property
2. WHEN the scene loads, THE GameManager SHALL ensure only one instance exists
3. THE GameManager SHALL persist across scene loads using DontDestroyOnLoad

### Requirement 2: Lose Completion Monitoring

**User Story:** As a system, I want to monitor lose completion percentage, so that I can trigger game over at 100%.

#### Acceptance Criteria

1. THE GameManager SHALL subscribe to GameObserver.Notifier in OnEnable
2. THE GameManager SHALL unsubscribe from GameObserver.Notifier in OnDisable
3. WHEN lose completion reaches 100%, THE GameManager SHALL trigger the game over sequence
4. THE game over sequence SHALL only trigger once per game session

### Requirement 3: Black Screen Display

**User Story:** As a player, I want to see a black screen when I lose, so that I know the game has ended.

#### Acceptance Criteria

1. THE GameManager SHALL have a reference to a UI Panel component
2. WHEN game over triggers, THE system SHALL activate the black screen panel after a configurable delay
3. THE delay SHALL be configurable via a serialized field
4. THE system SHALL use a coroutine with WaitForSeconds for the delay
5. THE black screen panel SHALL be inactive at game start

### Requirement 4: Monster Deactivation

**User Story:** As a system, I want to deactivate the monster on game over, so that it stops consuming resources.

#### Acceptance Criteria

1. THE GameManager SHALL have a reference to the Monster GameObject
2. WHEN the black screen activates, THE system SHALL deactivate the Monster GameObject
3. THE Monster's Update() method SHALL stop running after deactivation

## Non-Functional Requirements

### NFR1: Performance
- Monster deactivation stops Update() calls immediately
- Coroutine uses minimal resources during delay

### NFR2: Usability
- Configurable delay allows tuning of game over timing
- Clear visual feedback (black screen)

## Constraints

- Must use Unity UI Panel for black screen
- Must use coroutine with WaitForSeconds
- Must deactivate Monster GameObject (not destroy)
- Single game over trigger per session

## Dependencies

- GameObserver script (Notifier action)
- MonsterController GameObject
- Unity UI Panel component

## Success Metrics

- Game over triggers at exactly 100% lose completion
- Black screen appears after configured delay
- Monster stops updating after game over
- No errors in Console

## Out of Scope

- Restart functionality
- Game over UI text/buttons
- Sound effects on game over
- Score display
- Multiple game over conditions
- Fade effects (instant black screen)
- Menu navigation
