# Requirements Document

## Introduction

This specification defines the main application flow for "Type To Death", a single-page application (SPA) that integrates a Unity game with a React-based UI. The system manages navigation between the main menu and gameplay through component visibility toggling, with support for modals/dialogs for secondary features like eye tracking calibration, leaderboards, and intro sequences.

## Glossary

- **Main Menu Component**: The primary navigation interface displayed on application launch, layered over the Unity game
- **Unity Game Component**: The Unity WebGL game instance that runs continuously in the background
- **Game Component**: The React component that manages game-related UI elements
- **Intro Modal**: A dialog component that displays introductory content before gameplay begins
- **Skip Intro Preference**: A user preference stored in browser localStorage to bypass the intro modal
- **Eye Tracking Calibration Modal**: A dialog component for configuring eye tracking functionality
- **Leaderboard Modal**: A dialog component displaying player rankings and scores
- **Global State Store**: A Zustand store managing application-wide state without prop drilling
- **SPA**: Single-Page Application - all features exist within one page using component visibility

## Requirements

### Requirement 1

**User Story:** As a player, I want to see a main menu when I launch the application, so that I can choose what action to take

#### Acceptance Criteria

1. WHEN the application loads, THE Main Menu Component SHALL display over the Unity Game Component
2. THE Main Menu Component SHALL display the title "Type To Death" in a header element
3. THE Main Menu Component SHALL display a "Start Game" button
4. THE Main Menu Component SHALL display an "Eye Tracking Calibration" button
5. THE Main Menu Component SHALL display a "Leaderboard" button

### Requirement 2

**User Story:** As a player, I want the Unity game to preload in the background, so that gameplay starts immediately without loading delays

#### Acceptance Criteria

1. WHEN the application initializes, THE Unity Game Component SHALL load and render in the background
2. WHILE the Main Menu Component is visible, THE Unity Game Component SHALL remain mounted in the DOM
3. THE Unity Game Component SHALL be visually hidden by the Main Menu Component overlay

### Requirement 3

**User Story:** As a player, I want to start the game by clicking a button, so that I can begin playing

#### Acceptance Criteria

1. WHEN the player clicks the "Start Game" button, THE Main Menu Component SHALL become hidden
2. WHEN the player clicks the "Start Game" button, THE Unity Game Component SHALL become visible
3. WHEN the player clicks the "Start Game" button, THE Game Component SHALL become visible
4. IF the Skip Intro Preference is not set to true, THEN THE Intro Modal SHALL display before hiding the Main Menu Component

### Requirement 4

**User Story:** As a player, I want to skip the intro sequence, so that I can start playing faster on subsequent visits

#### Acceptance Criteria

1. THE Main Menu Component SHALL display a checkbox labeled "Skip Intro"
2. WHEN the player toggles the "Skip Intro" checkbox, THE Global State Store SHALL update the skip intro state
3. WHEN the skip intro state changes, THE SPA SHALL persist the preference to browser localStorage
4. WHEN the application loads, THE SPA SHALL read the Skip Intro Preference from localStorage and update the Global State Store
5. IF the Skip Intro Preference is set to true, THEN THE Intro Modal SHALL not display when starting the game

### Requirement 5

**User Story:** As a player, I want to access eye tracking calibration from the main menu, so that I can configure eye tracking before playing

#### Acceptance Criteria

1. WHEN the player clicks the "Eye Tracking Calibration" button, THE Eye Tracking Calibration Modal SHALL open
2. THE Eye Tracking Calibration Modal SHALL be implemented using shadcn dialog component
3. WHILE the Eye Tracking Calibration Modal is open, THE Main Menu Component SHALL remain visible in the background
4. THE Eye Tracking Calibration Modal SHALL contain placeholder content for future implementation

### Requirement 6

**User Story:** As a player, I want to view the leaderboard from the main menu, so that I can see player rankings

#### Acceptance Criteria

1. WHEN the player clicks the "Leaderboard" button, THE Leaderboard Modal SHALL open
2. THE Leaderboard Modal SHALL be implemented using shadcn dialog component
3. WHILE the Leaderboard Modal is open, THE Main Menu Component SHALL remain visible in the background
4. THE Leaderboard Modal SHALL contain placeholder content for future implementation

### Requirement 7

**User Story:** As a player, I want to see an intro sequence when starting the game, so that I understand the game context

#### Acceptance Criteria

1. THE Intro Modal SHALL be implemented using shadcn dialog component
2. WHEN the Intro Modal displays, THE Main Menu Component SHALL remain visible in the background
3. WHEN the player closes the Intro Modal, THE Main Menu Component SHALL become hidden
4. THE Intro Modal SHALL contain placeholder content for future implementation

### Requirement 8

**User Story:** As a developer, I want to use Zustand for global state management, so that component state can be shared without prop drilling

#### Acceptance Criteria

1. THE Global State Store SHALL manage the visibility state of the Main Menu Component
2. THE Global State Store SHALL manage the Skip Intro Preference state
3. THE Global State Store SHALL provide actions to toggle component visibility
4. THE Global State Store SHALL provide actions to update the Skip Intro Preference
5. THE SPA SHALL use the Global State Store to coordinate state between all components
