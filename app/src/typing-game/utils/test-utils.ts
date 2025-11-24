/**
 * Manual test file for utility functions
 * Run this file to verify word parsing and validation work correctly
 */

import { parseWords } from './wordParser';
import { validateWord, isInputCorrectSoFar } from './validation';

console.log('=== Testing Word Parser ===');

// Test 1: Basic text splitting
const text1 = "Hello world test";
const words1 = parseWords(text1);
console.log(`Input: "${text1}"`);
console.log(`Output:`, words1);
console.log(`Expected: ["Hello", "world", "test"]`);
console.log(`Pass: ${JSON.stringify(words1) === JSON.stringify(["Hello", "world", "test"])}\n`);

// Test 2: Multiple spaces
const text2 = "Hello    world   test";
const words2 = parseWords(text2);
console.log(`Input: "${text2}"`);
console.log(`Output:`, words2);
console.log(`Expected: ["Hello", "world", "test"]`);
console.log(`Pass: ${JSON.stringify(words2) === JSON.stringify(["Hello", "world", "test"])}\n`);

// Test 3: Punctuation preservation
const text3 = "Hello, world! How are you?";
const words3 = parseWords(text3);
console.log(`Input: "${text3}"`);
console.log(`Output:`, words3);
console.log(`Expected: ["Hello,", "world!", "How", "are", "you?"]`);
console.log(`Pass: ${JSON.stringify(words3) === JSON.stringify(["Hello,", "world!", "How", "are", "you?"])}\n`);

console.log('=== Testing Word Validation ===');

// Test 4: Exact match
console.log(`validateWord("hello", "hello"): ${validateWord("hello", "hello")}`);
console.log(`Expected: true`);
console.log(`Pass: ${validateWord("hello", "hello") === true}\n`);

// Test 5: Case sensitivity
console.log(`validateWord("Hello", "hello"): ${validateWord("Hello", "hello")}`);
console.log(`Expected: false`);
console.log(`Pass: ${validateWord("Hello", "hello") === false}\n`);

// Test 6: Punctuation matching
console.log(`validateWord("hello", "hello!"): ${validateWord("hello", "hello!")}`);
console.log(`Expected: false`);
console.log(`Pass: ${validateWord("hello", "hello!") === false}\n`);

console.log('=== Testing Partial Input Validation ===');

// Test 7: Correct partial input
console.log(`isInputCorrectSoFar("hel", "hello"): ${isInputCorrectSoFar("hel", "hello")}`);
console.log(`Expected: true`);
console.log(`Pass: ${isInputCorrectSoFar("hel", "hello") === true}\n`);

// Test 8: Incorrect partial input
console.log(`isInputCorrectSoFar("heo", "hello"): ${isInputCorrectSoFar("heo", "hello")}`);
console.log(`Expected: false`);
console.log(`Pass: ${isInputCorrectSoFar("heo", "hello") === false}\n`);

// Test 9: Empty input
console.log(`isInputCorrectSoFar("", "hello"): ${isInputCorrectSoFar("", "hello")}`);
console.log(`Expected: true`);
console.log(`Pass: ${isInputCorrectSoFar("", "hello") === true}\n`);

// Test 10: Complete match
console.log(`isInputCorrectSoFar("hello", "hello"): ${isInputCorrectSoFar("hello", "hello")}`);
console.log(`Expected: true`);
console.log(`Pass: ${isInputCorrectSoFar("hello", "hello") === true}\n`);

console.log('=== All Tests Complete ===');
