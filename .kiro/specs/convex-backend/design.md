# Convex Backend - Design

## Overview

This design outlines the integration of Convex as the backend infrastructure for the Type to Death Next.js application. The implementation follows the official Convex Next.js quickstart guide and uses Bun as the package manager.

## Architecture

The Convex integration consists of three main layers:

1. **Convex Cloud Backend** - Hosted Convex deployment providing database and serverless functions
2. **Convex Client** - React provider and hooks for accessing backend from Next.js components
3. **Convex Functions** - TypeScript functions in `convex/` directory that run on the backend

### Component Responsibilities

1. **ConvexProvider** - Wraps the Next.js app to provide Convex client context
2. **ConvexClientProvider** - Client-side provider component for App Router
3. **Environment Configuration** - Stores Convex deployment URL
4. **Convex Directory** - Contains backend functions and schema definitions

## Components and Interfaces

### 1. Package Dependencies

```json
{
  "dependencies": {
    "convex": "^latest"
  }
}
```

### 2. Convex Functions for Username Management

Location: `app-next/convex/users.ts`

```typescript
// Query to get current user with username
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();
    
    return user;
  },
});

// Query to check if username is taken
export const isUsernameTaken = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), username.toLowerCase()))
      .first();
    return !!existing;
  },
});

// Mutation to set username
export const setUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    // Validation and save logic
  },
});
```

**Responsibilities:**
- Query current user's profile including username
- Check username availability across all users
- Save username to user's profile with validation

### 3. ModalSetUsername Component

Location: `app-next/components/modal-set-username.tsx`

```typescript
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ModalSetUsernameProps {
  isOpen: boolean;
}

export function ModalSetUsername({ isOpen }: ModalSetUsernameProps) {
  // Uses shadcn Dialog with onOpenChange returning early to prevent closing
  // No DialogClose or X button rendered
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Set Your Username</DialogTitle>
          <DialogDescription>
            Choose a unique username to continue.
          </DialogDescription>
        </DialogHeader>
        {/* Form with Input, validation feedback, and Button */}
      </DialogContent>
    </Dialog>
  );
}
```

**Responsibilities:**
- Display forced modal when user has no username (uses shadcn Dialog)
- Validate username format (3-20 chars, alphanumeric + underscore)
- Check username availability via Convex query
- Submit username via Convex mutation (uses shadcn Button)
- Form input using shadcn Input and Label components
- Close only after successful username save

**shadcn Components Used:**
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` from `@/components/ui/dialog`
- `Button` from `@/components/ui/button`
- `Input` from `@/components/ui/input`
- `Label` from `@/components/ui/label`

### 4. ConvexClientProvider Component

Location: `app-next/app/ConvexClientProvider.tsx`

```typescript
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

**Responsibilities:**
- Create Convex client instance with deployment URL
- Provide Convex context to all child components
- Must be a client component ("use client")

### 5. Root Layout Integration

Location: `app-next/app/layout.tsx`

```typescript
import { ConvexClientProvider } from "./ConvexClientProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

**Responsibilities:**
- Wrap entire app with ConvexClientProvider
- Ensure all pages have access to Convex client

### 6. Environment Configuration

Location: `app-next/.env.local`

```
NEXT_PUBLIC_CONVEX_URL=<deployment-url>
```

**Responsibilities:**
- Store Convex deployment URL
- Automatically populated by `convex dev`

### 7. Convex Configuration

Location: `app-next/convex.json`

```json
{
  "functions": "convex/"
}
```

**Responsibilities:**
- Define location of Convex functions directory
- Configure Convex project settings

## Data Models

### Configuration Variables

```typescript
// Environment variable
NEXT_PUBLIC_CONVEX_URL: string
```

### Runtime State

```typescript
// Convex client instance
convex: ConvexReactClient

// Provider props
interface ConvexClientProviderProps {
  children: ReactNode;
}
```

### Username Data Model

```typescript
// User schema (already exists in convex/schema.ts)
users: defineTable({
  username: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
}).index("email", ["email"])
  .index("username", ["username"]), // Add index for username lookups

// Username validation constants
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
```

### Username Modal State

```typescript
interface UsernameModalState {
  username: string;
  isChecking: boolean;
  isSaving: boolean;
  error: string | null;
  isAvailable: boolean | null;
}
```

## Core Algorithms

### 1. Installation Process

```
1. Navigate to app-next directory
2. Run: bun install convex
3. Run: bunx convex dev
4. Follow prompts to:
   - Create/select Convex project
   - Configure deployment
   - Generate .env.local with deployment URL
5. Convex creates convex/ directory with example files
```

### 2. Client Initialization

```
1. Import ConvexReactClient from convex/react
2. Read NEXT_PUBLIC_CONVEX_URL from environment
3. Create new ConvexReactClient instance with URL
4. Pass client to ConvexProvider
5. Wrap app with provider
```

### 3. Development Server Sync

```
1. Run: bunx convex dev
2. Convex watches convex/ directory for changes
3. On file change:
   - Validate TypeScript functions
   - Push to Convex cloud
   - Update deployment
4. Provide real-time sync feedback
```

### 4. Username Setup Flow

```
1. User signs in successfully
2. App queries getCurrentUser to check if username exists
3. IF username is null/undefined:
   - Display UsernameSetupModal (forced, non-dismissible)
   - User enters desired username
4. On username input change (debounced):
   - Validate format (3-20 chars, alphanumeric + underscore)
   - IF valid format, query isUsernameTaken
   - Display availability status
5. On submit:
   - Call setUsername mutation
   - IF success, close modal
   - IF error (race condition - taken), show error
```

### 5. Username Validation Algorithm

```
validateUsername(username: string):
  1. Trim whitespace
  2. Check length >= 3 AND <= 20
  3. Check matches pattern /^[a-zA-Z0-9_]+$/
  4. Return { valid: boolean, error?: string }
```

### 6. Username Uniqueness Check

```
isUsernameTaken(username: string):
  1. Convert username to lowercase for case-insensitive check
  2. Query users table for matching username
  3. Return true if found, false otherwise
```

### 7. Set Username Mutation

```
setUsername(username: string):
  1. Get authenticated user identity
  2. Validate username format
  3. Check username not already taken (race condition protection)
  4. Get user document by email
  5. Check user doesn't already have a username
  6. Update user document with lowercase username
  7. Return success
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### P1: Successful Installation
**Property:** For any Next.js project in the app-next directory, running `bun install convex` should successfully add Convex to dependencies without errors
**Verification:** Check package.json contains convex dependency and node_modules includes convex package
**Covers:** Requirements 1.1

### P2: Convex Dev Initialization
**Property:** For any properly configured project, running `bunx convex dev` should create necessary configuration files and start the development server
**Verification:** Verify .env.local exists with NEXT_PUBLIC_CONVEX_URL and convex/ directory is created
**Covers:** Requirements 1.2, 1.3

### P3: Provider Configuration
**Property:** For any Next.js app with ConvexClientProvider wrapping the root, all child components should have access to the Convex client
**Verification:** Components can successfully use Convex hooks (useQuery, useMutation) without errors
**Covers:** Requirements 2.1, 2.3

### P4: Environment Variable Loading
**Property:** For any deployment URL in .env.local, the Convex client should successfully connect using that URL
**Verification:** ConvexReactClient initializes without throwing errors and can communicate with backend
**Covers:** Requirements 2.2, 2.3

### P5: Username Dialog Visibility
**Property:** *For any* authenticated user, the username setup dialog is displayed if and only if the user has no username set
**Verification:** Query user, check username field, verify dialog visibility matches (username === null/undefined)
**Covers:** Requirements 3.1, 3.2

### P6: Username Validation Rules
**Property:** *For any* string input, the username validation passes if and only if the string is 3-20 characters long and contains only alphanumeric characters and underscores
**Verification:** Test with strings of various lengths and character sets, verify validation result matches expected
**Covers:** Requirements 3.8, 3.9

### P7: Username Uniqueness Enforcement
**Property:** *For any* username that already exists in the database, attempting to set that username for another user should fail with an appropriate error
**Verification:** Create user with username, attempt to set same username for different user, verify error is returned
**Covers:** Requirements 3.4, 3.5

### P8: Username Save Success
**Property:** *For any* valid and available username, calling setUsername should successfully save the username to the user's profile
**Verification:** Call setUsername with valid available username, query user, verify username is saved
**Covers:** Requirements 3.6, 3.7

## Integration Points

### Existing Next.js App Structure

The Convex integration modifies:

1. **app-next/app/layout.tsx**
   - Add import for ConvexClientProvider
   - Wrap children with provider

2. **app-next/ (root)**
   - Add .env.local (gitignored)
   - Add convex/ directory
   - Add convex.json

### File Structure After Integration

```
app-next/
├── app/
│   ├── ConvexClientProvider.tsx
│   └── layout.tsx
├── components/
│   ├── modal-auth.tsx
│   └── modal-set-username.tsx (NEW)
├── convex/
│   ├── auth.ts
│   ├── schema.ts (MODIFIED - add username index)
│   └── users.ts (NEW)
├── .env.local (gitignored)
├── convex.json
└── package.json
```

## Edge Cases

### E1: Missing Environment Variable
**Scenario:** NEXT_PUBLIC_CONVEX_URL is not set or invalid
**Handling:** ConvexReactClient will throw error on initialization. Provide clear error message directing developer to run `convex dev`

### E2: Convex Dev Not Running
**Scenario:** Developer tries to use Convex features without running `convex dev`
**Handling:** Functions won't sync to cloud. Development server should be running during development

### E3: Network Issues During Setup
**Scenario:** Internet connection fails during `convex dev` initialization
**Handling:** Convex CLI will show connection error. Developer should retry when connection is restored

### E4: Bun Compatibility
**Scenario:** Convex CLI might expect npm/pnpm/yarn
**Handling:** Use `bunx` instead of `npx` for running Convex commands

### E5: Username Race Condition
**Scenario:** Two users try to claim the same username simultaneously
**Handling:** The setUsername mutation performs a final uniqueness check before saving. Second user receives error message.

### E6: Username Case Sensitivity
**Scenario:** User tries "JohnDoe" when "johndoe" already exists
**Handling:** Usernames are stored and compared in lowercase to prevent case-based duplicates

### E7: User Already Has Username
**Scenario:** User with existing username somehow triggers the username setup flow
**Handling:** setUsername mutation checks if user already has a username and rejects if so

### E8: Unauthenticated Username Attempt
**Scenario:** Unauthenticated request tries to set username
**Handling:** Convex auth middleware rejects the request before mutation executes

## Performance Considerations

- Convex client is initialized once at app startup
- Real-time subscriptions are efficient and only re-render on data changes
- Development server sync is fast (typically < 1 second)
- No impact on existing app performance during installation

## Testing Strategy

### Manual Testing

1. **Installation Test**
   - Navigate to app-next directory
   - Run `bun install convex`
   - Verify convex appears in package.json
   - Verify no installation errors

2. **Initialization Test**
   - Run `bunx convex dev`
   - Verify Convex prompts appear
   - Complete setup flow
   - Verify .env.local created with URL
   - Verify convex/ directory created

3. **Provider Test**
   - Create ConvexClientProvider component
   - Add to layout.tsx
   - Start Next.js dev server
   - Verify no console errors
   - Verify app loads successfully

4. **Connection Test**
   - Verify `convex dev` is running
   - Verify Next.js app is running
   - Check browser console for Convex connection
   - Verify no connection errors

### Edge Case Testing

1. **Missing URL Test**
   - Remove NEXT_PUBLIC_CONVEX_URL from .env.local
   - Start app
   - Verify clear error message appears

2. **Invalid URL Test**
   - Set invalid URL in .env.local
   - Start app
   - Verify connection error is handled gracefully

### Username Feature Testing

1. **New User Flow Test**
   - Sign up with new account
   - Verify username dialog appears immediately
   - Verify dialog cannot be closed (no X button, clicking outside doesn't close)
   - Enter valid username
   - Verify dialog closes after save

2. **Existing User Flow Test**
   - Sign in with account that has username
   - Verify username dialog does NOT appear
   - Verify user can proceed normally

3. **Username Validation Test**
   - Enter username with < 3 characters → error shown
   - Enter username with > 20 characters → error shown
   - Enter username with special characters → error shown
   - Enter valid username → no validation error

4. **Username Availability Test**
   - Enter username that exists → "username taken" error
   - Enter unique username → "available" indicator
   - Verify debounced checking (not on every keystroke)

5. **Race Condition Test**
   - Open two browser windows with new accounts
   - Enter same username in both
   - Submit both simultaneously
   - Verify one succeeds, one fails with appropriate error

## Future Enhancements (Out of Scope)

- Convex functions for game logic (scores, leaderboards)
- File storage integration
- Production deployment configuration
- Monitoring and analytics setup
- Username change functionality
- Profile picture/avatar selection
- Username display name (separate from unique username)
