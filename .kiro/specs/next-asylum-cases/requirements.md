# Asylum Cases - Requirements

## Introduction

The Asylum Cases feature provides a browsable archive of patient stories (cases) from the asylum database. Users can view a list of all generated stories and read individual case files with full patient details, introduction, and chapter content. This creates an immersive lore experience and allows players to explore the horror narratives outside of gameplay.

## Context

The game already generates AI-powered horror stories stored in Convex with patient information (name, number), introduction text, and 8 chapters. Stories also include optional image-related fields (imageGenerationPrompt, imageId, story) for future image generation capabilities. Currently, only the latest story is accessible during gameplay. This feature exposes the full archive of stories as browsable "case files" with dedicated pages for each story.

## Glossary

- **Case**: A patient story from the asylum database, containing patient metadata and narrative content
- **Case List**: The index page showing all available cases
- **Case Detail**: The individual page showing full content of a single case
- **Patient Number**: Unique identifier for each case (e.g., #928, #2120)
- **Chapter**: A section of the story with associated difficulty level

## Requirements

### Requirement 1: Case List Page

**User Story:** As a user, I want to browse all asylum cases, so that I can discover and select stories to read.

#### Acceptance Criteria

1. WHEN a user navigates to `/cases`, THE system SHALL display a list of all stories from the database
2. THE case list SHALL display each case with patient number, patient name, and title
3. THE case list SHALL order cases by creation date with newest first
4. WHEN a user clicks on a case card, THE system SHALL navigate to the case detail page
5. WHILE the cases are loading, THE system SHALL display a loading state
6. IF no cases exist in the database, THEN THE system SHALL display an empty state message

### Requirement 2: Case Detail Page

**User Story:** As a user, I want to read the full content of a case, so that I can explore the patient's story.

#### Acceptance Criteria

1. WHEN a user navigates to `/cases/[slug]`, THE system SHALL display the full case content where slug is derived from the story title
2. THE case detail page SHALL display the patient number and patient name in a header section
3. THE case detail page SHALL display the story title prominently
4. THE case detail page SHALL display the full story text with proper paragraph formatting
5. THE case detail page SHALL fall back to introduction text if full story is not available
6. THE case detail page SHALL handle escaped characters (\\n, \\") by converting them to proper formatting
7. WHEN a user clicks a back button, THE system SHALL navigate to the case list
8. IF the case slug does not match any story, THEN THE system SHALL display a not found message
9. THE system SHALL generate URL slugs by removing special characters and replacing spaces with dashes

### Requirement 3: Visual Design

**User Story:** As a user, I want the case pages to match the horror aesthetic, so that the experience feels immersive.

#### Acceptance Criteria

1. THE case pages SHALL use the existing dark theme and horror styling with archive background
2. THE case list SHALL display cases as polaroid-style cards with patient photos
3. THE case cards SHALL have random rotation between 2-10 degrees for visual variety
4. THE case detail page SHALL present content in a readable, document-like format with paper texture
5. THE pages SHALL include VHS film grain overlay for atmospheric effect
6. THE case cards SHALL display a placeholder patient photo with dynamic rotation

### Requirement 4: Navigation Integration

**User Story:** As a user, I want to access the cases archive from the main navigation, so that I can easily find it.

#### Acceptance Criteria

1. THE home banner SHALL include a "Case Files" button next to the Leaderboard button
2. THE case list page SHALL include a "Main Menu" button to navigate back to home
3. THE case detail page SHALL include a "View all Cases" button to navigate back to the list
4. THE navigation buttons SHALL be displayed in a sticky header with backdrop blur
5. THE header SHALL display different titles based on whether viewing list or detail page

## Non-Functional Requirements

### NFR1: Performance
- Case list page SHALL load within 2 seconds on standard connections
- Case detail page SHALL load within 1 second after navigation

### NFR2: Accessibility
- All interactive elements SHALL be keyboard accessible
- Text content SHALL maintain readable contrast ratios

### NFR3: Responsiveness
- Pages SHALL be viewable on desktop screens (mobile already shows warning)

## Constraints

- Must use existing Convex database and story schema
- Must use shadcn/ui components for UI elements
- Must follow existing Next.js App Router patterns
- Must use existing dark theme and styling conventions

## Dependencies

- Convex stories table and existing queries
- shadcn/ui component library
- Next.js App Router

## Success Metrics

- Users can browse and read all stored cases
- Navigation between list and detail pages works smoothly
- Visual design matches existing horror aesthetic

## Out of Scope

- Search or filtering functionality
- Pagination (can be added later if case count grows)
- Favoriting or bookmarking cases
- Social sharing of cases
- Case editing or deletion
