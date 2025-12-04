# Next.js Setup - Design

## Architecture Overview

This design outlines the configuration and setup of a Next.js 16 application with TypeScript, Tailwind CSS v4, and shadcn/ui components. The setup focuses on establishing a solid foundation for UI development using modern Next.js features and best practices.

**Main Components:**

1. **Next.js Configuration** - TypeScript paths, import aliases, and Next.js settings
2. **Tailwind CSS Configuration** - CSS variables, theme customization, and utility classes
3. **shadcn/ui Integration** - Component library setup with New York style variant
4. **Development Environment** - Scripts and tooling for efficient development
5. **Application Routing** - File-based routing structure for game flow pages

## Component Structure

### 1. shadcn/ui CLI

**Responsibilities:**
- Initialize shadcn/ui configuration
- Set up import aliases automatically
- Configure Tailwind CSS with CSS variables
- Create utility functions for component styling
- Install and configure required dependencies

**Dependencies:**
- shadcn/ui CLI (via bunx)
- Radix UI primitives (installed automatically)
- Lucide React icons (installed automatically)
- class-variance-authority (installed automatically)
- clsx and tailwind-merge (installed automatically)

**Generated Files:**
- `components.json` - shadcn/ui configuration
- `app/lib/utils.ts` - Utility functions (cn helper)
- Updated `tsconfig.json` - Import aliases
- Updated `app/globals.css` - CSS variables and theme

### 2. Next.js Application

**Responsibilities:**
- Provide the App Router structure
- Host shadcn/ui components
- Serve the application in development and production

**Dependencies:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4

**Existing Files:**
- `app/layout.tsx` - Root layout component
- `app/page.tsx` - Home page component (main menu)
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `app/globals.css` - Global styles

### 3. Application Routes

**Responsibilities:**
- Define the application's page structure
- Implement file-based routing using App Router
- Provide distinct pages for each game stage

**Route Structure:**
```
app/
├── page.tsx              # Main menu (/)
├── permission/
│   └── page.tsx          # Webcam permission request (/permission)
├── calibration/
│   └── page.tsx          # Blink calibration (/calibration)
└── play/
    └── page.tsx          # Game play (/play)
```

**Page Responsibilities:**
- **Main Menu (`/`)**: Entry point, game start, settings access
- **Permission (`/permission`)**: Request webcam access, handle permissions
- **Calibration (`/calibration`)**: Blink detection calibration, sensitivity adjustment
- **Play (`/play`)**: Active gameplay with typing challenges and monster

### 4. Mobile Warning Component

**Responsibilities:**
- Detect viewport width using client-side hooks
- Display warning message when viewport is below 768px
- Hide warning when viewport is resized to desktop size
- Provide consistent styling across all pages
- Not block page content (non-modal)

**Dependencies:**
- React hooks (useState, useEffect)
- Tailwind CSS for responsive styling
- shadcn/ui Alert component (optional)

**Component Structure:**
```typescript
// components/MobileWarning.tsx
'use client'

export function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    // Check initial viewport
    // Add resize listener
    // Cleanup on unmount
  }, [])
  
  if (!isMobile) return null
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Warning message */}
    </div>
  )
}
```

**Integration:**
- Add to root layout (`app/layout.tsx`) to appear on all pages
- Use `'use client'` directive for client-side rendering
- Position fixed at top of viewport
- High z-index to stay above content

## Data Models

### shadcn/ui Configuration

The shadcn CLI will generate a `components.json` file with the following key settings:
- **style**: "new-york" - Component style variant
- **rsc**: true - React Server Components support
- **tsx**: true - TypeScript support
- **baseColor**: "neutral" - Theme base color
- **cssVariables**: true - Use CSS variables for theming

The CLI will also automatically configure:
- Import aliases in `tsconfig.json`
- CSS variables in `app/globals.css`
- Utility functions in `app/lib/utils.ts`

### Runtime State

No runtime state is managed by the setup itself. This is purely configuration.



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Import Alias Resolution

*For any* file in the project using the `@/` import alias, TypeScript should correctly resolve the path to the project root and provide proper IntelliSense support.

**Validates: Requirements 1.3**

### Property 2: Route Accessibility

*For any* defined route in the application (`/`, `/permission`, `/calibration`, `/play`), navigating to that route should render the corresponding page component without errors.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

### Property 3: Mobile Warning Visibility

*For any* viewport width less than 768 pixels, the mobile warning component should be visible on all pages, and *for any* viewport width greater than or equal to 768 pixels, the warning should be hidden.

**Validates: Requirements 5.1, 5.4**

### Property 4: Warning Message Content

*For any* page where the mobile warning is displayed, the warning message should inform users that the game is optimized for desktop with keyboard.

**Validates: Requirements 5.2**

### Property 5: Non-Blocking Warning Display

*For any* page where the mobile warning is displayed, the warning should remain visible but not block the entire page content.

**Validates: Requirements 5.3**

## Edge Cases

### E1: Missing Configuration Files
**Scenario:** shadcn/ui initialization fails if components.json doesn't exist
**Handling:** The shadcn CLI will create components.json during initialization. If it's missing later, shadcn commands will fail with clear error messages.

### E2: Conflicting Tailwind Versions
**Scenario:** Project has Tailwind CSS v3 instead of v4
**Handling:** Verify package.json shows Tailwind CSS v4. If v3 is present, upgrade to v4 before proceeding with shadcn/ui setup.

### E3: Import Alias Not Working
**Scenario:** TypeScript doesn't recognize @/ imports
**Handling:** Verify tsconfig.json has correct paths configuration. Restart TypeScript server in IDE if needed.

### E4: Bun Lock File Conflicts
**Scenario:** Multiple package managers used (npm, yarn, pnpm, bun)
**Handling:** Remove all lock files except bun.lock. Use only Bun for package management.

### E5: Invalid Route Access
**Scenario:** User navigates to a non-existent route
**Handling:** Next.js will automatically show a 404 page. Custom 404 page can be added later if needed.

### E6: Viewport Resize During Gameplay
**Scenario:** User resizes browser window from desktop to mobile size during active gameplay
**Handling:** Warning appears immediately via resize listener. Game continues to function but warning informs user of suboptimal experience.

### E7: Server-Side Rendering of Client Component
**Scenario:** Mobile warning component needs client-side hooks but Next.js uses SSR
**Handling:** Use 'use client' directive to mark component as client-side only. Initial render may show no warning, then hydration will show it if viewport is mobile.



## Core Algorithms

### 1. Viewport Width Detection

```
Algorithm: detectMobileViewport()
1. Get current window.innerWidth
2. Compare width to MOBILE_BREAKPOINT (768px)
3. If width < 768px:
   - Set isMobile state to true
4. Else:
   - Set isMobile state to false
5. Return isMobile state
```

### 2. Resize Event Handling

```
Algorithm: handleResize()
1. Add event listener to window 'resize' event
2. On resize:
   - Call detectMobileViewport()
   - Update component state
3. On component unmount:
   - Remove event listener to prevent memory leaks
```

## Integration Points

### Existing Next.js Installation

The project already has Next.js 16.0.5 installed with:
- React 19
- TypeScript
- Tailwind CSS v4
- ESLint
- Bun as package manager

**Integration Approach:**
- Run shadcn CLI which will automatically integrate with existing setup
- CLI detects Next.js and Tailwind CSS configuration
- CLI updates necessary files (tsconfig.json, globals.css)
- No manual configuration changes needed

### Files Modified by shadcn CLI

The shadcn CLI will automatically modify:
- `tsconfig.json` - Adds import alias paths
- `app/globals.css` - Adds CSS variables for theming

### Files Created by shadcn CLI

The shadcn CLI will automatically create:
- `components.json` - shadcn/ui configuration
- `app/lib/utils.ts` - Utility functions (cn helper)
- `components/ui/` - Directory for shadcn components (when first component is added)

### Mobile Warning Integration

The mobile warning component will be integrated into:
- `app/layout.tsx` - Root layout to appear on all pages
- Positioned as a fixed element at the top of the viewport
- Uses Tailwind CSS responsive utilities for styling
- Optional: Uses shadcn/ui Alert component for consistent styling

## Performance Considerations

- **Resize Event Throttling**: Consider debouncing resize events to avoid excessive re-renders
- **Client-Side Only**: Mobile warning uses client-side rendering to access window object
- **Minimal Bundle Impact**: Component is small and only loads on client
- **No Layout Shift**: Fixed positioning prevents content layout shifts

## Testing Strategy

### Manual Testing

1. **Desktop View (≥768px)**
   - Open application in desktop browser
   - Verify no warning is displayed
   - Navigate to all routes (/, /permission, /calibration, /play)
   - Confirm no warning appears on any page

2. **Mobile View (<768px)**
   - Open application in mobile browser or use browser dev tools
   - Set viewport to 375px width (iPhone size)
   - Verify warning is displayed at top of page
   - Verify warning message mentions "desktop" and "keyboard"
   - Navigate to all routes
   - Confirm warning appears consistently on all pages

3. **Resize Behavior**
   - Start with desktop viewport (1024px)
   - Verify no warning
   - Resize to mobile viewport (375px)
   - Verify warning appears immediately
   - Resize back to desktop (1024px)
   - Verify warning disappears immediately

4. **Warning Content**
   - Verify warning is visible but doesn't block page content
   - Verify warning has appropriate styling (color, padding, etc.)
   - Verify text is readable and clear

### Edge Case Testing

1. **Exactly 768px width**
   - Set viewport to exactly 768px
   - Verify warning does NOT appear (boundary condition)

2. **767px width**
   - Set viewport to 767px
   - Verify warning DOES appear (just below threshold)

3. **Rapid Resize**
   - Rapidly resize window between mobile and desktop sizes
   - Verify warning appears/disappears correctly without errors

## Future Enhancements (Out of Scope)

- Dismissible warning with localStorage persistence
- Custom warning messages per page
- Animation transitions for warning appearance/disappearance
- Tablet-specific messaging (768px-1024px range)
- Warning analytics tracking


