# Initial React Setup with Vite, Tailwind CSS, and shadcn/ui

## Overview
Set up a modern React development environment using Vite, Tailwind CSS (v4), and shadcn/ui component library.

## User Stories

### US-1: Project Initialization
**As a** developer  
**I want** to create a new React + TypeScript project using Vite  
**So that** I have a fast development environment with modern tooling

**Acceptance Criteria:**
- Project created using `pnpm create vite@latest app`
- React template selected
- TypeScript variant selected
- Dependencies installed with `pnpm install`
- Dev server runs successfully with `pnpm run dev`

### US-2: Tailwind CSS Integration
**As a** developer  
**I want** to integrate Tailwind CSS v4 into the Vite project  
**So that** I can use utility-first CSS styling without a config file

**Acceptance Criteria:**
- Tailwind CSS installed via `pnpm add tailwindcss @tailwindcss/vite`
- Vite config updated to include Tailwind plugin
- src/index.css replaced entirely with `@import "tailwindcss";`
- Tailwind utilities work in components
- NO tailwind.config.js file created (v4 uses CSS-based configuration)

### US-3: shadcn/ui Setup
**As a** developer  
**I want** to set up shadcn/ui component library  
**So that** I can use pre-built, customizable UI components

**Acceptance Criteria:**
- Path aliases configured in tsconfig.json for `@/` imports
- shadcn/ui initialized using `pnpm dlx shadcn@latest init`
- components.json created with Vite configuration
- Design tokens (CSS variables) added to globals.css, NOT in tailwind.config.ts
- At least one component added to verify setup (e.g., Button)
- Component renders successfully in the app

## Technical Requirements

### Project Structure
```
app/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   ├── lib/
│   │   └── utils.ts     # shadcn utilities
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css        # Tailwind imports
├── public/
├── index.html
├── vite.config.ts       # Vite + Tailwind plugin
├── tsconfig.json        # Path aliases
├── tsconfig.app.json
├── components.json      # shadcn config
└── package.json
```

### Dependencies
**Core:**
- react (latest)
- react-dom (latest)
- typescript (latest)

**Build Tools:**
- vite (latest)
- @vitejs/plugin-react (latest)

**Styling:**
- tailwindcss (v4)
- @tailwindcss/vite

**shadcn/ui Dependencies:**
- class-variance-authority
- clsx
- tailwind-merge
- lucide-react (for icons)

### Configuration Files

#### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

#### tsconfig.json (path aliases)
```json
{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### tsconfig.app.json (path aliases)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### src/index.css (or globals.css)
```css
@import "tailwindcss";

@layer base {
  :root {
    --radius: 0.65rem;
    --background: oklch(1 0 0);
    --foreground: oklch(0.141 0.005 285.823);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.141 0.005 285.823);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.141 0.005 285.823);
    --primary: oklch(0.577 0.245 27.325);
    --primary-foreground: oklch(0.971 0.013 17.38);
    --secondary: oklch(0.967 0.001 286.375);
    --secondary-foreground: oklch(0.21 0.006 285.885);
    --muted: oklch(0.967 0.001 286.375);
    --muted-foreground: oklch(0.552 0.016 285.938);
    --accent: oklch(0.967 0.001 286.375);
    --accent-foreground: oklch(0.21 0.006 285.885);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.92 0.004 286.32);
    --input: oklch(0.92 0.004 286.32);
    --ring: oklch(0.704 0.191 22.216);
    --chart-1: oklch(0.808 0.114 19.571);
    --chart-2: oklch(0.637 0.237 25.331);
    --chart-3: oklch(0.577 0.245 27.325);
    --chart-4: oklch(0.505 0.213 27.518);
    --chart-5: oklch(0.444 0.177 26.899);
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.141 0.005 285.823);
    --sidebar-primary: oklch(0.577 0.245 27.325);
    --sidebar-primary-foreground: oklch(0.971 0.013 17.38);
    --sidebar-accent: oklch(0.967 0.001 286.375);
    --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
    --sidebar-border: oklch(0.92 0.004 286.32);
    --sidebar-ring: oklch(0.704 0.191 22.216);
  }

  .dark {
    --background: oklch(0.141 0.005 285.823);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.21 0.006 285.885);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.21 0.006 285.885);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.637 0.237 25.331);
    --primary-foreground: oklch(0.971 0.013 17.38);
    --secondary: oklch(0.274 0.006 286.033);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.274 0.006 286.033);
    --muted-foreground: oklch(0.705 0.015 286.067);
    --accent: oklch(0.274 0.006 286.033);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.396 0.141 25.723);
    --chart-1: oklch(0.808 0.114 19.571);
    --chart-2: oklch(0.637 0.237 25.331);
    --chart-3: oklch(0.577 0.245 27.325);
    --chart-4: oklch(0.505 0.213 27.518);
    --chart-5: oklch(0.444 0.177 26.899);
    --sidebar: oklch(0.21 0.006 285.885);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.637 0.237 25.331);
    --sidebar-primary-foreground: oklch(0.971 0.013 17.38);
    --sidebar-accent: oklch(0.274 0.006 286.033);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.396 0.141 25.723);
  }
}
```

#### components.json (shadcn config)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

## Implementation Steps

1. **Create Vite Project**
   - Run `pnpm create vite@latest app`
   - Select React framework
   - Select TypeScript variant
   - Navigate to app directory
   - Run `pnpm install`

2. **Install Tailwind CSS v4**
   - Run `pnpm add tailwindcss @tailwindcss/vite`
   - Update vite.config.ts to include Tailwind plugin
   - Replace everything in src/index.css with `@import "tailwindcss";`
   - Verify Tailwind works by adding utility classes to App.tsx

3. **Configure Path Aliases**
   - Install @types/node: `pnpm add -D @types/node`
   - Update tsconfig.json with baseUrl and paths in compilerOptions
   - Update tsconfig.app.json with baseUrl and paths in compilerOptions
   - Update vite.config.ts with path alias resolution using path.resolve

4. **Initialize shadcn/ui**
   - Run `pnpm dlx shadcn@latest init`
   - Choose base color (e.g., Neutral or Slate)
   - Verify components.json is created with correct paths

5. **Add Test Component**
   - Run `pnpm dlx shadcn@latest add button`
   - Import and use Button in App.tsx
   - Verify component renders with proper styling

## Validation Criteria

- [ ] `pnpm run dev` starts development server without errors
- [ ] Tailwind utility classes apply correctly
- [ ] No tailwind.config.js file exists (v4 uses CSS-based config)
- [ ] Path aliases (@/) resolve correctly
- [ ] shadcn/ui Button component renders
- [ ] TypeScript compilation has no errors
- [ ] Hot module replacement works

## References

- [Tailwind CSS v4 with Vite](https://tailwindcss.com/docs/installation/using-vite)
- [shadcn/ui Vite Installation](https://ui.shadcn.com/docs/installation/vite)
- [Vite Official Guide](https://vitejs.dev/guide/)

## Notes

- Tailwind CSS v4 is a major change - no config file needed, configuration is done via CSS
- shadcn/ui components are copied into your project, not installed as a dependency
- Path aliases are required for shadcn/ui to work properly
