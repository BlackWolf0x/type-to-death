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

- [x] 3. Create shared layout component
  - Create `app-next/app/cases/layout.tsx`
  - Add archive background image with sepia tone and opacity
  - Add VHS film grain overlay using VHSStatic component
  - Create sticky header with backdrop blur
  - Add conditional navigation: "Main Menu" button on list page, "View all Cases" button on detail page
  - Display different titles based on pathname (list vs detail)
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 4. Create case list page
  - Create `app-next/app/cases/page.tsx`
  - Fetch all stories using `getAllStories` query
  - Display loading state while fetching
  - Display empty state if no stories exist
  - Render polaroid-style case cards with:
    - Paper clip tab at top
    - Layered paper backgrounds with texture overlay
    - Patient photo with random rotation (2-10 degrees)
    - Patient number, name, title in italic text
    - Creation date display
  - Implement `getRandomRotation()` function for image variety
  - Add hover effects (scale and rotation)
  - Link each card to `/cases/[slug]`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 3.1, 3.2, 3.6_

- [x] 5. Create case detail page
  - Create `app-next/app/cases/[slug]/page.tsx`
  - Fetch story by slug using `getStoryBySlug` query
  - Display not found state if story doesn't exist
  - Render patient header (number, name) in monospace font
  - Render story title in large horror font
  - Display full story text with paper document styling:
    - Amber/cream paper background
    - Paper texture overlay using SVG noise filter
    - Layered paper effect with rotation
    - Proper text formatting with `whitespace-pre-line`
  - Handle escaped characters (\\n, \\") by converting to proper formatting
  - Fall back to introduction if full story unavailable
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.3, 3.4_

- [x] 6. Add navigation button to home banner
  - Update `app-next/components/home-banner.tsx`
  - Add "Case Files" button next to Leaderboard button
  - Use consistent styling with existing buttons
  - _Requirements: 4.1_

- [x] 7. Add image fields to stories schema
  - Update `app-next/convex/schema.ts` stories table
  - Add `story: v.optional(v.string())` field
  - Add `storageId: v.optional(v.string())` field
  - Add `imageGenerationPrompt: v.optional(v.string())` field
  - All fields should be optional

- [x] 8. Add imageGenerationPrompt to STORY_SCHEMA
  - Update `STORY_SCHEMA` in `app-next/convex/stories.ts`
  - Add `imageGenerationPrompt` property with type string
  - Set description to: "A prompt focused on generating an image for the current story"
  - Make it optional (not in required array)

- [x] 9. Update STORY_PROMPT for image generation
  - Update `STORY_PROMPT` in `app-next/convex/prompt.ts`
  - Add IMAGE GENERATION PROMPT section with consistent instructions
  - Focus on portrait photos that reflect the patient's trauma and emotional state
  - Include dark, sad, haunted tone with emotional descriptors (tired eyes, haunted expression, weary look)
  - Ensure prompt describes the specific patient from the story (matching gender, age, appearance)
  - Use moody, atmospheric photography style with darker tones
  - 2-3 sentences for consistent results with emotional depth

- [x] 10. Add story field to STORY_SCHEMA and functions
  - Add `story` field to `STORY_SCHEMA` in `app-next/convex/stories.ts` (required)
  - Add `story: v.string()` to `insertStory` mutation args
  - Include `story` in db.insert call
  - Add `story: story.story` to `generateStory` insertStory call
  - Add `!story.story` to validation check
  - Update `Story` interface in `app-next/types.ts` to include `story: string`

- [x] 11. Update STORY_PROMPT for full story field
  - Add FULL STORY section to `STORY_PROMPT` in `app-next/convex/prompt.ts`
  - Instruct AI to combine introduction and all 8 chapters into cohesive narrative
  - Use paragraph breaks (`\n\n`) between sections
  - Format: Introduction\n\nChapter 1\n\nChapter 2... etc.
  - This field is for display purposes on case detail pages

## Implementation Notes

- Start with the slug utility since it's used by both Convex queries and page components
- Convex queries should be added before creating pages that depend on them
- Create shared layout component first to establish consistent navigation and styling
- Case list page features custom polaroid-style cards with random rotation for visual variety
- Case detail page uses paper document styling with texture overlays
- Home banner integration is independent and can be done last
- Visual design uses custom styling rather than shadcn/ui Card components for unique aesthetic
- Archive background and VHS effects create immersive horror atmosphere

## Dependencies

- Convex stories table (existing)
- shadcn/ui components (existing)
- Next.js App Router (existing)

## Estimated Effort

- Total Tasks: 11
- Estimated Time: 3-4 hours
- Complexity: Medium (custom visual design adds complexity)
- Risk Level: Low