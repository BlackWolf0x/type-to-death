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

- [x] 3. Implement password authentication UI
  - Configure Password provider in convex/auth.ts
  - Install required shadcn components (dialog, tabs, label)
  - Create app-next/components/modals/AuthModal.tsx with sign in/register tabs
  - Use shadcn Dialog, Tabs, Input, Button, Label components
  - Integrate with Convex Auth useAuthActions hook
  - _Requirements: User authentication flow_

- [x] 4. Update convex/schema.ts to add username index
  - Add `.index("username", ["username"])` to users table for efficient lookups
  - _Requirements: 3.4_

- [x] 5. Create convex/users.ts with getCurrentUser query
  - Query authenticated user's profile including username field
  - Return null if not authenticated
  - _Properties: P5_
  - _Requirements: 3.1, 3.2_

- [x] 6. Create isUsernameTaken query in convex/users.ts
  - Accept username string argument
  - Convert to lowercase for case-insensitive check
  - Query users table for matching username
  - Return boolean
  - _Properties: P7_
  - _Requirements: 3.4, 3.5_

- [x] 7. Create setUsername mutation in convex/users.ts
  - Validate username format (3-20 chars, alphanumeric + underscore)
  - Check username not already taken (race condition protection)
  - Check user doesn't already have a username
  - Save lowercase username to user's profile
  - _Properties: P6, P7, P8_
  - _Requirements: 3.6, 3.7, 3.8, 3.9_

- [x] 8. Create app-next/components/modal-set-username.tsx
  - Use shadcn Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
  - Use shadcn Input, Label, Button components
  - Make dialog non-dismissible (no close button, onOpenChange returns early)
  - Add username validation with real-time feedback (3-20 chars, alphanumeric + underscore)
  - Add debounced username availability checking via isUsernameTaken query
  - Implement form submission via setUsername mutation
  - Handle success (close modal) and error states
  - _Properties: P5, P6, P7, P8_
  - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [x] 9. Integrate username modal into app flow
  - Add ModalSetUsername to home page
  - Query getCurrentUser to check username status
  - Show modal when authenticated AND username is null
  - Hide modal when username exists or not authenticated
  - _Properties: P5_
  - _Requirements: 3.1, 3.2_

- [x] 10. Checkpoint - Verify username flow
  - Test new user sign up → username dialog appears
  - Test existing user sign in with username → no dialog
  - Test username validation errors
  - Test username availability checking
  - Test successful username save
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Update username input to only accept lowercase
  - Modify modal-set-username.tsx to convert input to lowercase on change
  - _Requirements: 3.10_

- [x] 12. Update modal-auth.tsx to show/hide based on auth state
  - Hide "Login / Sign Up" button when user is authenticated
  - Show "Log Out of [username]" button when user is authenticated
  - Use useConvexAuth hook to check authentication state
  - Use getCurrentUser query to get username for display
  - Use useAuthActions signOut for logout functionality
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 13. Implement user-friendly error handling for authentication
  - Add getAuthErrorMessage helper function to map Convex error codes to user-friendly messages
  - Map InvalidAccountId, InvalidSecret, and credential errors to "Invalid email or password."
  - Map duplicate account errors to "An account with this email already exists."
  - Map weak password errors to "Password is too weak. Please use a stronger password."
  - Map invalid email errors to "Please enter a valid email address."
  - Update handleSignIn to use error mapping with default "Invalid email or password."
  - Update handleSignUp to use error mapping with default "Registration failed. Please try again."
  - _Properties: P9_
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

## Implementation Notes

- Use `bunx` instead of `npx` for all Convex CLI commands
- Keep `convex dev` running in a separate terminal during development
- The .env.local file is automatically created by `convex dev` - do not create manually
- ConvexClientProvider must be a client component ("use client" directive)
- The Convex deployment URL will be automatically populated during initialization
- All UI components must use shadcn/ui from `@/components/ui/*`
- Username comparison must be case-insensitive (store lowercase)
- Debounce username availability checks to reduce database queries

## Estimated Effort

- Total Tasks: 10 (7 new tasks added)
- Estimated Time: 2-3 hours
- Complexity: Medium
- Risk Level: Low

## Dependencies

- Bun package manager must be installed
- Internet connection required for Convex cloud
- Convex account (will be created during initialization if needed)
- Next.js app must be in working state
- shadcn Dialog, Input, Label, Button components (already installed)
