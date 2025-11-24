# Implementation Plan

- [ ] 1. Create utility functions for word parsing and validation
  - Create `app/src/typing-game/utils/` directory
  - Create `wordParser.ts` with parseWords function (splits text by whitespace)
  - Create `validation.ts` with validateWord function (exact string comparison)
  - Create `validation.ts` with isInputCorrectSoFar function (checks if input matches start of target)
  - Test manually by importing and calling functions with sample text
  - _Requirements: 1.2, 5.4, 5.5_

- [ ] 2. Create basic Zustand store with initial state
  - Create `app/src/typing-game/store.ts`
  - Define TypingGameStore interface
  - Implement initial state (empty challenges, index 0, empty arrays)
  - Implement loadChallenges action (loads from data.ts, parses first challenge into words)
  - Test by adding console.log in loadChallenges to verify data loads
  - _Requirements: 1.2, 7.1, 7.2, 8.1_

- [ ] 3. Implement input value management in store
  - Add setInputValue action to store
  - Action should update inputValue state
  - Test by calling setInputValue from browser console and checking state
  - _Requirements: 2.3, 2.4_

- [ ] 4. Create simple TextDisplay component
  - Create `app/src/typing-game/components/` directory
  - Create `TextDisplay.tsx` component
  - Subscribe to words array from store
  - Render all words as plain text (no styling yet)
  - Test by seeing words display in the text container
  - _Requirements: 1.1, 1.3_

- [ ] 5. Update index.tsx to use TextDisplay
  - Import TextDisplay component
  - Replace hardcoded text with TextDisplay component
  - Call loadChallenges on component mount
  - Test by verifying first challenge text appears
  - _Requirements: 1.1, 2.1_

- [ ] 6. Create TypingInput component with basic functionality
  - Create `TypingInput.tsx` component
  - Subscribe to inputValue from store
  - Implement controlled input with onChange calling setInputValue
  - Maintain existing auto-focus behavior
  - Test by typing and seeing input value update
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 7. Update index.tsx to use TypingInput
  - Import TypingInput component
  - Replace existing Input with TypingInput component
  - Maintain existing styling and ref
  - Test by typing and verifying input works
  - _Requirements: 2.1_

- [ ] 8. Implement word validation logic in store
  - Add currentWordIndex to store state
  - Add validateAndAdvance action
  - Action compares inputValue with current word using validateWord
  - If match: increment currentWordIndex, clear inputValue
  - If no match: keep state unchanged
  - Test by typing correct word and seeing it advance
  - _Requirements: 3.1, 3.3, 5.1, 5.2, 5.3, 6.2_

- [ ] 9. Connect validation to TypingInput
  - Update TypingInput onChange to call validateAndAdvance after setInputValue
  - Test by typing words and seeing progress advance
  - _Requirements: 2.4, 5.1_

- [ ] 10. Add visual styling to TextDisplay for word states
  - Subscribe to currentWordIndex from store
  - Render each word with conditional styling:
    - Completed words (index < currentWordIndex): green text, opacity-70
    - Current word (index === currentWordIndex): bold, yellow background, highlighted
    - Upcoming words (index > currentWordIndex): default gray text
  - Test by typing and seeing words change color as you progress
  - _Requirements: 4.1, 4.2_

- [ ] 11. Implement challenge completion detection
  - Add isChallengeComplete computed state to store
  - Detect when currentWordIndex === words.length
  - Test by completing all words and checking state
  - _Requirements: 6.5_

- [ ] 12. Implement challenge progression
  - Add nextChallenge action to store
  - Action increments currentChallengeIndex
  - Loads next challenge text and parses into words
  - Resets currentWordIndex to 0 and inputValue to empty
  - Call nextChallenge automatically when isChallengeComplete is true
  - Test by completing a challenge and seeing next one load
  - _Requirements: 8.2, 8.3_

- [ ] 13. Handle end-of-challenges state
  - Add isAllComplete state (currentChallengeIndex >= challenges.length)
  - Display completion message when all challenges done
  - Test by completing all challenges
  - _Requirements: 8.4_

- [ ] 14. Add visual feedback for typing accuracy
  - Add isInputCorrect computed state to store (uses isInputCorrectSoFar)
  - Update TypingInput to show green border when correct, red when incorrect
  - Test by typing correct and incorrect characters
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 15. Add error handling for data loading
  - Wrap loadChallenges in try-catch
  - Handle empty challenges array
  - Provide fallback challenge if data fails to load
  - Test by temporarily breaking data.ts import
  - _Requirements: 7.5_

- [ ] 16. Final polish and optimization
  - Add useMemo for word parsing if needed
  - Ensure no input lag during typing
  - Test with all difficulty levels (easy, medium, hard)
  - Verify smooth transitions between challenges
  - _Requirements: 10.1, 10.2, 10.3_
