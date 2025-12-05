/**
 * Character trait arrays for generating random protagonist descriptions.
 * Used to create diverse characters for story generation.
 */

export const GENDERS = ["male", "female"] as const;

export const BUILDS = [
    "slim",
    "average",
    "athletic",
    "buff",
    "overweight",
    "stocky",
    "lanky",
    "petite",
    "heavyset",
    "muscular",
] as const;

export const ETHNICITIES = [
    "Caucasian",
    "African American",
    "Hispanic",
    "Latino",
    "Asian",
    "East Asian",
    "South Asian",
    "Southeast Asian",
    "Middle Eastern",
    "Native American",
    "Pacific Islander",
    "Mixed race",
    "Caribbean",
    "Mediterranean",
    "Scandinavian",
    "Eastern European",
    "West African",
    "East African",
    "Korean",
    "Japanese",
    "Chinese",
    "Vietnamese",
    "Filipino",
    "Indian",
    "Pakistani",
    "Iranian",
    "Turkish",
    "Greek",
    "Italian",
    "Irish",
    "British",
    "German",
    "French",
    "Russian",
    "Polish",
    "Brazilian",
    "Mexican",
    "Colombian",
    "Argentinian",
    "Nigerian",
    "Ethiopian",
    "Jamaican",
    "Puerto Rican",
    "Cuban",
] as const;

/**
 * Pick a random element from an array
 */
function pickRandom<T>(array: readonly T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random age between 15 and 90
 */
function generateRandomAge(): number {
    return Math.floor(Math.random() * (90 - 15 + 1)) + 15;
}

export type Gender = (typeof GENDERS)[number];
export type Build = (typeof BUILDS)[number];
export type Ethnicity = (typeof ETHNICITIES)[number];

export interface CharacterDescription {
    gender: Gender;
    build: Build;
    ethnicity: Ethnicity;
    age: number;
}

/**
 * Generate a random character description for story generation
 * @returns A character description object with gender, build, ethnicity, and age
 */
export function generateCharacterDescription(): CharacterDescription {
    return {
        gender: pickRandom(GENDERS),
        build: pickRandom(BUILDS),
        ethnicity: pickRandom(ETHNICITIES),
        age: generateRandomAge(),
    };
}

/**
 * Format character description as a string for the story prompt
 * @param character - The character description object
 * @returns Formatted string like "a 34 year old slim Asian female"
 */
export function formatCharacterDescription(character: CharacterDescription): string {
    return `a ${character.age} year old ${character.build} ${character.ethnicity} ${character.gender}`;
}

/**
 * Generate and format a random character description in one call
 * @returns Formatted character description string
 */
export function generateFormattedCharacter(): string {
    const character = generateCharacterDescription();
    return formatCharacterDescription(character);
}
