# Unity Monster - Requirements

## Overview

Implement a monster system for the Type to Death game where the monster teleports closer to the player with each blink, eventually triggering a game over sprint animation.

## Context

This is part of the Type to Death typing game where players must type while managing the threat of a monster. The monster uses blink detection (via Google MediaPipe in React) to advance toward the player, creating natural tension since blinking is involuntary.

## Acceptance Criteria

### AC1: Monster Spawning
**Given** the game starts  
**When** the monster is spawned  
**Then** the monster should be positioned at `startingDistance` units away from the camera  
**And** the monster's Y position should be 0 (ground level)

### AC2: Lives System
**Given** the game has started  
**When** the game initializes  
**Then** the player should have `lives` amount of lives (default: 5)  
**And** the lives count should be tracked and accessible

### AC3: Blink Teleportation
**Given** the player has more than 1 life remaining  
**When** the player blinks (blink event received from React)  
**Then** the player should lose 1 life  
**And** the monster should teleport closer to the camera by a calculated distance  
**And** the calculated distance should be: `(startingDistance - goalDistance) / (lives - 1)`  
**And** the monster's Y position should remain at 0  
**And** after `(lives - 1)` blinks, the monster should be at exactly `goalDistance`

### AC4: Final Blink Sprint Attack
**Given** the player has exactly 1 life remaining  
**And** the monster is already positioned at `goalDistance` from the camera  
**When** the player blinks for the final time  
**Then** the player should lose their last life  
**And** the monster should trigger the 'sprint' animation  
**And** the monster should move toward the camera at `sprintSpeed`  
**And** this is the ONLY time the monster is seen moving (not teleporting)

### AC5: Sprint Attack Animation
**Given** the sprint animation has been triggered  
**When** the animation plays  
**Then** the monster should move toward the camera at `sprintSpeed` units per second  
**And** the movement should continue until the monster reaches the camera  
**And** this represents the game over state

### AC6: Configurable Variables
**Given** the MonsterController script  
**When** viewed in the Unity Inspector  
**Then** the following variables should be configurable:
- `lives` (int, default: 5) - Number of blinks before game over
- `startingDistance` (float, default: 10) - Initial distance from camera
- `goalDistance` (float, default: 2) - Distance when sprint begins
- `sprintSpeed` (float, default: 5) - Speed of final sprint attack

### AC7: Testing Mode (Unity Editor Only)
**Given** the game is running in Unity Editor  
**When** the player presses the Spacebar key  
**Then** it should simulate a blink event  
**And** call the same OnBlinkDetected() method  
**And** this should only work in the Unity Editor, not in WebGL builds

## Non-Functional Requirements

### NFR1: Performance
The teleportation should be instantaneous with no noticeable lag or frame drops.

### NFR2: Visual Smoothness
The sprint animation should be smooth and not jittery, maintaining consistent speed.

### NFR3: Unity 6.1 Compatibility
All code must be compatible with Unity 6.1 LTS.

## Constraints

- Monster must always stay at Y = 0 (ground level)
- Teleportation distance is calculated as: `(startingDistance - goalDistance) / (lives - 1)`
- Monster reaches goalDistance after `(lives - 1)` blinks
- Sprint only triggers on the final blink (when lives reaches 0)
- Monster only moves visibly during sprint - all other movement is instant teleportation
- Communication with React happens via JavaScript interop for blink events

## Dependencies

- Unity 6.1 project setup
- Camera reference in the scene
- Monster GameObject with Animator component
- 'sprint' animation clip configured in Animator
- React integration for blink event communication

## Success Metrics

- Monster spawns at correct distance
- Each blink reduces lives and teleports monster by correct amount
- Final blink triggers sprint at goal distance
- No visual glitches or positioning errors
- Smooth sprint animation to camera

## Out of Scope

- Blink detection implementation (handled by React/MediaPipe)
- UI display of lives count (handled by React)
- Sound effects
- Multiple monster types
- Difficulty levels
- Monster visual effects or particles
