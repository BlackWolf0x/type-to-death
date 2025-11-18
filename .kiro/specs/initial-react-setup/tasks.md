# Implementation Plan: Initial React Setup with Vite, Tailwind CSS, and shadcn/ui

## Overview
This plan implements a modern React development environment using Vite, Tailwind CSS v4, and shadcn/ui component library.

## Tasks

- [x] 1. Create Vite + React + TypeScript project
  - Run `pnpm create vite@latest app` and select React + TypeScript variant
  - Navigate to app directory and run `pnpm install`
  - Verify dev server starts with `pnpm run dev`
  - _Requirements: US-1.1, US-1.2, US-1.3, US-1.4, US-1.5_

- [ ] 2. Install and configure Tailwind CSS v4
- [ ] 2.1 Install Tailwind CSS dependencies
  - Run `pnpm add tailwindcss @tailwindcss/vite` in app directory
  - _Requirements: US-2.1_

- [ ] 2.2 Configure Vite for Tailwind
  - Update vite.config.ts to import and include tailwindcss plugin
  - Add path alias configuration with `@` pointing to `./src`
  - Install @types/node: `pnpm add -D @types/node`
  - _Requirements: US-2.2_

- [ ] 2.3 Set up Tailwind CSS imports
  - Replace entire contents of src/index.css with `@import "tailwindcss";`
  - Ensure NO tailwind.config.js file is created
  - _Requirements: US-2.3, US-2.5_

- [ ] 2.4 Verify Tailwind CSS works
  - Add Tailwind utility classes to App.tsx (e.g., text-blue-500, font-bold)
  - Start dev server and verify styles apply correctly
  - _Requirements: US-2.4_

- [ ] 3. Configure TypeScript path aliases
- [ ] 3.1 Update tsconfig.json
  - Add `"baseUrl": "."` and `"paths": { "@/*": ["./src/*"] }` to compilerOptions
  - _Requirements: US-3.1_

- [ ] 3.2 Update tsconfig.app.json
  - Add `"baseUrl": "."` and `"paths": { "@/*": ["./src/*"] }` to compilerOptions
  - _Requirements: US-3.1_

- [ ] 4. Initialize shadcn/ui
- [ ] 4.1 Run shadcn/ui init
  - Execute `pnpm dlx shadcn@latest init` in app directory
  - Select appropriate options (style: new-york, base color: slate, CSS variables: yes)
  - Verify components.json is created with correct configuration
  - _Requirements: US-3.2, US-3.3_

- [ ] 4.2 Verify shadcn/ui configuration
  - Ensure components.json has correct paths for components (@/components), utils (@/lib/utils), and ui (@/components/ui)
  - Verify tailwind.config is empty string (v4 uses CSS-based config)
  - Confirm css path points to "src/index.css"
  - _Requirements: US-3.3_

- [ ] 4.3 Add design tokens to index.css
  - Add CSS custom properties for light and dark themes using OKLCH color space
  - Include all required design tokens (background, foreground, primary, secondary, etc.)
  - Add .dark class overrides for dark mode
  - _Requirements: US-3.4_

- [ ] 5. Add and verify test component
- [ ] 5.1 Add Button component
  - Run `pnpm dlx shadcn@latest add button` in app directory
  - Verify component files are created in src/components/ui/
  - _Requirements: US-3.5_

- [ ] 5.2 Integrate Button in App.tsx
  - Import Button component using @/ alias
  - Render Button in App.tsx with test content
  - Verify component renders with proper styling
  - _Requirements: US-3.6_

- [ ] 5.3 Test hot module replacement
  - Make changes to App.tsx while dev server is running
  - Verify changes reflect immediately without full page reload
  - _Requirements: US-1.5_

- [ ] 5.4 Run build verification
  - Execute `pnpm run build` to check for TypeScript errors
  - Verify build completes successfully with no errors
  - _Requirements: US-1.5_

## Validation

After completing all tasks, verify:
- Development server starts without errors
- Tailwind utility classes apply correctly
- No tailwind.config.js file exists
- Path aliases (@/) resolve correctly
- shadcn/ui Button component renders with proper styling
- TypeScript compilation succeeds
- Hot module replacement works
