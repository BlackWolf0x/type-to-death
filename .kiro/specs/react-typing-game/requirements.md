# Requirements Document

## Introduction

The Typing Game is a core gameplay component of "Type to Death" that challenges players to accurately type displayed text passages while managing the threat of an approaching monster. The game implements character-by-character typing mechanics with a visual cursor that moves through each word as the player types. Players must type each character correctly and press Space (or Enter for the last word) to advance to the next word. The system provides immediate visual feedback for errors and automatically progresses through difficulty levels as players complete challenges, creating an escalating tension that complements the horror theme.

**Note:** The typing game component already exists at `app/src/typing-game/index.tsx` with a text container and input field. This spec focuses on implementing the character-by-character typing mechanics, real-time validation, cursor-based progress tracking, and challenge progression using the existing UI structure.

## Glossary

- **Typing Game**: The interactive text-based challenge component where players type displayed passages character-by-character
- **Text Container**: The UI element that displays the passage to be typed with visual progress tracking
- **Input Field**: The text input element where players type their responses
- **Word**: A sequence of characters separated by whitespace in the passage
- **Character Cursor**: A visual insertion cursor (|) that indicates the current character position being typed
- **Current Character**: The specific character in the current word that the player needs to type next
- **Typing Challenge**: A single text passage with associated difficulty level
- **Challenge Data**: The collection of text passages stored in data.ts with difficulty classifications
- **Character Validation**: The process of comparing each typed character against the expected character in real-time
- **Sequential Typing**: The requirement that characters and words must be typed in order without skipping
- **Word Completion**: The action of pressing Space (or Enter for the last word) after correctly typing all characters in a word

## Requirements

### Requirement 1

**User Story:** As a player, I want to see the text passage I need to type displayed in the existing text container, so that I can read and type it accurately.

#### Acceptance Criteria

1. WHEN the typing game loads THEN the system SHALL display the current challenge text in the existing text container element
2. WHEN displaying challenge text THEN the system SHALL load text data from the data.ts file
3. WHEN displaying challenge text THEN the system SHALL replace the placeholder text with the actual challenge passage
4. WHEN displaying challenge text THEN the system SHALL render all words in a readable format with appropriate spacing
5. WHEN a challenge is active THEN the system SHALL maintain the text display until the challenge is completed or reset
6. WHEN the game has not started THEN the typing game UI SHALL be hidden off-screen
7. WHEN the game starts THEN the typing game UI SHALL slide up into view with a smooth animation

### Requirement 2

**User Story:** As a player, I want to type words into the existing input field, so that I can respond to the typing challenge.

#### Acceptance Criteria

1. WHEN the typing game is active THEN the system SHALL use the existing input field for player typing
2. WHEN the input field receives focus THEN the system SHALL allow keyboard input without delay
3. WHEN a player types characters THEN the system SHALL display the typed characters in the input field in real-time
4. WHEN a player types characters THEN the system SHALL capture input events for validation
5. WHEN the game starts THEN the system SHALL maintain the existing auto-focus behavior on the input field

### Requirement 3

**User Story:** As a player, I want to press Space to advance to the next word after typing it correctly, so that I have explicit control over word progression.

#### Acceptance Criteria

1. WHEN a player types all characters of a word correctly and presses Space THEN the system SHALL advance to the next word and clear the input field
2. WHEN a player is on the last word and types all characters correctly and presses Enter THEN the system SHALL complete the challenge
3. WHEN the input field is cleared THEN the system SHALL maintain focus on the input field
4. WHEN a player presses Space before completing all characters THEN the system SHALL not advance to the next word
5. WHEN a player presses Space after typing a word incorrectly THEN the system SHALL not advance to the next word

### Requirement 4

**User Story:** As a player, I want to see a character cursor that moves through each word as I type, so that I can track my exact position in the current word.

#### Acceptance Criteria

1. WHEN a player types a character correctly THEN the system SHALL move the character cursor to the next character position
2. WHEN displaying the cursor THEN the system SHALL show a vertical bar (|) before the current character being typed
3. WHEN the cursor is on a character THEN the system SHALL underline that character to indicate it is the active typing position
4. WHEN a player completes a word THEN the system SHALL show completed characters in green and move the cursor to the first character of the next word
5. WHEN all words are completed THEN the system SHALL indicate challenge completion through visual feedback

### Requirement 5

**User Story:** As a player, I want the game to validate my typing character-by-character in real-time, so that I receive immediate feedback on typing accuracy.

#### Acceptance Criteria

1. WHEN a player types a character THEN the system SHALL compare it against the expected character at the current cursor position
2. WHEN the typed character matches the expected character THEN the system SHALL advance the cursor to the next character
3. WHEN the typed character does not match the expected character THEN the system SHALL display error feedback while allowing the character to be typed
4. WHEN validating characters THEN the system SHALL perform case-sensitive comparison
5. WHEN validating characters THEN the system SHALL check for exact match including punctuation and special characters

**Note (Improvement 7):** The system allows natural typing where users can make mistakes and use backspace to correct them. Error feedback is provided visually, but input is not blocked or automatically corrected.

### Requirement 6

**User Story:** As a player, I want to type words in sequential order without skipping, so that the game maintains proper challenge progression.

#### Acceptance Criteria

1. WHEN a player begins typing THEN the system SHALL set the first word as the current target word
2. WHEN a player completes a word THEN the system SHALL advance to the next sequential word in the passage
3. WHEN validating input THEN the system SHALL only accept input matching the current target word
4. WHEN a player attempts to skip ahead THEN the system SHALL prevent progression until the current word is typed correctly
5. WHEN the last word is completed THEN the system SHALL recognize the challenge as finished

### Requirement 7

**User Story:** As a player, I want the game to automatically load challenges from the data file, so that I have a variety of texts to type.

#### Acceptance Criteria

1. WHEN the typing game initializes THEN the system SHALL load all typing challenges from the data.ts file
2. WHEN loading challenges THEN the system SHALL parse the text and difficulty properties for each challenge
3. WHEN challenges are loaded THEN the system SHALL make them available for selection and display
4. WHEN the data file is updated THEN the system SHALL reflect changes upon game reload
5. WHEN loading fails THEN the system SHALL handle errors gracefully and provide fallback content or error messaging

### Requirement 8

**User Story:** As a player, I want the game to automatically progress through difficulty levels, so that the challenge increases as I improve.

#### Acceptance Criteria

1. WHEN the typing game starts THEN the system SHALL begin with the first challenge in the data set
2. WHEN a player completes a challenge THEN the system SHALL automatically load the next challenge in sequence
3. WHEN progressing through challenges THEN the system SHALL follow the order defined in the data.ts file
4. WHEN all challenges are completed THEN the system SHALL handle the end-of-challenges state appropriately
5. WHEN difficulty increases THEN the system SHALL transition smoothly between challenges without requiring manual selection

### Requirement 9

**User Story:** As a player, I want immediate visual feedback when I make a typing error, so that I know to correct my mistake.

#### Acceptance Criteria

1. WHEN a player types an incorrect character THEN the system SHALL display the input field with a red border to indicate an error
2. WHEN a player types an incorrect character THEN the system SHALL apply a shake animation to the input field
3. WHEN a player types an incorrect character THEN the system SHALL allow the character to be typed and display it in the input field
4. WHEN a player uses backspace THEN the system SHALL remove the last character and update error state accordingly
5. WHEN the input is correct THEN the system SHALL display the input field with normal styling

**Note (Improvement 7):** Users can type incorrect characters and use backspace to correct them naturally, rather than being blocked from typing mistakes.

### Requirement 10

**User Story:** As a player, I want the typing interface to be responsive and performant, so that my typing experience is smooth and uninterrupted.

#### Acceptance Criteria

1. WHEN a player types at high speed THEN the system SHALL register all keystrokes without dropping input
2. WHEN updating visual feedback THEN the system SHALL render changes without perceptible lag
3. WHEN validating input THEN the system SHALL complete validation within 16ms to maintain 60fps responsiveness
4. WHEN the text container updates THEN the system SHALL use efficient rendering to prevent frame drops
5. WHEN handling input events THEN the system SHALL prioritize input processing to ensure typing feels immediate

### Requirement 11: Game Statistics Tracking

**User Story:** As a player, I want to see my typing performance statistics, so that I can track my progress and improve my skills.

#### Acceptance Criteria

1. WHEN the game starts THEN the timer SHALL start from 0 seconds
2. WHEN the game is active THEN the timer SHALL increment by 1 every second
3. WHEN the game ends (win or lose) THEN the timer SHALL stop
4. WHEN the game restarts THEN the timer SHALL reset to 0
5. THE timer SHALL display in MM:SS format in the typing game UI
6. WHEN a word is completed THEN the system SHALL count characters typed (word length + 1 for space)
7. WHEN the last word is completed THEN the system SHALL count only the word length (no space)
8. THE WPM SHALL be calculated as (characters typed / 5) / minutes elapsed
9. THE WPM SHALL display in real-time in the typing game UI
10. THE final time and WPM SHALL display on both win and lose overlays
11. THE accuracy SHALL be calculated as (correct keystrokes / total keystrokes) * 100
12. THE accuracy SHALL display in real-time in the typing game UI as a percentage

### Requirement 12: Chapter Progress Display

**User Story:** As a player, I want to see which chapter I'm currently on, so that I can track my progress through the story.

#### Acceptance Criteria

1. WHEN the typing game is visible THEN the system SHALL display the current chapter number
2. WHEN displaying chapter progress THEN the system SHALL show the format "Chapter X/Y" where X is current chapter and Y is total chapters
3. THE chapter indicator SHALL use the currentChapterIndex from the store (adding 1 for display since it's 0-indexed)
4. THE chapter indicator SHALL use the totalChapters from the store
5. THE chapter indicator SHALL update in real-time as the player progresses through chapters
6. THE chapter indicator SHALL be positioned in the stats bar next to other game statistics
