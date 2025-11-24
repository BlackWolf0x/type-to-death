# Implementation Plan

- [x] 1. Create utility functions for word parsing and validation
  - Create `app/src/typing-game/utils/` directory
  - Create `wordParser.ts` with parseWords function (splits text by whitespace)
  - Create `validation.ts` with validateWord function (exact string comparison)
  - Create `validation.ts` with isInputCorrectSoFar function (checks if input matches start of target)
  - Test manually by importing and calling functions with sample text
  - _Requirements: 1.2, 5.4, 5.5_

- [x] 2. Create basic Zustand store with initial state
  - Create `app/src/typing-game/store.ts`
  - Define TypingGameStore interface
  - Implement initial state (empty challenges, index 0, empty arrays)
  - Implement loadChallenges action (loads from data.ts, parses first challenge into words)
  - Test by adding console.log in loadChallenges to verify data loads
  - _Requirements: 1.2, 7.1, 7.2, 8.1_

- [x] 3. Implement input value management in store
  - Add setInputValue action to store
  - Action should update inputValue state
  - Test by calling setInputValue from browser console and checking state
  - _Requirements: 2.3, 2.4_

- [x] 4. Create simple TextDisplay component
  - Create `app/src/typing-game/components/` directory
  - Create `TextDisplay.tsx` component
  - Subscribe to words array from store
  - Render all words as plain text (no styling yet)
  - Test by seeing words display in the text container
  - _Requirements: 1.1, 1.3_

- [x] 5. Update index.tsx to use TextDisplay
  - Import TextDisplay component
  - Replace hardcoded text with TextDisplay component
  - Call loadChallenges on component mount
  - Test by verifying first challenge text appears
  - _Requirements: 1.1, 2.1_

- [x] 6. Create TypingInput component with basic functionality
  - Create `TypingInput.tsx` component
  - Subscribe to inputValue from store
  - Implement controlled input with onChange calling setInputValue
  - Maintain existing auto-focus behavior
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 7. Update index.tsx to use TypingInput
  - Import TypingInput component
  - Replace existing Input with TypingInput component
  - Maintain existing styling and ref
  - Test by typing and verifying input works
  - _Requirements: 2.1_

- [x] 8. Implement word validation logic in store
  - Add currentWordIndex to store state
  - Add validateAndAdvance action
  - Action compares inputValue with current word using validateWord
  - If match: increment currentWordIndex, clear inputValue
  - If no match: keep state unchanged
  - Test by typing correct word and seeing it advance
  - _Requirements: 3.1, 3.3, 5.1, 5.2, 5.3, 6.2_

- [x] 9. Connect validation to TypingInput
  - Update TypingInput onChange to call validateAndAdvance after setInputValue
  - Test by typing words and seeing progress advance
  - _Requirements: 2.4, 5.1_

- [x] 10. Add visual styling to TextDisplay for word states
  - Subscribe to currentWordIndex from store
  - Render each word with conditional styling:
  - Completed words (index < currentWordIndex): green text, opacity-70
  - Current word (index === currentWordIndex): bold, yellow background, highlighted
  - Upcoming words (index > currentWordIndex): default gray text
  - Test by typing and seeing words change color as you progress
  - _Requirements: 4.1, 4.2_

- [x] 11. Implement challenge completion detection
  - Add isChallengeComplete computed state to store
  - Detect when currentWordIndex === words.length
  - Test by completing all words and checking state
  - _Requirements: 6.5_

- [x] 12. Implement challenge progression
  - Add nextChallenge action to store
  - Action increments currentChallengeIndex
  - Loads next challenge text and parses into words
  - Resets currentWordIndex to 0 and inputValue to empty
  - Call nextChallenge automatically when isChallengeComplete is true
  - _Requirements: 8.2, 8.3_

- [x] 13. Handle end-of-challenges state
  - Add isAllComplete state (currentChallengeIndex >= challenges.length)
  - Display completion message when all challenges done
  - _Requirements: 8.4_

- [x] 14. Refactor store to support character-by-character typing
  - Add currentCharIndex to store state (tracks position within current word)
  - Add hasError boolean state to track typing errors
  - Remove validateAndAdvance action
  - Add validateCharacter action (validates single character at currentCharIndex)
  - Add handleSpaceOrEnter action (advances to next word when Space pressed, completes challenge when Enter pressed on last word)
  - Update setInputValue to call validateCharacter on each change
  - Test by typing characters and verifying cursor advances only on correct input
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 15. Implement character cursor visual in TextDisplay
  - Update TextDisplay to render character-by-character instead of word-by-word
  - For current word, split into characters and render each with conditional styling:
    - Characters before currentCharIndex: green (completed)
    - Character at currentCharIndex: show cursor (|) before it and underline it
    - Characters after currentCharIndex: default gray
  - Completed words: all green
  - Upcoming words: default gray
  - Test by typing and seeing cursor move character by character
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 16. Add error feedback to TypingInput
  - Subscribe to hasError state from store
  - When hasError is true, apply red border styling (border-red-500)
  - Add shake animation using Tailwind animate-shake or custom CSS keyframes
  - When hasError is false, use normal border styling
  - Test by typing incorrect character and seeing red border + shake
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 17. Implement Space/Enter key handling in TypingInput
  - Add onKeyDown handler to TypingInput
  - When Space is pressed and current word is fully typed (currentCharIndex === currentWord.length), call handleSpaceOrEnter
  - When Enter is pressed and on last word and word is fully typed, call handleSpaceOrEnter
  - Prevent default Space/Enter behavior to avoid adding space to input
  - Test by typing word completely and pressing Space to advance
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 18. Add character validation utility function
  - Update validation.ts with validateCharacter function (compares single character)
  - Function should perform case-sensitive comparison
  - Test by calling function with various character pairs
  - _Requirements: 5.4, 5.5_

- [x] 19. Add error handling for data loading
  - Wrap loadChallenges in try-catch
  - Handle empty challenges array
  - Provide fallback challenge if data fails to load
  - _Requirements: 7.5_

- [x] 20. Final polish and optimization
  - Add useMemo for character splitting if needed
  - Ensure no input lag during typing
  - Test with all difficulty levels (easy, medium, hard)
  - Verify smooth transitions between challenges
  - Test error feedback triggers correctly on mistakes
  - Verify cursor positioning is accurate
  - _Requirements: 10.1, 10.2, 10.3_

- [x] Improvement 1. Fix cursor positioning and error highlighting
  - Update TextDisplay.tsx cursor rendering to use absolute/relative positioning
  - Make cursor float above/beside the character instead of inline
  - Add smooth CSS transition for cursor movement
  - Add red background highlight to current character when hasError is true
  - Ensure cursor doesn't cause text layout shifts as it moves
  - Test cursor movement through all character types (letters, punctuation, spaces)
  - Verify text remains stable and doesn't jump as cursor moves
  - Verify red highlight appears on incorrect character
  - Make cursor float above/beside the character instead of inline
  - Ensure cursor doesn't cause text layout shifts as it moves
  - Test cursor movement through all character types (letters, punctuation, spaces)
  - Verify text remains stable and doesn't jump as cursor moves

- [x] Improvement 2. Enhance cursor visibility and word underline
  - Change cursor color from yellow to black for better visibility
  - Increase cursor height to make it more prominent
  - Add letter spacing (tracking-wide) to the text container for better cursor visibility
  - Update current word styling to underline the entire word, not just the current character
  - Maintain smooth transitions and animations
  - Test cursor visibility across different backgrounds
  - Verify whole word underline appears correctly
  - Ensure letter spacing improves readability without affecting layout

- [x] Improvement 3. Refine cursor thickness, shake animation, and underline behavior
  - Reduce cursor thickness by decreasing font-weight or using a thinner character
  - Fix shake animation to retrigger on repeated errors by using a key-based animation reset
  - Update underline to only apply to word characters, not trailing spaces
  - Test cursor appears thinner and more elegant
  - Verify shake animation triggers every time an incorrect character is typed
  - Confirm underline only appears under the word itself, not spaces after it

- [x] Improvement 4. Fix cursor positioning, underline coverage, and add smooth cursor animation
  - Adjust cursor position to be slightly more to the left to avoid overlapping text
  - Extend underline to cover the entire current word including all characters
  - Add smooth CSS transition animation when cursor moves between characters
  - Test cursor appears clearly separated from text without overlap
  - Verify underline spans the complete word from first to last character
  - Confirm cursor movement has smooth animation between positions
