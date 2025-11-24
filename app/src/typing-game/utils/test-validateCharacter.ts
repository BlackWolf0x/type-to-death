/**
 * Manual test file for validateCharacter function
 * Run this file to verify character validation works correctly
 */

import { validateCharacter } from './validation';

console.log('=== Testing validateCharacter function ===\n');

// Test 1: Matching lowercase letters
console.log('Test 1: Matching lowercase letters');
console.log('validateCharacter("a", "a"):', validateCharacter('a', 'a')); // Expected: true
console.log('validateCharacter("z", "z"):', validateCharacter('z', 'z')); // Expected: true
console.log('');

// Test 2: Matching uppercase letters
console.log('Test 2: Matching uppercase letters');
console.log('validateCharacter("A", "A"):', validateCharacter('A', 'A')); // Expected: true
console.log('validateCharacter("Z", "Z"):', validateCharacter('Z', 'Z')); // Expected: true
console.log('');

// Test 3: Case-sensitive comparison (should fail)
console.log('Test 3: Case-sensitive comparison (should fail)');
console.log('validateCharacter("a", "A"):', validateCharacter('a', 'A')); // Expected: false
console.log('validateCharacter("A", "a"):', validateCharacter('A', 'a')); // Expected: false
console.log('validateCharacter("h", "H"):', validateCharacter('h', 'H')); // Expected: false
console.log('');

// Test 4: Non-matching letters
console.log('Test 4: Non-matching letters');
console.log('validateCharacter("a", "b"):', validateCharacter('a', 'b')); // Expected: false
console.log('validateCharacter("x", "y"):', validateCharacter('x', 'y')); // Expected: false
console.log('');

// Test 5: Punctuation and special characters
console.log('Test 5: Punctuation and special characters');
console.log('validateCharacter(".", "."):', validateCharacter('.', '.')); // Expected: true
console.log('validateCharacter(",", ","):', validateCharacter(',', ',')); // Expected: true
console.log('validateCharacter("!", "!"):', validateCharacter('!', '!')); // Expected: true
console.log('validateCharacter("?", "?"):', validateCharacter('?', '?')); // Expected: true
console.log("validateCharacter(\"'\", \"'\"):", validateCharacter("'", "'")); // Expected: true
console.log('validateCharacter(\'"\', \'"\'):', validateCharacter('"', '"')); // Expected: true
console.log('');

// Test 6: Non-matching punctuation
console.log('Test 6: Non-matching punctuation');
console.log('validateCharacter(".", ","):', validateCharacter('.', ',')); // Expected: false
console.log('validateCharacter("!", "?"):', validateCharacter('!', '?')); // Expected: false
console.log('');

// Test 7: Numbers
console.log('Test 7: Numbers');
console.log('validateCharacter("1", "1"):', validateCharacter('1', '1')); // Expected: true
console.log('validateCharacter("9", "9"):', validateCharacter('9', '9')); // Expected: true
console.log('validateCharacter("1", "2"):', validateCharacter('1', '2')); // Expected: false
console.log('');

// Test 8: Spaces
console.log('Test 8: Spaces');
console.log('validateCharacter(" ", " "):', validateCharacter(' ', ' ')); // Expected: true
console.log('validateCharacter(" ", "a"):', validateCharacter(' ', 'a')); // Expected: false
console.log('');

// Test 9: Mixed character types
console.log('Test 9: Mixed character types');
console.log('validateCharacter("a", "1"):', validateCharacter('a', '1')); // Expected: false
console.log('validateCharacter("A", "!"):', validateCharacter('A', '!')); // Expected: false
console.log('validateCharacter("5", "!"):', validateCharacter('5', '!')); // Expected: false
console.log('');

console.log('=== All tests completed ===');
