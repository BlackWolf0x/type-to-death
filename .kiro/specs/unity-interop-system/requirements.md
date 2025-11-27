# Unity Interop System - Requirements

## Introduction

The Unity Interop System enables communication between Unity WebGL and React using the react-unity-webgl event system. It provides JavaScript interop functions that dispatch events to React.

## Context

The game needs to communicate with React to notify when Unity is ready and when the game ends. This uses JavaScript library files (.jslib) and DllImport to call JavaScript functions from C#.

## Glossary

- **jslib**: JavaScript library file for Unity WebGL interop
- **DllImport**: C# attribute to import external functions
- **dispatchReactUnityEvent**: react-unity-webgl function to send events to React
- **WebGL Build**: Unity build target for web browsers

## Requirements

### Requirement 1: JavaScript Interop Library

**User Story:** As a developer, I want a jslib file, so that Unity can call JavaScript functions.

#### Acceptance Criteria

1. THE system SHALL provide a React.jslib file
2. THE file SHALL be located in Assets/Plugins/WebGL/
3. THE file SHALL use mergeInto(LibraryManager.library, {})
4. THE file SHALL define JavaScript functions that call window.dispatchReactUnityEvent

### Requirement 2: GameIsReady Event

**User Story:** As React, I want to know when Unity is ready, so that I can show the game.

#### Acceptance Criteria

1. THE React.jslib SHALL define a GameIsReady function
2. THE function SHALL call window.dispatchReactUnityEvent("GameIsReady")
3. THE system SHALL provide a MainMenuManager script
4. THE MainMenuManager SHALL call GameIsReady() in Start()
5. THE call SHALL only execute in WebGL builds (not in Editor)

### Requirement 3: GameLost Event

**User Story:** As React, I want to know when the game ends, so that I can show game over UI.

#### Acceptance Criteria

1. THE React.jslib SHALL define a GameLost function
2. THE function SHALL call window.dispatchReactUnityEvent("GameLost")
3. THE GameManager SHALL call GameLost() in GameOverSequence()
4. THE call SHALL only execute in WebGL builds (not in Editor)
5. THE call SHALL happen after the black screen activates

### Requirement 4: WebGL Build Conditional Compilation

**User Story:** As a developer, I want interop calls to only run in WebGL builds, so that the Editor doesn't error.

#### Acceptance Criteria

1. ALL DllImport calls SHALL use #if UNITY_WEBGL && !UNITY_EDITOR
2. THE conditional SHALL prevent calls in Unity Editor
3. THE conditional SHALL allow calls in WebGL builds
4. THE code SHALL compile without errors in Editor

## Non-Functional Requirements

### NFR1: Compatibility
- Must work with react-unity-webgl library
- Must work in Unity 6.1 WebGL builds
- Must not cause errors in Unity Editor

### NFR2: Simplicity
- Simple event dispatch (no parameters for these events)
- Clear function names
- Minimal code

## Constraints

- Must use .jslib files in Assets/Plugins/WebGL/
- Must use DllImport with "__Internal"
- Must use conditional compilation for WebGL
- Events have no parameters (simple notifications)

## Dependencies

- Unity 6.1 WebGL build target
- react-unity-webgl library (React side)
- GameManager script (existing)

## Success Metrics

- GameIsReady event fires when Unity loads
- GameLost event fires on game over
- No errors in Unity Editor
- Events received by React in WebGL build

## Out of Scope

- Events with parameters
- React to Unity communication
- Other game events
- Error handling
- Event queuing
- Multiple event listeners
