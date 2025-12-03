/**
 * Calculate score using the formula: Score = ((Accuracy² × WPM) / Time) × 1000
 *
 * @param accuracy - Accuracy percentage (0-100)
 * @param wordPerMinute - Words per minute typing speed
 * @param timeTaken - Time taken in seconds
 * @returns Calculated score
 */
export function calculateScore(
    accuracy: number,
    wordPerMinute: number,
    timeTaken: number
): number {
    return ((accuracy * accuracy * wordPerMinute) / timeTaken) * 1000;
}
