# Convex Backend - Implementation Plan

## Tasks Overview

- [x] 1. Set up Convex backend integration
  - Navigate to app-next directory
  - Run `bun install convex` to install dependency
  - Run `bunx convex dev` to initialize Convex project
  - Create app-next/app/ConvexClientProvider.tsx with client component
  - Integrate ConvexClientProvider into app-next/app/layout.tsx
  - _Properties: P1, P2, P3, P4_
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [x] 2. Set up Convex Auth integration
  - Install @convex-dev/auth and @auth/core@0.37.0 dependencies
  - Initialize Convex Auth with `bunx @convex-dev/auth`
  - Create convex/schema.ts with auth tables
  - Update ConvexClientProvider to use ConvexAuthProvider
  - _Requirements: Authentication setup for future features_

## Implementation Notes

- Use `bunx` instead of `npx` for all Convex CLI commands
- Keep `convex dev` running in a separate terminal during development
- The .env.local file is automatically created by `convex dev` - do not create manually
- ConvexClientProvider must be a client component ("use client" directive)
- The Convex deployment URL will be automatically populated during initialization

## Estimated Effort

- Total Tasks: 2
- Estimated Time: 30-45 minutes
- Complexity: Low
- Risk Level: Low

## Dependencies

- Bun package manager must be installed
- Internet connection required for Convex cloud
- Convex account (will be created during initialization if needed)
- Next.js app must be in working state
