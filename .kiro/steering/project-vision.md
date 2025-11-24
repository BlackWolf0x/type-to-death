# Project Vision: Type to Death

## Game Concept

**Type to Death** is a typing game that combines skill-building with horror-inspired gameplay mechanics. 
Players must improve their typing speed and accuracy while managing the threat of a monster that teleports closer every time they blink.

## Core Gameplay Mechanic

**The Blink Mechanic:**
- A monster exists in the 3D scene at a distance from the player
- The monster teleports closer to the player every time they blink
- Players must balance:
  - Keeping their eyes open to prevent the monster from advancing
  - Blinking naturally while typing (creating natural tension)
  - Completing typing challenges accurately and quickly
- If the monster reaches a certain distance, it attacks and the game ends

**Blink Tracking Integration:**
- Uses Google MediaPipe to detect player blinks via webcam
- Webcam is required to play
- Creates natural tension - players must blink, but each blink brings danger closer
- Typing while trying to minimize blinking adds challenge

## Value Proposition

1. **Skill Development** - Improve typing speed and accuracy
2. **Engaging Learning** - Makes typing practice fun and thrilling
3. **Unique Mechanic** - Combines horror elements with educational gameplay using natural blink detection
4. **Natural Tension** - Creates organic stress through an unavoidable human reflex (blinking)

## Technical Architecture

### Unity (WebGL Build)

**Responsibilities:**
- Render the 3D scene with the monster
- Implement monster teleportation logic
- Monster behavior:
  - Teleports closer to player on blink events
  - Remains stationary between blinks
  - Attacks when reaching minimum distance threshold
- Game over state when monster reaches player
- Communication with React to receive blink events

**Key Systems:**
- Blink event handling from React
- Monster teleportation and positioning
- Distance-based threat system
- Attack/game over trigger

### React (Frontend UI)

**Responsibilities:**
- Main menu interface
- Typing game UI and text display
- All UI components (using shadcn/ui)
- Integration with Google MediaPipe for blink detection
- Blink event detection and communication
- Communication with Unity WebGL build

**Key Systems:**
- Blink detection via Google MediaPipe
- Blink events sent to Unity
- Typing challenge system
- UI state management (Zustand)
- Menu navigation
- Webcam access and MediaPipe initialization

## Integration Flow

1. **Webcam → MediaPipe**: Google MediaPipe processes webcam feed for facial landmarks
2. **Blink Detection**: MediaPipe detects when player blinks
3. **React → Unity**: Blink event sent to Unity via JavaScript interop
4. **Monster Behavior**: Monster teleports closer to player on each blink
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

- **Webcam**: Required for blink detection
- **WebGL**: Unity build must run in browser
- **Modern Browser**: Support for MediaPipe and WebGL
- **Performance**: Smooth 3D rendering + blink detection simultaneously

## Development Priorities

**Hackathon Focus - MVP First:**

1. **Core Mechanic First**: Get the monster teleportation on blink working
2. **Blink Detection Integration**: Reliable blink detection via MediaPipe
3. **Typing System**: Accurate typing detection and feedback
4. **Balance**: Find the right difficulty curve (teleport distance per blink, typing difficulty)
5. **Polish**: Visual feedback, sound design, UI refinement

**Development Approach:**
- Fast iteration and testing
- Focus on playable demo
- Core mechanic over features
- Polish what matters most for demo

## Key Features

### Phase 1 (Current Focus)
- Monster with blink-triggered teleportation
- Blink detection via Google MediaPipe
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

- **WebGL Performance**: Must maintain smooth framerate with 3D scene + blink detection
- **Blink Detection Accuracy**: MediaPipe reliability and false positive prevention
- **Browser Compatibility**: Test across major browsers
- **Webcam Access**: Handle permissions and errors gracefully
- **Blink Sensitivity**: Balance between detecting real blinks and ignoring noise

## Success Metrics

- Players improve typing speed over time
- Engaging enough to replay multiple times
- Smooth integration between blink detection and game mechanics
- Positive feedback on unique mechanic
- Natural tension created by unavoidable blinking

## Design Philosophy

- **Tension Through Biology**: Core gameplay creates natural tension through unavoidable blinking
- **Learn By Playing**: Typing improvement happens organically
- **Simple But Deep**: Easy to understand, hard to master
- **Accessible Horror**: Thrilling without being too scary
- **Natural Mechanics**: Uses involuntary human behavior as core mechanic

## Notes

- More details on scene design, sound, and additional features to come
- Focus on core mechanic stability before adding complexity
- Blink detection sensitivity and false positive prevention will be crucial
- Balance between typing difficulty, blink frequency, and teleport distance is key
- Consider adding visual feedback when blinks are detected
- May need to tune teleport distance based on average human blink rate (~15-20 blinks/minute)

