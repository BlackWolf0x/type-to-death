# Requirements Document

## Introduction

The Typing Game is a core gameplay component of "Type to Death" that challenges players to accurately type displayed text passages while managing the threat of an approaching monster. The game implements TypeRacer-style mechanics where players must type words sequentially, with visual feedback tracking their progress through the passage. The system automatically progresses through difficulty levels as players complete challenges, creating an escalating tension that complements the horror theme.

**Note:** The typing game component already exists at `app/src/typing-game/index.tsx` with a text container and input field. This spec focuses on implementing the typing mechanics, word-by-word validation, progress tracking, and challenge progression using the existing UI structure.

## Glossary

- **Typing Game**: The interactive text-based challenge component where players type displayed passages
- **Text Container**: The UI element that displays the passage to be typed with visual progress tracking
- **Input Field**: The text input element where players type their responses
- **Word**: A sequence of characters separated by whitespace in the passage
- **Progress Tracker**: Visual indicator showing which words have been successfully typed
- **Typing Challenge**: A single text passage with associated difficulty level
- **Challenge Data**: The collection of text passages stored in data.ts with difficulty classifications
- **Word Validation**: The process of comparing typed input against the current target word
- **Sequential Typing**: The requirement that words must be typed in order without skipping

## Requirements

### Requirement 1

**User Story:** As a player, I want to see the text passage I need to type displayed in the existing text container, so that I can read and type it accurately.

#### Acceptance Criteria

1. WHEN the typing game loads THEN the system SHALL display the current challenge text in the existing text container element
2. WHEN displaying challenge text THEN the system SHALL load text data from the data.ts file
3. WHEN displaying challenge text THEN the system SHALL replace the placeholder text with the actual challenge passage
4. WHEN displaying challenge text THEN the system SHALL render all words in a readable format with appropriate spacing
5. WHEN a challenge is active THEN the system SHALL maintain the text display until the challenge is completed or reset

### Requirement 2

**User Story:** As a player, I want to type words into the existing input field, so that I can respond to the typing challenge.

#### Acceptance Criteria

1. WHEN the typing game is active THEN the system SHALL use the existing input field for player typing
2. WHEN the input field receives focus THEN the system SHALL allow keyboard input without delay
3. WHEN a player types characters THEN the system SHALL display the typed characters in the input field in real-time
4. WHEN a player types characters THEN the system SHALL capture input events for validation
5. WHEN the game starts THEN the system SHALL maintain the existing auto-focus behavior on the input field

### Requirement 3

**User Story:** As a player, I want the input field to reset after I successfully type a word, so that I can continue typing the next word without manual clearing.

#### Acceptance Criteria

1. WHEN a player completes typing a word correctly THEN the system SHALL clear the input field immediately
2. WHEN the input field is cleared THEN the system SHALL maintain focus on the input field
3. WHEN the input field resets THEN the system SHALL prepare to accept input for the next word
4. WHEN clearing the input field THEN the system SHALL not introduce input delay or lag
5. WHEN a word is completed THEN the system SHALL reset the input field before processing the next character input

### Requirement 4

**User Story:** As a player, I want to see visual feedback showing which words I have already typed successfully, so that I can track my progress through the passage.

#### Acceptance Criteria

1. WHEN a player successfully types a word THEN the system SHALL visually mark that word as completed in the text container
2. WHEN displaying progress THEN the system SHALL differentiate between completed words, the current target word, and upcoming words using distinct visual styling
3. WHEN a word is marked as completed THEN the system SHALL advance the progress tracker to the next word
4. WHEN the text container updates THEN the system SHALL maintain the visual distinction between word states throughout the challenge
5. WHEN all words are completed THEN the system SHALL indicate challenge completion through visual feedback

### Requirement 5

**User Story:** As a player, I want the game to validate my typing word-by-word, so that I must type each word correctly before progressing to the next.

#### Acceptance Criteria

1. WHEN a player types in the input field THEN the system SHALL compare the input against the current target word
2. WHEN the typed input matches the current target word exactly THEN the system SHALL mark the word as complete and advance to the next word
3. WHEN the typed input does not match the current target word THEN the system SHALL keep the progress tracker on the same word
4. WHEN validating input THEN the system SHALL perform case-sensitive comparison
5. WHEN a word is validated THEN the system SHALL check for exact character-by-character match including punctuation

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

**User Story:** As a player, I want immediate visual feedback on my typing accuracy, so that I know whether I'm typing correctly.

#### Acceptance Criteria

1. WHEN a player types a character THEN the system SHALL provide visual feedback indicating correctness
2. WHEN the input matches the expected characters THEN the system SHALL display positive visual feedback
3. WHEN the input contains errors THEN the system SHALL display negative visual feedback
4. WHEN providing feedback THEN the system SHALL update in real-time as characters are typed
5. WHEN visual feedback is displayed THEN the system SHALL ensure it does not obstruct the text or input field

### Requirement 10

**User Story:** As a player, I want the typing interface to be responsive and performant, so that my typing experience is smooth and uninterrupted.

#### Acceptance Criteria

1. WHEN a player types at high speed THEN the system SHALL register all keystrokes without dropping input
2. WHEN updating visual feedback THEN the system SHALL render changes without perceptible lag
3. WHEN validating input THEN the system SHALL complete validation within 16ms to maintain 60fps responsiveness
4. WHEN the text container updates THEN the system SHALL use efficient rendering to prevent frame drops
5. WHEN handling input events THEN the system SHALL prioritize input processing to ensure typing feels immediate
