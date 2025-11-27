# Next.js Setup - Implementation Plan

## Tasks Overview

- [x] 1. Initialize shadcn/ui
  - Navigate to app-next directory
  - Run `bunx --bun shadcn@latest init`
  - Verify components.json is created
  - Verify tsconfig.json is updated with import aliases
  - Verify app/globals.css is updated with CSS variables
  - Verify app/lib/utils.ts is created
  - _Properties: P1_
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. Verify setup
  - Run `bun run dev` to start development server
  - Verify no errors in console
  - Verify application loads in browser
  - Test adding a shadcn component: `bunx --bun shadcn@latest add button`
  - Verify button component is created in components/ui/
  - Import and use button in app/page.tsx
  - Verify button renders correctly
  - _Properties: P1_
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Create application routes
  - Create `app/main-menu/page.tsx` for main menu page
  - Create `app/permission/page.tsx` for webcam permission page
  - Create `app/calibration/page.tsx` for blink calibration page
  - Create `app/play/page.tsx` for game play page
  - Each page should be a basic React Server Component with placeholder content
  - Use proper TypeScript types for page components
  - _Properties: P2_
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_