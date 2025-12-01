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

- [x] Improvement 5. Implement input backtracking and validation synchronization
  - Update store validation logic to validate entire input value against word prefix
  - Implement backtracking: if input doesn't match word prefix, move cursor back to last valid position
  - Support backspace key to move cursor backward and update validation state
  - Ensure input field value always matches the word characters up to current cursor position
  - Update currentCharIndex to reflect actual matching length, not just input length
  - Add visual feedback when input diverges from expected word
  - Test typing incorrect sequence (e.g., "Tl" in "The") and verify cursor backtracks
  - Test typing correct character after incorrect sequence and verify cursor advances correctly
  - Test backspace functionality to move cursor backward through completed characters
  - Verify green (completed) characters always match input field exactly

- [x] Improvement 6. Auto-complete challenge on last character
  - Update `setInputValue` in store to detect when typing the last character of the last word
  - When last word is fully typed (currentCharIndex === currentWord.length AND currentWordIndex === words.length - 1), automatically trigger completion
  - Set `isChallengeComplete` to true and mark last word as completed in `completedWords` array
  - Trigger `nextChallenge()` after delay (existing logic already handles this in `handleSpaceOrEnter`)
  - Note: Success message display and progression to next challenge already exist in TextDisplay and nextChallenge action
  - Test by typing the complete last word without pressing Space/Enter and verify automatic completion

- [x] Improvement 7. Allow natural typing with mistakes and backspace correction
  - Update `setInputValue` in store to allow any characters to be typed (remove automatic backtracking)
  - Allow input value to contain incorrect characters
  - Update validation logic to compare each character in input against target word character-by-character
  - Set `hasError` to true if ANY character in the input doesn't match the corresponding character in the target word
  - Update `currentCharIndex` to equal the length of the input (cursor follows input length, not matching length)
  - Keep error count increment to retrigger shake animation on new mistakes
  - Update TextDisplay to show red highlighting on incorrect characters (not just current character)
  - Ensure backspace functionality works naturally (removes last character, updates cursor position)
  - Prevent Space/Enter from advancing if input contains any errors (hasError is true)
  - Only allow word advancement when input exactly matches the target word
  - _Requirements: 5.1, 5.2, 5.3, 9.1, 9.2, 9.3_

- [x] Improvement 8. Fix 10-character error limit alert behavior
  - Update store's 10-character limit logic to only show alert when trying to exceed 10 characters (typing 11th character)
  - Change condition from `value.length >= 10` to `value.length > 10` to allow typing up to 10 characters
  - Remove redundant check for `value.length > state.inputValue.length` before showing alert
  - Allow users to backspace and retype up to 10 characters without retriggering the alert
  - Test by typing 10 error characters, backspacing, and retyping - verify alert only shows when attempting 11th character
  - _Requirements: 9.1, 9.2_

- [x] Improvement 9. Disallow paste in the input field
  - Add onPaste event handler to TypingInput component
  - Prevent default paste behavior to ensure users must type manually
  - Test by attempting to paste text and verify it's blocked
  - Ensure typing still works normally

- [x] Improvement 10. Replace alerts with Sonner toast notifications
  - Add Toaster component to the main app layout
  - Replace alert() for 10-character limit with toast.error()
  - Add toast.error() when user attempts to paste
  - Replace challenge completion message with toast.success()
  - Ensure toasts are positioned appropriately and don't interfere with gameplay
  - Test all toast notifications appear correctly


- [x] 21. Port typing game to Next.js project
  - Install zustand dependency in Next.js project (app-next)
  - Add shadcn input component with ref forwarding support
  - Create stores directory and port appStore.ts with Zustand state management
  - Create hooks directory and port useAutoFocus.ts hook
  - Create typing-game directory structure in app-next:
    - typing-game/data.ts - All typing challenges
    - typing-game/utils/wordParser.ts - Word parsing utility
    - typing-game/store.ts - Complete Zustand store with game logic
    - typing-game/components/TextDisplay.tsx - Text display with cursor and character coloring
    - typing-game/components/TypingInput.tsx - Input field with validation and event handling
    - typing-game/index.tsx - Main component that loads challenges and renders UI
  - Update play page to import TypingGame from @/typing-game
  - Remove old non-working TypingGame component from components/game
  - Configure TypeScript path aliases (@/stores, @/hooks, @/typing-game)
  - Test typing functionality works correctly in Next.js environment
  - Verify all features work: character-by-character typing, error highlighting, word progression, challenge completion
  - _Requirements: All requirements from original spec_
  - _Properties: All properties from original spec_


- [x] 22. Restructure data format to support story with chapters
  - Update data.ts to use new Story interface with title, introduction, and chapters array
  - Define Chapter interface (text, difficulty)
  - Define Story interface (title, introduction, chapters)
  - Replace flat typingChallenges array with structured story object
  - Add legacy typingChallenges export for backward compatibility
  - Update store.ts to use new story format:
    - Add storyTitle and storyIntroduction state
    - Rename challenges → chapters, currentChallengeIndex → currentChapterIndex
    - Rename isChallengeComplete → isChapterComplete, isAllComplete → isStoryComplete
    - Add totalChapters for progress tracking
    - Rename loadChallenges() → loadStory(), nextChallenge() → nextChapter()
  - Update index.tsx to call loadStory() instead of loadChallenges()
  - Update TextDisplay.tsx and TypingInput.tsx to use isStoryComplete instead of isAllComplete
  - Test that story loads correctly with new format
  - Verify all 12 chapters from "The Archivist's Descent" load and play correctly
  - _Requirements: 1.2, 7.1, 7.2, 8.1, 8.2, 8.3, 8.4_


- [x] 23. Implement typing game slide-up animation on game start
  - Added `isVisible` prop to TypingGame component
  - Updated TypingGame styling to start hidden off-screen (`-bottom-full`)
  - Added smooth slide-up transition (700ms ease-out) when `isVisible` becomes true
  - Updated Play Page to pass `gameStarted` state as `isVisible` prop
  - Typing game now slides up from bottom when Start button is clicked
  - _Requirements: 1.6, 1.7_

- [x] 24. Implement game statistics tracking
  - Create `app-next/stores/gameStatsStore.ts` with Zustand
  - Add elapsedTime, charactersTyped, and isTimerRunning state
  - Add startTimer, stopTimer, resetStats, tick, and addCharacters actions
  - Export formatTime helper for MM:SS formatting
  - Export calculateWPM helper for WPM calculation (characters / 5 / minutes)
  - Integrate timer with play page (start on game start, stop on win/lose, reset on restart)
  - Add timer tick effect with 1-second interval
  - Track characters typed in typing game store when words complete
  - Count word length + 1 for space on handleSpaceOrEnter
  - Count only word length (no space) for last word auto-complete
  - Display timer and WPM in typing game stats bar
  - Add Clock icon (blue) for timer display
  - Add Keyboard icon (purple) for WPM display
  - Display final time and WPM on game over overlay
  - Display final time and WPM on victory overlay
  - Format stats as "Time: MM:SS • XX WPM"
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10_

- [x] 25. Add accuracy tracking to game statistics
  - Update gameStatsStore to track totalKeystrokes and correctKeystrokes
  - Add recordKeystroke action that increments totalKeystrokes and conditionally increments correctKeystrokes
  - Export calculateAccuracy helper function (correctKeystrokes / totalKeystrokes * 100)
  - Integrate keystroke tracking in typing game store's setInputValue
  - Record keystroke when new character is typed (not on backspace)
  - Compare typed character against expected character to determine if correct
  - Display accuracy percentage in typing game stats bar
  - Reset keystroke counters when game restarts
  - _Requirements: 11.11, 11.12_
  - _Properties: P16_

- [x] 26. Add chapter progress indicator to typing game UI
  - Import BookOpen icon from lucide-react
  - Subscribe to currentChapterIndex and totalChapters from typing game store
  - Add chapter indicator component in stats bar (left side, before blink data)
  - Display format "Chapter X/Y" where X is currentChapterIndex + 1
  - Style with BookOpen icon (orange color) and black background
  - Show only when totalChapters > 0
  - Update in real-time as player progresses through chapters
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  - _Properties: P17_

## Estimated Effort

- Total Tasks: 26
- Completed: 26
- Status: ✅ Complete
