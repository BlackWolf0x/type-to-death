/**
 * Manual test file for store validateAndAdvance functionality
 * This tests the word validation and advancement logic
 */

import { useTypingGameStore } from '../store';

console.log('=== Testing Store validateAndAdvance ===\n');

// Get the store instance
const store = useTypingGameStore.getState();

// Test 1: Load challenges
console.log('Test 1: Loading challenges...');
store.loadChallenges();
const state1 = useTypingGameStore.getState();
console.log(`Challenges loaded: ${state1.challenges.length}`);
console.log(`Words in first challenge: ${state1.words.length}`);
console.log(`First word: "${state1.words[0]}"`);
console.log(`Current word index: ${state1.currentWordIndex}`);
console.log(`Pass: ${state1.words.length > 0 && state1.currentWordIndex === 0}\n`);

// Test 2: Set input value (incorrect)
console.log('Test 2: Setting incorrect input value...');
store.setInputValue('wrong');
const state2 = useTypingGameStore.getState();
console.log(`Input value: "${state2.inputValue}"`);
console.log(`Pass: ${state2.inputValue === 'wrong'}\n`);

// Test 3: Validate with incorrect input (should not advance)
console.log('Test 3: Validating with incorrect input...');
const beforeIndex = useTypingGameStore.getState().currentWordIndex;
store.validateAndAdvance();
const state3 = useTypingGameStore.getState();
console.log(`Current word index before: ${beforeIndex}`);
console.log(`Current word index after: ${state3.currentWordIndex}`);
console.log(`Input value after: "${state3.inputValue}"`);
console.log(`Pass: ${state3.currentWordIndex === beforeIndex && state3.inputValue === 'wrong'}\n`);

// Test 4: Set correct input value
console.log('Test 4: Setting correct input value...');
const currentWord = useTypingGameStore.getState().words[0];
console.log(`Current word to match: "${currentWord}"`);
store.setInputValue(currentWord);
const state4 = useTypingGameStore.getState();
console.log(`Input value: "${state4.inputValue}"`);
console.log(`Pass: ${state4.inputValue === currentWord}\n`);

// Test 5: Validate with correct input (should advance)
console.log('Test 5: Validating with correct input...');
const beforeIndex5 = useTypingGameStore.getState().currentWordIndex;
const beforeCompleted5 = useTypingGameStore.getState().completedWords[0];
store.validateAndAdvance();
const state5 = useTypingGameStore.getState();
console.log(`Current word index before: ${beforeIndex5}`);
console.log(`Current word index after: ${state5.currentWordIndex}`);
console.log(`Input value after: "${state5.inputValue}"`);
console.log(`First word completed: ${state5.completedWords[0]}`);
console.log(`Pass: ${state5.currentWordIndex === 1 && state5.inputValue === '' && state5.completedWords[0] === true}\n`);

// Test 6: Advance through multiple words
console.log('Test 6: Advancing through multiple words...');
const secondWord = state5.words[1];
console.log(`Second word to match: "${secondWord}"`);
store.setInputValue(secondWord);
store.validateAndAdvance();
const state6 = useTypingGameStore.getState();
console.log(`Current word index: ${state6.currentWordIndex}`);
console.log(`Input cleared: ${state6.inputValue === ''}`);
console.log(`Second word completed: ${state6.completedWords[1]}`);
console.log(`Pass: ${state6.currentWordIndex === 2 && state6.inputValue === '' && state6.completedWords[1] === true}\n`);

// Test 7: Check challenge completion detection (not complete yet)
console.log('Test 7: Testing challenge completion detection (mid-challenge)...');
console.log(`Total words: ${state6.words.length}`);
console.log(`Current word index: ${state6.currentWordIndex}`);
console.log(`Is challenge complete: ${state6.isChallengeComplete}`);
console.log(`Expected: false (not all words completed yet)`);
console.log(`Pass: ${state6.isChallengeComplete === false}\n`);

// Test 8: Complete all remaining words to test challenge completion
console.log('Test 8: Completing all remaining words...');
let currentState = useTypingGameStore.getState();
const totalWords = currentState.words.length;
console.log(`Starting from word index: ${currentState.currentWordIndex}`);
console.log(`Total words to complete: ${totalWords}`);

// Type all remaining words
for (let i = currentState.currentWordIndex; i < totalWords; i++) {
    const word = currentState.words[i];
    console.log(`  Typing word ${i + 1}/${totalWords}: "${word}"`);
    store.setInputValue(word);
    store.validateAndAdvance();
    currentState = useTypingGameStore.getState();
}

// Check final state
const finalState = useTypingGameStore.getState();
console.log(`\nFinal state:`);
console.log(`  Current word index: ${finalState.currentWordIndex}`);
console.log(`  Total words: ${finalState.words.length}`);
console.log(`  Is challenge complete: ${finalState.isChallengeComplete}`);
console.log(`  All words completed: ${finalState.completedWords.every(w => w)}`);
console.log(`  Input cleared: ${finalState.inputValue === ''}`);

const allWordsCompleted = finalState.completedWords.every(w => w);
const indexAtEnd = finalState.currentWordIndex === finalState.words.length;
const challengeMarkedComplete = finalState.isChallengeComplete === true;

console.log(`\nTest 8 Pass: ${allWordsCompleted && indexAtEnd && challengeMarkedComplete && finalState.inputValue === ''}`);

if (allWordsCompleted && indexAtEnd && challengeMarkedComplete) {
    console.log('✓ Challenge completion detection working correctly!');
} else {
    console.log('✗ Challenge completion detection has issues:');
    if (!allWordsCompleted) console.log('  - Not all words marked as completed');
    if (!indexAtEnd) console.log('  - Current word index not at end');
    if (!challengeMarkedComplete) console.log('  - isChallengeComplete not set to true');
}

console.log('\n=== All Store Tests Complete ===');
