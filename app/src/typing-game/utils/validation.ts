/**
 * Validates if the input matches the target word exactly.
 * Performs case-sensitive comparison including punctuation.
 * 
 * @param input - The typed input to validate
 * @param target - The target word to match against
 * @returns true if input matches target exactly, false otherwise
 */
export function validateWord(input: string, target: string): boolean {
    return input === target;
}

/**
 * Checks if the current input is correct so far (partial match).
 * Used for providing real-time visual feedback while typing.
 * 
 * @param input - The current typed input
 * @param target - The target word being typed
 * @returns true if target starts with input, false otherwise
 */
export function isInputCorrectSoFar(input: string, target: string): boolean {
    return target.startsWith(input);
}

/**
 * Validates if a single typed character matches the expected character.
 * Performs case-sensitive comparison including punctuation and special characters.
 * 
 * @param typedChar - The character that was typed
 * @param expectedChar - The expected character at the current position
 * @returns true if typedChar matches expectedChar exactly, false otherwise
 */
export function validateCharacter(typedChar: string, expectedChar: string): boolean {
    return typedChar === expectedChar;
}
