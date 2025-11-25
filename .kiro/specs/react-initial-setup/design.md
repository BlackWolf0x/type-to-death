# Initial React Setup with Vite, Tailwind CSS, and shadcn/ui - Design Document

## Overview

This design outlines the setup of a modern React development environment using Vite as the build tool, Tailwind CSS v4 for styling, and shadcn/ui for UI components. The setup prioritizes developer experience with fast hot module replacement, type safety with TypeScript, and a component-driven architecture.

**Key Design Decisions:**
- **Vite over Create React App**: Vite provides significantly faster development server startup and HMR
- **Tailwind CSS v4**: Uses CSS-based configuration instead of JavaScript config files, simplifying setup
- **shadcn/ui**: Components are copied into the project rather than installed as dependencies, allowing full customization
- **pnpm**: Faster and more disk-efficient than npm/yarn

## Architecture

### Project Structure

```
app/
├── src/
│   ├── components/
│   │   └── ui/              # shadcn/ui components (copied, not installed)
│   ├── lib/
│   │   └── utils.ts         # Utility functions (cn helper for class merging)
│   ├── App.tsx              # Root application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles with Tailwind import
├── public/                  # Static assets
├── index.html               # HTML entry point
├── vite.config.ts           # Vite configuration with plugins
├── tsconfig.json            # TypeScript base config with path aliases
├── tsconfig.app.json        # App-specific TypeScript config
├── tsconfig.node.json       # Node-specific TypeScript config
├── components.json          # shadcn/ui configuration
└── package.json             # Dependencies and scripts
```

### Build Pipeline

```
Source Files (*.tsx, *.ts)
    ↓
TypeScript Compiler (type checking)
    ↓
Vite Dev Server / Build
    ↓
Tailwind CSS Plugin (processes @import "tailwindcss")
    ↓
React Plugin (JSX transformation, Fast Refresh)
    ↓
Browser (development) / Optimized Bundle (production)
```

## Components and Interfaces

### Core Dependencies

**Runtime Dependencies:**
- `react` & `react-dom`: Core React library
- `tailwindcss` & `@tailwindcss/vite`: Styling framework (v4)
- `class-variance-authority`: Type-safe variant API for components
- `clsx`: Utility for constructing className strings
- `tailwind-merge`: Merge Tailwind classes without conflicts
- `lucide-react`: Icon library

**Development Dependencies:**
- `vite`: Build tool and dev server
- `@vitejs/plugin-react`: React support for Vite
- `typescript`: Type checking
- `@types/node`: Node.js type definitions (for path resolution)

### Configuration Interfaces

#### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),           // Enables JSX and Fast Refresh
    tailwindcss()      // Processes Tailwind directives
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')  // Enables @/ imports
    }
  }
})
```

**Design Rationale:**
- Plugin order matters: React plugin must process JSX before Tailwind processes styles
- Path alias `@/` is required for shadcn/ui components to resolve imports correctly

#### TypeScript Configuration

The TypeScript configuration uses a project references approach with three files:

1. **tsconfig.json** (base): Defines shared compiler options and path aliases
2. **tsconfig.app.json**: App-specific settings (includes src/)
3. **tsconfig.node.json**: Node-specific settings (includes vite.config.ts)

```json
// tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
    // ... other app-specific options
  }
}
```

**Design Rationale:**
- Path aliases must be defined in both tsconfig.json and tsconfig.app.json for proper resolution
- Project references allow different compiler settings for app code vs build config

#### shadcn/ui Configuration

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",              // Empty: v4 doesn't use config file
    "css": "src/index.css",    // Location of Tailwind import
    "baseColor": "slate",
    "cssVariables": true       // Use CSS variables for theming
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

**Design Rationale:**
- `rsc: false`: This is a client-side React app, not using React Server Components
- `cssVariables: true`: Enables theming through CSS custom properties
- Empty `config` field: Tailwind v4 doesn't use tailwind.config.js

## Data Models

### CSS Design Tokens

Tailwind CSS v4 uses CSS custom properties for theming instead of JavaScript configuration. All design tokens are defined in `src/index.css`:

```css
@import "tailwindcss";

@layer base {
  :root {
    --radius: 0.65rem;
    --background: oklch(1 0 0);
    --foreground: oklch(0.141 0.005 285.823);
    --primary: oklch(0.577 0.245 27.325);
    --primary-foreground: oklch(0.971 0.013 17.38);
    /* ... additional tokens */
  }

  .dark {
    --background: oklch(0.141 0.005 285.823);
    --foreground: oklch(0.985 0 0);
    /* ... dark mode overrides */
  }
}
```

**Design Rationale:**
- **OKLCH color space**: More perceptually uniform than RGB/HSL, better for programmatic color manipulation
- **CSS variables**: Enable runtime theme switching without rebuilding
- **Dark mode class**: Uses `.dark` class strategy for theme toggling
- **Semantic naming**: Variables like `--primary` and `--background` describe purpose, not color

### Component Utility Pattern

shadcn/ui components use a utility function for merging class names:

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Design Rationale:**
- `clsx`: Handles conditional classes and various input formats
- `twMerge`: Resolves Tailwind class conflicts (e.g., `px-2 px-4` → `px-4`)
- Named `cn` for brevity in component code

## Error Handling

### Build-Time Errors

**TypeScript Compilation Errors:**
- Path alias misconfiguration: Ensure both tsconfig.json and tsconfig.app.json include path mappings
- Missing type definitions: Install @types/node for path module

**Vite Configuration Errors:**
- Plugin order issues: React plugin must come before Tailwind plugin
- Path resolution failures: Verify `path.resolve(__dirname, './src')` syntax

### Runtime Errors

**Module Resolution:**
- `Cannot find module '@/...'`: Path aliases not configured correctly in both TypeScript and Vite configs
- Tailwind classes not applying: Verify `@import "tailwindcss"` is in index.css

**shadcn/ui Component Errors:**
- Missing dependencies: Ensure all peer dependencies are installed (class-variance-authority, clsx, tailwind-merge)
- Import path errors: Verify components.json aliases match actual directory structure

### Development Server Issues

**Port Conflicts:**
- Default port 5173 may be in use
- Vite will automatically try next available port

**Hot Module Replacement:**
- Fast Refresh requires proper React component naming (PascalCase)
- State may reset on certain file changes (expected behavior)

## Testing Strategy

### Manual Verification Steps

1. **Development Server:**
   - Run `pnpm run dev`
   - Verify server starts without errors
   - Check console for warnings

2. **Tailwind CSS:**
   - Add utility classes to App.tsx (e.g., `className="text-blue-500 font-bold"`)
   - Verify styles apply in browser
   - Confirm no tailwind.config.js file exists

3. **Path Aliases:**
   - Create a test file in src/components
   - Import using `@/components/...` syntax
   - Verify no TypeScript errors

4. **shadcn/ui Components:**
   - Add Button component: `pnpm dlx shadcn@latest add button`
   - Import and render in App.tsx
   - Verify component renders with proper styling
   - Test hover states and interactions

5. **TypeScript:**
   - Run `pnpm run build` to check for type errors
   - Verify no compilation errors

6. **Hot Module Replacement:**
   - Make changes to App.tsx while dev server is running
   - Verify changes reflect immediately without full page reload

### Validation Checklist

- [ ] `pnpm run dev` starts without errors
- [ ] Tailwind utility classes work correctly
- [ ] No tailwind.config.js file present
- [ ] `@/` imports resolve correctly
- [ ] shadcn/ui Button component renders
- [ ] TypeScript compilation succeeds
- [ ] HMR updates components without full reload
- [ ] Dark mode toggle works (if implemented)

## Implementation Phases

### Phase 1: Project Initialization
Create base Vite + React + TypeScript project and verify it runs.

### Phase 2: Tailwind CSS Integration
Add Tailwind CSS v4 with Vite plugin and verify utility classes work.

### Phase 3: Path Alias Configuration
Configure TypeScript and Vite for `@/` imports to enable shadcn/ui.

### Phase 4: shadcn/ui Setup
Initialize shadcn/ui and add a test component to verify full integration.

## Design Decisions Summary

| Decision | Rationale |
|----------|-----------|
| Vite over CRA | 10-100x faster dev server, native ESM, better DX |
| Tailwind v4 | Simpler setup with CSS-based config, better performance |
| shadcn/ui copy approach | Full component customization, no version lock-in |
| OKLCH color space | Perceptually uniform, better for programmatic manipulation |
| CSS variables for theming | Runtime theme switching without rebuild |
| pnpm package manager | Faster installs, better disk efficiency |
| TypeScript project references | Separate compiler settings for app vs config |
| Path aliases (@/) | Required for shadcn/ui, improves import readability |