/**
 * Manual test file for character-by-character validation
 * This tests the new validateCharacter and handleSpaceOrEnter functionality
 */

import { useTypingGameStore } from '../store';

console.log('=== Testing Character-by-Character Validation ===\n');

// Get the store instance
const store = useTypingGameStore.getState();

// Initialize with challenges
console.log('Test 1: Loading challenges...');
store.loadChallenges();
const state1 = useTypingGameStore.getState();
console.log(`Loaded ${state1.challenges.length} challenges`);
console.log(`First word: "${state1.words[0]}"`);
console.log(`Current char index: ${state1.currentCharIndex}`);
console.log(`Has error: ${state1.hasError}\n`);

// Test 2: Type first character correctly
console.log('Test 2: Typing first character correctly...');
const firstWord = state1.words[0];
const firstChar = firstWord[0];
console.log(`Expected first character: "${firstChar}"`);
store.setInputValue(firstChar);
const state2 = useTypingGameStore.getState();
console.log(`Input value: "${state2.inputValue}"`);
console.log(`Current char index: ${state2.currentCharIndex}`);
console.log(`Has error: ${state2.hasError}`);
console.log(`Expected: char index = 1, hasError = false\n`);

// Test 3: Type second character correctly
console.log('Test 3: Typing second character correctly...');
const secondChar = firstWord[1];
console.log(`Expected second character: "${secondChar}"`);
store.setInputValue(firstChar + secondChar);
const state3 = useTypingGameStore.getState();
console.log(`Input value: "${state3.inputValue}"`);
console.log(`Current char index: ${state3.currentCharIndex}`);
console.log(`Has error: ${state3.hasError}`);
console.log(`Expected: char index = 2, hasError = false\n`);

// Test 4: Type incorrect character
console.log('Test 4: Typing incorrect character...');
const wrongChar = 'X';
console.log(`Typing wrong character: "${wrongChar}"`);
store.setInputValue(firstChar + secondChar + wrongChar);
const state4 = useTypingGameStore.getState();
console.log(`Input value: "${state4.inputValue}"`);
console.log(`Current char index: ${state4.currentCharIndex}`);
console.log(`Has error: ${state4.hasError}`);
console.log(`Expected: char index = 2 (unchanged), hasError = true\n`);

// Test 5: Clear input and restart
console.log('Test 5: Clearing input...');
store.setInputValue('');
const state5 = useTypingGameStore.getState();
console.log(`Input value: "${state5.inputValue}"`);
console.log(`Current char index: ${state5.currentCharIndex}`);
console.log(`Has error: ${state5.hasError}`);
console.log(`Expected: char index = 0, hasError = false\n`);

// Test 6: Type entire word correctly
console.log('Test 6: Typing entire word correctly...');
console.log(`Typing full word: "${firstWord}"`);
for (let i = 0; i < firstWord.length; i++) {
    const currentInput = firstWord.substring(0, i + 1);
    store.setInputValue(currentInput);
}
const state6 = useTypingGameStore.getState();
console.log(`Input value: "${state6.inputValue}"`);
console.log(`Current char index: ${state6.currentCharIndex}`);
console.log(`Has error: ${state6.hasError}`);
console.log(`Expected: char index = ${firstWord.length}, hasError = false\n`);

// Test 7: Press Space to advance to next word
console.log('Test 7: Pressing Space to advance to next word...');
const beforeWordIndex = state6.currentWordIndex;
store.handleSpaceOrEnter();
const state7 = useTypingGameStore.getState();
console.log(`Word index before: ${beforeWordIndex}`);
console.log(`Word index after: ${state7.currentWordIndex}`);
console.log(`Input value: "${state7.inputValue}"`);
console.log(`Current char index: ${state7.currentCharIndex}`);
console.log(`Completed words[0]: ${state7.completedWords[0]}`);
console.log(`Expected: word index = 1, char index = 0, input = "", completed[0] = true\n`);

// Test 8: Try to advance with incomplete word
console.log('Test 8: Trying to advance with incomplete word...');
const secondWord = state7.words[1];
console.log(`Second word: "${secondWord}"`);
console.log(`Typing only first character: "${secondWord[0]}"`);
store.setInputValue(secondWord[0]);
const beforeWordIndex8 = useTypingGameStore.getState().currentWordIndex;
store.handleSpaceOrEnter();
const state8 = useTypingGameStore.getState();
console.log(`Word index before: ${beforeWordIndex8}`);
console.log(`Word index after: ${state8.currentWordIndex}`);
console.log(`Expected: word index unchanged (still 1)\n`);

console.log('=== All Tests Complete ===');
