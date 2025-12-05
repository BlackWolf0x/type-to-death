/**
 * Facial feature arrays for enhancing portrait generation prompts.
 * One random feature from each array is selected to create more detailed portraits.
 */

export const EYE_COLORS = [
    "deep brown eyes",
    "light brown eyes",
    "hazel eyes",
    "green eyes",
    "blue eyes",
    "gray eyes",
    "amber eyes",
    "dark brown eyes",
    "blue-gray eyes",
    "olive green eyes",
    "honey-colored eyes",
    "steel gray eyes",
    "warm brown eyes",
    "pale blue eyes",
    "emerald green eyes",
];

export const EYE_SHAPES = [
    "almond-shaped eyes",
    "round eyes",
    "hooded eyes",
    "deep-set eyes",
    "wide-set eyes",
    "close-set eyes",
    "upturned eyes",
    "downturned eyes",
    "monolid eyes",
    "prominent eyes",
    "narrow eyes",
    "large expressive eyes",
    "small piercing eyes",
    "heavy-lidded eyes",
];

export const NOSE_DESCRIPTIONS = [
    "straight nose",
    "aquiline nose",
    "button nose",
    "broad nose",
    "narrow nose",
    "Roman nose",
    "upturned nose",
    "flat nose",
    "pointed nose",
    "bulbous nose",
    "crooked nose",
    "long nose",
    "short nose",
    "wide nostrils",
    "delicate nose",
];

export const EAR_DESCRIPTIONS = [
    "small ears",
    "large ears",
    "protruding ears",
    "flat ears",
    "pointed ears",
    "round ears",
    "attached earlobes",
    "detached earlobes",
    "narrow ears",
    "wide ears",
];

export const CHEEKBONE_DEFINITIONS = [
    "high cheekbones",
    "prominent cheekbones",
    "soft cheekbones",
    "angular cheekbones",
    "rounded cheeks",
    "hollow cheeks",
    "full cheeks",
    "defined cheekbones",
    "subtle cheekbones",
    "sharp cheekbones",
];

export const EYEBROW_DEFINITIONS = [
    "thick eyebrows",
    "thin eyebrows",
    "arched eyebrows",
    "straight eyebrows",
    "bushy eyebrows",
    "sparse eyebrows",
    "well-groomed eyebrows",
    "natural eyebrows",
    "heavy brow ridge",
    "delicate eyebrows",
    "dark eyebrows",
    "light eyebrows",
    "unibrow",
];

export const HAIR_STYLES = [
    "short cropped hair",
    "medium length hair",
    "long hair",
    "curly hair",
    "wavy hair",
    "straight hair",
    "buzz cut",
    "slicked back hair",
    "messy hair",
    "bald",
    "receding hairline",
    "thinning hair",
    "thick hair",
    "parted hair",
    "ponytail",
    "braided hair",
    "dreadlocks",
    "afro",
    "shaved sides",
    "comb over",
];

export const HAIR_COLORS = [
    "black hair",
    "dark brown hair",
    "light brown hair",
    "blonde hair",
    "dirty blonde hair",
    "auburn hair",
    "red hair",
    "ginger hair",
    "gray hair",
    "white hair",
    "salt and pepper hair",
    "strawberry blonde hair",
    "chestnut hair",
    "jet black hair",
    "platinum blonde hair",
];

// For men only
export const FACIAL_HAIR = [
    "clean shaven",
    "full beard",
    "short beard",
    "stubble",
    "goatee",
    "mustache",
    "handlebar mustache",
    "soul patch",
    "mutton chops",
    "five o'clock shadow",
    "thick beard",
    "trimmed beard",
    "long beard",
    "patchy beard",
    "van dyke beard",
];

// 10% chance of including - unique/distinctive features
export const MISCELLANEOUS_FEATURES = [
    "small scar on cheek",
    "scar across eyebrow",
    "crooked teeth",
    "gap between front teeth",
    "cleft chin",
    "dimples",
    "beauty mark on cheek",
    "freckles",
    "birthmark on face",
    "broken nose",
    "lazy eye",
    "heterochromia",
    "prominent mole",
    "acne scars",
    "burn scar",
];

/**
 * Pick a random element from an array
 */
function pickRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Detect if the prompt describes a male based on keywords
 */
function isMale(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase();
    const maleKeywords = ["man", "male", "boy", "gentleman", "guy", "he ", "his "];
    const femaleKeywords = ["woman", "female", "girl", "lady", "she ", "her "];
    
    const hasMale = maleKeywords.some(keyword => lowerPrompt.includes(keyword));
    const hasFemale = femaleKeywords.some(keyword => lowerPrompt.includes(keyword));
    
    // If explicitly female, return false
    if (hasFemale && !hasMale) return false;
    // If explicitly male, return true
    if (hasMale) return true;
    // Default to random if unclear
    return Math.random() > 0.5;
}

/**
 * Enhance a portrait prompt with random facial features
 * @param basePrompt - The base prompt (name, age, ethnicity, body type)
 * @returns Enhanced prompt with facial feature details
 */
export function enhancePortraitPrompt(basePrompt: string): string {
    const features: string[] = [];
    
    // Always include these features
    features.push(pickRandom(EYE_COLORS));
    features.push(pickRandom(EYE_SHAPES));
    features.push(pickRandom(NOSE_DESCRIPTIONS));
    features.push(pickRandom(EAR_DESCRIPTIONS));
    features.push(pickRandom(CHEEKBONE_DEFINITIONS));
    features.push(pickRandom(EYEBROW_DEFINITIONS));
    features.push(pickRandom(HAIR_STYLES));
    features.push(pickRandom(HAIR_COLORS));
    
    // Add facial hair for men only
    if (isMale(basePrompt)) {
        features.push(pickRandom(FACIAL_HAIR));
    }
    
    // 10% chance to include miscellaneous feature
    if (Math.random() < 0.1) {
        features.push(pickRandom(MISCELLANEOUS_FEATURES));
    }
    
    // Combine base prompt with features
    const featuresString = features.join(", ");
    return `${basePrompt}, ${featuresString}`;
}
