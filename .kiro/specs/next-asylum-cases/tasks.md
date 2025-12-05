# Asylum Cases - Implementation Plan

## Tasks Overview

- [x] 1. Create slug utility function
  - Create `app-next/lib/slug.ts` with `slugify()` function
  - Remove special characters, convert to lowercase, replace spaces with dashes
  - Export function for use in components and Convex
  - _Requirements: 2.9_


- [x] 2. Add Convex queries for stories
  - Add `getAllStories` query to `convex/stories.ts` - returns all stories ordered by createdAt desc
  - Add `getStoryBySlug` query to `convex/stories.ts` - finds story by slugified title match
  - _Requirements: 1.1, 1.3, 2.1_

- [x] 3. Create case list page
  - Create `app-next/app/cases/page.tsx`
  - Fetch all stories using `getAllStories` query
  - Display loading state while fetching
  - Display empty state if no stories exist
  - Render list of case cards with patient number, name, title
  - Link each card to `/cases/[slug]`
  - Add "Back to Main Menu" button at the top linking to home
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 4.2_


- [x] 4. Create case detail page
  - Create `app-next/app/cases/[slug]/page.tsx`
  - Fetch story by slug using `getStoryBySlug` query
  - Display not found state if story doesn't exist
  - Render patient header (number, name)
  - Render story title
  - Render introduction text
  - Render all chapters with difficulty badges
  - Add "Back to All Cases" button at the top linking to `/cases`
  - Add "Back to Main Menu" button linking to home
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 4.2_

- [x] 5. Add navigation button to home banner
  - Update `app-next/components/home-banner.tsx`
  - Add "Case Files" button next to Leaderboard button
  - Use consistent styling with existing buttons
  - _Requirements: 4.1_

- [x] 6. Add image fields to stories schema


  - Update `app-next/convex/schema.ts` stories table
  - Add `story: v.optional(v.string())` field
  - Add `storageId: v.optional(v.string())` field
  - Add `imageGenerationPrompt: v.optional(v.string())` field
  - All fields should be optional


- [x] 7. Add imageGenerationPrompt to STORY_SCHEMA


  - Update `STORY_SCHEMA` in `app-next/convex/stories.ts`
  - Add `imageGenerationPrompt` property with type string
  - Set description to: "A prompt focused on generating an image for the current story"
  - Make it optional (not in required array)

- [x] 8. Update STORY_PROMPT for image generation
  - Update `STORY_PROMPT` in `app-next/convex/prompt.ts`
  - Add IMAGE GENERATION PROMPT section with consistent instructions
  - Focus on portrait photos that reflect the patient's trauma and emotional state
  - Include dark, sad, haunted tone with emotional descriptors (tired eyes, haunted expression, weary look)
  - Ensure prompt describes the specific patient from the story (matching gender, age, appearance)
  - Use moody, atmospheric photography style with darker tones
  - 2-3 sentences for consistent results with emotional depth

- [x] 9. Add story field to STORY_SCHEMA and functions
  - Add `story` field to `STORY_SCHEMA` in `app-next/convex/stories.ts` (required)
  - Add `story: v.string()` to `insertStory` mutation args
  - Include `story` in db.insert call
  - Add `story: story.story` to `generateStory` insertStory call
  - Add `!story.story` to validation check
  - Update `Story` interface in `app-next/types.ts` to include `story: string`

- [x] 10. Update STORY_PROMPT for full story field
  - Add FULL STORY section to `STORY_PROMPT` in `app-next/convex/prompt.ts`
  - Instruct AI to combine introduction and all 8 chapters into cohesive narrative
  - Use paragraph breaks (`\n\n`) between sections
  - Format: Introduction\n\nChapter 1\n\nChapter 2... etc.
  - This field is for display purposes on case detail pages

## Implementation Notes

- Start with the slug utility since it's used by both Convex queries and page components
- Convex queries should be added before creating pages that depend on them
- Case list page is simpler, implement before detail page
- Home banner integration is independent and can be done last
- Use existing shadcn/ui components (Card, Badge, Button, Separator)
- Follow existing dark theme and horror styling patterns

## Dependencies

- Convex stories table (existing)
- shadcn/ui components (existing)
- Next.js App Router (existing)

## Estimated Effort

- Total Tasks: 10
- Estimated Time: 2-3 hours
- Complexity: Low
- Risk Level: Low