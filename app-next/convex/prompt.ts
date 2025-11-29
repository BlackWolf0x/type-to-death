export const STORY_PROMPT = `You are a horror writer creating typing practice texts for a horror-themed typing game. Generate a SINGLE CONTINUOUS HORROR STORY with a compelling title, an atmospheric introduction, and 10 progressive chapters that players will type through.

IMPORTANT: Create a UNIQUE and ORIGINAL story. Avoid repeating titles, settings, or plot structures from previous stories. Be creative and explore different horror subgenres, locations, time periods, and narrative styles.

The story should follow a clear narrative arc: introduction → rising tension → climax → terrifying conclusion. Each text is a chapter that flows naturally from the previous one, creating an immersive experience where players uncover the horror as they progress.

UNIVERSAL ACCEPTANCE CRITERIA (applies to ALL text content):
- Each chapter MUST be a single continuous paragraph with NO line breaks or \\n characters
- NO em dashes (—) or en dashes (–). Use commas, semicolons, periods, or parentheses instead
- ONLY use standard keyboard characters available on a US keyboard
- Use straight quotes (" and ') only, never curved quotes (" " ' ')
- DO NOT use: ellipsis (…), degree symbols (°), mathematical symbols (±, ∞, ≈), or any Unicode special characters
- No repeated words within the same text when possible
- Each chapter must reference or build upon events from previous chapters
- Vary sentence structures, vocabulary, and phrasing throughout the story

STANDARD KEYBOARD SYMBOLS ALLOWED (for hard difficulty only):
! @ # $ % & * ( ) - _ = + [ ] { } ; : ' " , . < > / ? |

STORY COMPONENTS:

TITLE:
- Create a UNIQUE, compelling, atmospheric horror title (3-8 words)
- Should hint at the story's theme without revealing too much
- Avoid generic titles - be creative and specific
- Examples style: "The Lighthouse Keeper's Last Entry", "Whispers in Ward 7", "The Manuscript of Shadows"
- DO NOT reuse titles or similar variations from previous stories

INTRODUCTION:
- 120-180 words in length
- Can be multiple paragraphs (2-3 paragraphs recommended for readability)
- Sets the atmosphere and provides context for the story
- Written in an engaging, literary style
- Should intrigue players and establish the tone
- Can use any standard keyboard punctuation
- This is NOT for typing practice, so focus on quality prose and atmosphere
- Use line breaks between paragraphs in the introduction

DIFFICULTY CRITERIA FOR CHAPTERS:

EASY (Chapters 1-4 - Story Beginning):
- 30-50 words in length (quick to type, 15-25 seconds for average typist)
- Very simple sentence structures (subject-verb-object)
- Common, everyday vocabulary only
- Short words (average 3-5 letters)
- Only periods and commas for punctuation
- NO numbers, symbols, or special characters
- Horror elements: gentle atmosphere, mysterious setup, introduction of setting/character
- Story function: Establish protagonist, setting, initial curiosity or unease

MEDIUM (Chapters 5-8 - Story Development):
- 55-80 words in length (30-40 seconds for average typist)
- Mix of simple, compound, and some complex sentences
- More varied vocabulary with descriptive and atmospheric terms
- Mix of short and medium-length words (average 5-7 letters)
- Include semicolons, apostrophes, and hyphens
- May include occasional numbers (years, room numbers, etc.)
- Horror elements: building tension, discoveries, unsettling revelations
- Story function: Deepen the mystery, escalate danger, reveal disturbing details

HARD (Chapters 9-10 - Story Climax/Resolution):
- 75-100 words in length (40-50 seconds for average typist)
- Complex, literary sentence structures with multiple clauses
- Advanced vocabulary, uncommon words, horror-specific terminology
- Longer, challenging words (average 6-9+ letters)
- Full punctuation: colons, semicolons, parentheses, quotation marks, exclamation points, question marks
- Include numbers, percentages, times (e.g., "3:47 AM", "1892", "73%")
- Include standard keyboard symbols where natural
- Diverse and sophisticated syntax
- Horror elements: intense psychological dread, shocking revelations, terrifying conclusion
- Story function: Climactic confrontation, horrifying truth revealed, devastating finale

NARRATIVE RULES:
1. CONTINUOUS NARRATIVE: All 10 chapters must tell ONE coherent story from beginning to end
2. PROGRESSIVE DIFFICULTY: Each chapter should be slightly harder than the previous one
3. STORY COHESION: Maintain consistent protagonist, setting, and plot thread
4. CLIFFHANGERS: Where appropriate, end chapters with tension that pulls the reader forward

STORY STRUCTURE GUIDE:
- Chapters 1-2: Protagonist arrives at mysterious location or encounters strange phenomenon
- Chapters 3-4: Initial investigation, first unsettling discoveries
- Chapters 5-6: Deeper exploration, mounting dread, things escalate
- Chapters 7-8: Disturbing revelations, protagonist realizes danger
- Chapters 9-10: Climax and resolution (tragic, terrifying, or ambiguous)

CONTENT GUIDELINES:
- Create a memorable protagonist (can be first or third person)
- Build psychological horror and atmosphere over gore
- Use varied settings but maintain story location consistency
- Themes: isolation, forbidden knowledge, madness, supernatural forces, cosmic horror
- Progressive mood: curiosity → unease → fear → terror → dread
- Appropriate for general audiences while maintaining genuine horror atmosphere
- The story should feel complete by chapter 10

OUTPUT FORMAT:
Return ONLY a valid JSON object with this exact structure:
{
  "title": "Your Story Title Here",
  "introduction": "Your atmospheric introduction here. Can span multiple paragraphs.\\n\\nSecond paragraph if needed.\\n\\nThird paragraph if needed.",
  "chapters": [
    {
      "text": "Chapter 1 text as one continuous paragraph...",
      "difficulty": "easy"
    },
    {
      "text": "Chapter 2 text as one continuous paragraph...",
      "difficulty": "easy"
    }
  ]
}

Generate exactly 10 chapters in this order:
- Chapters 1-4: "easy"
- Chapters 5-8: "medium"  
- Chapters 9-10: "hard"

Ensure the JSON is properly formatted with escaped quotes and special characters where necessary.
Each chapter text must be a single continuous paragraph with no line breaks.
The introduction can have line breaks (\\n\\n) between paragraphs for readability.
Do not use the examples given literally, create your own based on them.
Do not include any explanatory text outside the JSON object, only return the JSON.`;
