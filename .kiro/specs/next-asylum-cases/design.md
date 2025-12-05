# Asylum Cases - Design

## Overview

The Asylum Cases feature adds two new pages to the Next.js application with a shared layout:
1. A case list page (`/cases`) that displays all stories as polaroid-style cards with patient photos
2. A case detail page (`/cases/[slug]`) that shows the full story content in a paper document format
3. A shared layout component (`/cases/layout.tsx`) that provides consistent navigation and atmospheric styling

The implementation uses Next.js App Router with dynamic routes, Convex for data fetching, and custom styled components. Story titles are converted to URL slugs by removing special characters and replacing spaces with dashes. The visual design features polaroid-style case cards with random rotation, archive background imagery, VHS film grain effects, and paper texture overlays for an immersive horror aesthetic.

## Architecture

1. **Page Components**: Next.js pages handle routing and layout
2. **Convex Queries**: Server-side data fetching from the stories table
3. **UI Components**: Reusable components for case cards and detail sections
4. **Navigation**: Links between pages and back to home

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
├─────────────────────────────────────────────────────────┤
│  /cases (list)              /cases/[slug] (detail)      │
│  ┌─────────────┐            ┌─────────────────────┐     │
│  │ CaseList    │            │ CaseDetail          │     │
│  │ Component   │───────────▶│ Component           │     │
│  └─────────────┘            └─────────────────────┘     │
│         │                            │                   │
│         ▼                            ▼                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Convex Queries                      │    │
│  │  - getAllStories()                               │    │
│  │  - getStoryById(id)                              │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Layout Component

#### `/app/cases/layout.tsx` - Shared Cases Layout

**Responsibilities:**
- Provide consistent header with conditional navigation buttons
- Display archive background image with VHS film grain overlay
- Apply sticky header with backdrop blur
- Show different titles based on current page (list vs detail)

**Dependencies:**
- Next.js `usePathname` hook
- VHSStatic component
- shadcn/ui Button component

**Features:**
- Conditional navigation: "Main Menu" button on list page, "View all Cases" button on detail page
- Archive background image with sepia tone and opacity
- VHS film grain overlay for atmospheric effect
- Sticky header with backdrop blur

### Page Components

#### `/app/cases/page.tsx` - Case List Page

**Responsibilities:**
- Fetch all stories from Convex
- Render polaroid-style case cards with patient photos
- Apply random rotation (2-10 degrees) to each card image
- Handle loading and empty states
- Provide hover effects and navigation to detail pages

**Dependencies:**
- Convex `useQuery` hook
- Next.js Image component
- slugify utility function
- Lucide icons (Loader2, FolderClosed)

**Visual Features:**
- Polaroid-style cards with paper texture overlay
- Random image rotation for visual variety
- Placeholder patient photo (/case-images/test.jpg)
- Paper clip tab at top of each card
- Hover scale and rotation effects
- Creation date display

#### `/app/cases/[slug]/page.tsx` - Case Detail Page

**Responsibilities:**
- Fetch single story by slug from Convex
- Render full story text with proper formatting
- Handle escaped characters (\\n, \\") conversion
- Display patient header with number and name
- Handle not found state
- Fall back to introduction if full story unavailable

**Dependencies:**
- Convex `useQuery` hook
- Next.js `useParams` hook
- Lucide icons (Loader2, FolderClosed, ArrowLeft)

**Visual Features:**
- Paper document styling with texture overlay
- Layered paper effect with rotation
- Proper text formatting with whitespace-pre-line
- Centered patient header with monospace font
- Large title in horror font (metalMania)

## Data Models

### Convex Query: `getAllStories`

```typescript
// New query in convex/stories.ts
export const getAllStories = query({
  args: {},
  handler: async (ctx) => {
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();
    return stories;
  },
});
```

### Convex Query: `getStoryBySlug`

```typescript
// New query in convex/stories.ts
export const getStoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const stories = await ctx.db.query("stories").collect();
    // Find story where slugified title matches the slug
    return stories.find(story => slugify(story.title) === args.slug) ?? null;
  },
});
```

### Slug Utility Function

```typescript
// lib/slug.ts
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with dashes
    .replace(/-+/g, '-')           // Replace multiple dashes with single
    .replace(/^-|-$/g, '');        // Remove leading/trailing dashes
}
```

### Story Type (existing + new fields)

```typescript
interface Story {
  _id: Id<"stories">;
  title: string;
  introduction: string;
  chapters: Chapter[];
  patientName: string;
  patientNumber: string;
  createdAt: number;
  // New required fields for AI generation
  story: string;
  imageGenerationPrompt: string;
  // Optional field for future use
  imageId?: string;
}

interface Chapter {
  text: string;
  difficulty: "easy" | "medium" | "hard";
}
```

### Story Schema Updates

The stories table in Convex now includes fields for AI-generated content:

**Required Fields (generated by AI):**
- `story` (string): The full readable story combining introduction and all chapters into a cohesive narrative with paragraph breaks. This is the complete story displayed on case detail pages.
- `imageGenerationPrompt` (string): AI-generated prompt for creating simple portrait photos of the patient

**Optional Fields:**
- `imageId` (optional string): Stores the ID of a generated image (for future image generation workflow)

**Full Story Field Details:**

The `story` field contains the complete narrative combining the introduction and all 8 chapters into a single, cohesive readable text. This field:
- Uses paragraph breaks (`\n\n`) between sections for readability
- Flows naturally as one continuous narrative
- Is used for display on case detail pages (not for typing practice)
- Provides users with the complete story experience in a readable format

**Image Generation Prompt Details:**

The `STORY_SCHEMA` used for AI story generation includes both `story` and `imageGenerationPrompt` fields. The `imageGenerationPrompt` is designed to create consistent portrait photos of the patient that reflect their traumatic experience with the following characteristics:

- **Primary Focus**: Portrait photo of the specific patient from the story that conveys their emotional state
- **Patient Matching**: The image prompt must describe the actual protagonist/patient from the story (matching gender, age, appearance, background)
- **Tone**: Dark, sad, haunted atmosphere reflecting the trauma they experienced - includes emotional descriptors like tired eyes, haunted expression, weary look, troubled gaze
- **Style**: Moody, atmospheric photography with darker tones and somber lighting
- **Format**: 2-3 sentences, clear and specific, suitable for AI image generation tools (Stable Diffusion, DALL-E, Midjourney)
- **Consistency**: Portrait format with emotional depth for consistent results across all stories

Example: "Portrait photo of a middle-aged man with short brown hair and haunted, tired eyes, wearing a disheveled button-up shirt, weary expression, dark moody lighting, somber atmosphere, cinematic photography"

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties can be combined and verified:

### P1: Case List Completeness
**Property:** *For any* set of stories in the database, the case list page displays exactly all stories with no omissions or duplicates.
**Verification:** Count of rendered case cards equals count of stories in database.
**Validates:** Requirements 1.1

### P2: Case Card Content Integrity
**Property:** *For any* story, the rendered case card contains the patient number, patient name, and title from that story.
**Verification:** Each card's displayed text includes all three required fields matching the source data.
**Validates:** Requirements 1.2

### P3: Case List Ordering
**Property:** *For any* set of stories with different creation dates, the case list displays them in descending order by createdAt.
**Verification:** For each adjacent pair of cards, the first card's createdAt >= the second card's createdAt.
**Validates:** Requirements 1.3

### P4: Case Detail Content Completeness
**Property:** *For any* valid story slug, the detail page displays the patient number, patient name, title, and full story text (or introduction as fallback).
**Verification:** All required fields from the story document appear in the rendered output with proper formatting.
**Validates:** Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6

### P6: Slug Generation Consistency
**Property:** *For any* story title, the slugify function produces a URL-safe string containing only lowercase letters, numbers, and dashes.
**Verification:** Slugified output matches regex `/^[a-z0-9-]*$/` and round-trip lookup finds the original story.
**Validates:** Requirements 2.1

### P5: Text Formatting Correctness
**Property:** *For any* story text containing escaped characters (\\n, \\"), the detail page displays them as proper formatting (newlines, quotes).
**Verification:** Rendered text contains actual newlines and quotes, not escaped character sequences.
**Validates:** Requirements 2.6

## Edge Cases

### E1: Empty Database
**Scenario:** No stories exist in the database
**Handling:** Display empty state message with appropriate styling

### E2: Invalid Story Slug
**Scenario:** User navigates to `/cases/[slug]` with non-existent slug
**Handling:** Display not found message with link back to case list

### E3: Slug Collision
**Scenario:** Two stories have titles that produce the same slug
**Handling:** Query returns first match (stories should have unique titles by design)

## Error Handling

### Data Fetching Errors
- Use Convex's built-in error handling
- Display loading states during fetch
- Handle undefined/null responses gracefully

### Navigation Errors
- Use Next.js Link component for client-side navigation
- Provide fallback navigation via browser back button

## Integration Points

### Home Banner Integration

Add a navigation button to the home banner, next to the Leaderboard button:

```tsx
// In components/home-banner.tsx, inside the button group div
<div className="mb-10 flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
    <Button variant="outlineRed" size="xl" className="relative -rotate-4" asChild>
        <Link href="/play">...</Link>
    </Button>

    <ModalLeaderboard />
    
    {/* New Cases button */}
    <Button variant="outlineRed" size="lg" asChild>
        <Link href="/cases">
            <FileText /> Case Files
        </Link>
    </Button>
</div>
```

### Convex Stories Module

Add new queries to `convex/stories.ts`:
- `getAllStories` - Returns all stories ordered by createdAt desc
- `getStoryBySlug` - Returns single story by matching slugified title

## Visual Design Details

### Polaroid Card Styling

Each case card features:
- Paper clip tab at top (20px wide, 4px tall, tan color)
- Outer tan border with paper texture overlay
- Layered paper effect with multiple rotated backgrounds
- Patient photo with random rotation (2-10 degrees, positive or negative)
- Case information in italic black text
- Creation date in smaller, faded text
- Hover effects: scale from 95% to 100%, slight rotation

### Paper Document Styling

Case detail pages feature:
- Amber/cream paper background (#fef3c7)
- Paper texture overlay using SVG noise filter
- Layered effect with rotated background paper
- Black text with increased line height for readability
- Proper whitespace handling with `whitespace-pre-line`

### Background and Atmosphere

Both pages include:
- Archive background image (/archive.png) with sepia tone
- VHS film grain overlay at 30% opacity
- Dark backdrop with blur for header
- Sticky header that remains visible on scroll

## Performance Considerations

- Use Convex's reactive queries for automatic updates
- Case list fetches all stories (acceptable for current scale)
- Consider pagination if story count exceeds 50+ in future
- Use Next.js Link for prefetching on hover

## Testing Strategy

### Property-Based Testing
- Use fast-check library for property-based tests
- Test slug generation function
- Minimum 100 iterations per property test

### Unit Testing
- Test slugify function with various inputs
- Test edge cases (empty strings, special characters only)

## Future Enhancements (Out of Scope)

- Search and filter functionality
- Pagination for large story collections
- Favorite/bookmark cases
- Share case links
- Print-friendly view
- Reading progress tracking
- Display generated images on case detail pages (when imageId is populated)
- Image generation workflow using imageGenerationPrompt
