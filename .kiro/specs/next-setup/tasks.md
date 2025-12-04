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

- [x] 4. Create home page with banner
  - Update `app/(home)/page.tsx` to use client component
  - Create `components/home-banner.tsx` with shadcn button
  - Add "Start Game" button that navigates to `/main-menu`
  - Use Next.js `useRouter` for navigation
  - Style banner with Tailwind CSS for centered layout
  - _Properties: P2_
  - _Requirements: 4.1, 4.5_

- [x] 5. Style calibration page with horror theme
  - Add operating room background image with low opacity
  - Create VHSStatic component with film grain effect using SVG filters
  - Enhance Card component with red corner brackets
  - Add CardRain component for animated red rain background
  - Implement shake animation in globals.css
  - Apply conditional shake animation when webcam is not connected
  - Update card border to red with transparency
  - Ensure proper z-index layering for all visual effects
  - _Properties: P2_
  - _Requirements: 4.3_

- [x] 6. Configure custom branding and typography
  - Add Metal Mania font from Google Fonts to layout.tsx
  - Configure font variable for horror-themed typography
  - Update favicon.ico with custom game icon
  - Add favicon.png to public directory
  - Update metadata title and description for game branding
  - _Properties: P1_
  - _Requirements: 1.1, 1.2_

- [x] 7. Add Credits modal to homepage
  - Create `components/modal-credits.tsx` with Dialog component
  - Use shadcn Dialog, Button, and ScrollArea components
  - Add Credits button after Eye Calibration button on homepage
  - Include credits for Monster & Animations (Mixamo)
  - Include credits for FX & Music (licensed bundle + Pixabay)
  - Include credits for Level Design (Abandoned Asylum Free Asset Pack)
  - Include credits for AI Tools (Pixverse, Recraft)
  - Include credits for Development (Unity 6.1, Next.js, MediaPipe, shadcn/ui)
  - Use ScrollArea for scrollable content with proper styling
  - Add clickable links to external resources
  - _Properties: P2_
  - _Requirements: 4.1, 4.5_

- [x] 8. Create mobile warning component


  - Create `app-next/components/mobile-warning.tsx` as client component
  - Use 'use client' directive for client-side rendering
  - Implement useState hook to track isMobile state
  - Implement useEffect hook to detect viewport width on mount
  - Add window resize event listener to update isMobile state
  - Set mobile breakpoint at 768px (viewport width < 768px shows warning)
  - Clean up resize listener on component unmount
  - Return null when viewport is desktop size (≥768px)
  - Render warning message when viewport is mobile size (<768px)
  - Use fixed positioning at top of viewport with high z-index (z-50)
  - Style with Tailwind CSS: background color, padding, text styling
  - Message should state: "This game is optimized for desktop with a keyboard"
  - Ensure warning doesn't block page content (non-modal design)
  - _Properties: P3, P4, P5_
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_




- [ ] 9. Integrate mobile warning into root layout
  - Open `app-next/app/layout.tsx`
  - Import MobileWarning component using @/ alias
  - Add MobileWarning component at the top of the body content
  - Ensure it appears before {children} so it's visible on all pages
  - Verify component renders on all routes (/, /permission, /calibration, /play)
  - _Properties: P3, P5_
  - _Requirements: 5.1, 5.5_