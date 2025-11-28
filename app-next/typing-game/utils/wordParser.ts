/**
 * Parses text into an array of words by splitting on whitespace.
 * Preserves punctuation attached to words.
 * 
 * @param text - The text to parse into words
 * @returns Array of words with empty strings filtered out
 */
export function parseWords(text: string): string[] {
    return text.split(/\s+/).filter(word => word.length > 0);
}
