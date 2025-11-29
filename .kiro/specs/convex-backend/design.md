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

### 2. ConvexClientProvider Component

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

### 3. Root Layout Integration

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

### 4. Environment Configuration

Location: `app-next/.env.local`

```
NEXT_PUBLIC_CONVEX_URL=<deployment-url>
```

**Responsibilities:**
- Store Convex deployment URL
- Automatically populated by `convex dev`

### 5. Convex Configuration

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
│   ├── ConvexClientProvider.tsx (NEW)
│   └── layout.tsx (MODIFIED)
├── convex/ (NEW)
│   └── (Convex functions will go here)
├── .env.local (NEW, gitignored)
├── convex.json (NEW)
└── package.json (MODIFIED)
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

## Future Enhancements (Out of Scope)

- Database schema definitions
- Convex functions for game logic (scores, leaderboards)
- Authentication with Convex Auth
- File storage integration
- Production deployment configuration
- Monitoring and analytics setup
