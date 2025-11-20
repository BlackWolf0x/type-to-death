# Project Vision: Type to Death

## Game Concept

**Type to Death** is a typing game that combines skill-building with horror-inspired gameplay mechanics. 
Players must improve their typing speed and accuracy while managing the threat of a monster using the "Weeping Angel" mechanic - the monster only moves when you're not looking at it.

## Core Gameplay Mechanic

**The Weeping Angel Mechanic:**
- A monster exists in the 3D scene that approaches the player
- The monster only moves when the player is NOT looking at it
- Players must balance their attention between:
  - Looking at the monster to keep it frozen
  - Looking at the typing text to complete typing challenges
- If the monster reaches a certain distance, it attacks and the game ends

**Eye Tracking Integration:**
- Uses webgazer.js to track player's eye gaze via webcam
- Eye gaze controls cursor position
- Webcam is required to play
- Creates tension between looking at the monster vs. the typing area

## Value Proposition

1. **Skill Development** - Improve typing speed and accuracy
2. **Engaging Learning** - Makes typing practice fun and thrilling
3. **Unique Mechanic** - Combines horror elements with educational gameplay
4. **Attention Management** - Trains multitasking and peripheral awareness

## Technical Architecture

### Unity (WebGL Build)

**Responsibilities:**
- Render the 3D scene with the monster
- Implement monster movement logic
- Raycast system to detect cursor position
- Monster behavior:
  - Freezes when cursor/gaze is on the monster
  - Moves toward camera when not being looked at
  - Attacks when reaching goal distance
- Game over state when monster reaches player
- Communication with React


**Key Systems:**
- Raycast detection for gaze tracking
- Monster AI and movement
- Distance-based threat system
- Attack/game over trigger

### React (Frontend UI)

**Responsibilities:**
- Main menu interface
- Typing game UI and text display
- All UI components (using shadcn/ui)
- Integration with webgazer.js for eye tracking
- Cursor position management from eye gaze
- Communication with Unity WebGL build

**Key Systems:**
- Eye tracking via webgazer.js
- Cursor position events sent to Unity
- Typing challenge system
- UI state management (Zustand)
- Menu navigation

## Integration Flow

1. **Eye Tracking → Cursor**: webgazer.js tracks eye gaze and moves cursor
2. **Cursor → Unity**: Cursor position automatically picked up by Unity
3. **Unity Raycast**: Unity checks if cursor is over monster
4. **Monster Behavior**: Monster freezes or moves based on raycast result
5. **Game State**: Unity communicates game over/score back to React

## Target Audience

- Players looking to improve typing skills
- Fans of horror/thriller games
- Educational gaming enthusiasts
- Players who enjoy unique game mechanics

## Project Context

- **Game Name**: Type to Death
- **Hackathon**: Kiroween
- **Development Timeline**: Hackathon project (fast iteration, MVP focus)

## Technical Requirements

- **Webcam**: Required for eye tracking
- **WebGL**: Unity build must run in browser
- **Modern Browser**: Support for webgazer.js and WebGL
- **Performance**: Smooth 3D rendering + eye tracking simultaneously

## Development Priorities

**Hackathon Focus - MVP First:**

1. **Core Mechanic First**: Get the monster freeze/move mechanic working
2. **Eye Tracking Integration**: Reliable cursor control from gaze
3. **Typing System**: Accurate typing detection and feedback
4. **Balance**: Find the right difficulty curve (monster speed, typing difficulty)
5. **Polish**: Visual feedback, sound design, UI refinement

**Development Approach:**
- Fast iteration and testing
- Focus on playable demo
- Core mechanic over features
- Polish what matters most for demo

## Key Features

### Phase 1 (Current Focus)
- Monster with Weeping Angel behavior
- Eye tracking cursor control
- Basic typing challenge
- Game over state
- Main menu

### Future Enhancements (To Be Detailed Later)
- Sound design and audio cues
- Multiple difficulty levels
- Different monster types or behaviors
- Typing statistics and progress tracking
- Scene variations
- Power-ups or defensive mechanics

## Technical Constraints

- **WebGL Performance**: Must maintain smooth framerate with 3D scene + eye tracking
- **Eye Tracking Accuracy**: webgazer.js calibration and reliability
- **Browser Compatibility**: Test across major browsers
- **Webcam Access**: Handle permissions and errors gracefully

## Success Metrics

- Players improve typing speed over time
- Engaging enough to replay multiple times
- Smooth integration between eye tracking and game mechanics
- Positive feedback on unique mechanic

## Design Philosophy

- **Tension Through Attention**: Core gameplay creates natural tension
- **Learn By Playing**: Typing improvement happens organically
- **Simple But Deep**: Easy to understand, hard to master
- **Accessible Horror**: Thrilling without being too scary

## Notes

- More details on scene design, sound, and additional features to come
- Focus on core mechanic stability before adding complexity
- Eye tracking calibration will be crucial for player experience
- Balance between typing difficulty and monster threat is key

