# Import Aliases Standards

## Overview

This project uses TypeScript path aliases to simplify imports and maintain clean, maintainable code. All imports MUST use the `@/` alias instead of relative paths.

## Core Principle

**Always use `@/` aliases for internal imports. Never use relative paths.**

## Configuration

The project is configured with the following path aliases:

```json
{
  "@/*": ["./src/*"]
}
```

This is defined in:
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite bundler configuration

## Import Rules

### ✅ Correct Usage

```typescript
// Components
import { Button } from "@/components/ui/button";
import { MainMenu } from "@/components/main-menu/MainMenu";
import { Game } from "@/components/game/Game";

// Stores
import { useAppStore } from "@/stores/appStore";

// Utils
import { cn } from "@/lib/utils";

// Types (if you have them)
import type { User } from "@/types/user";

// Hooks (if you have them)
import { useAuth } from "@/hooks/useAuth";
```

### ❌ Wrong Usage

```typescript
// Never use relative paths
import { Button } from "../ui/button";
import { Button } from "../../components/ui/button";
import { Button } from "../../../components/ui/button";

// Never use relative paths for stores
import { useAppStore } from "../../stores/appStore";

// Never use relative paths for utils
import { cn } from "../lib/utils";
```

## Import Organization

Organize imports in the following order:

1. **External libraries** (React, third-party packages)
2. **Internal components** (using `@/` aliases)
3. **Internal utilities** (using `@/` aliases)
4. **Internal stores** (using `@/` aliases)
5. **Types** (using `@/` aliases)
6. **Styles** (relative paths are OK for CSS in same directory)

### Example

```typescript
// 1. External libraries
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// 2. Internal components
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { MainMenu } from "@/components/main-menu/MainMenu";

// 3. Internal utilities
import { cn } from "@/lib/utils";

// 4. Internal stores
import { useAppStore } from "@/stores/appStore";

// 5. Types
import type { User } from "@/types/user";

// 6. Styles (relative OK for same directory)
import "./App.css";
```

## Benefits of Using Aliases

1. **Readability** - `@/components/ui/button` is clearer than `../../../components/ui/button`
2. **Refactoring** - Moving files doesn't break imports
3. **Consistency** - All imports look the same regardless of file location
4. **IDE Support** - Better autocomplete and navigation
5. **Maintainability** - Easier to understand project structure

## Common Patterns

### Component Imports

```typescript
// UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Feature components
import { MainMenu } from "@/components/main-menu/MainMenu";
import { Game } from "@/components/game/Game";
import { UnityGame } from "@/components/unity/UnityGame";

// Modal components
import { IntroModal } from "@/components/modals/IntroModal";
import { EyeTrackingModal } from "@/components/modals/EyeTrackingModal";
```

### Store Imports

```typescript
// Zustand stores
import { useAppStore } from "@/stores/appStore";

// Specific selectors (recommended for performance)
const showMainMenu = useAppStore((state) => state.showMainMenu);
const hideMainMenu = useAppStore((state) => state.hideMainMenu);
```

### Utility Imports

```typescript
// Utility functions
import { cn } from "@/lib/utils";

// Helper functions
import { formatDate } from "@/lib/formatters";
import { validateEmail } from "@/lib/validators";
```

## Migration Guide

If you find code with relative imports, convert them to aliases:

### Before
```typescript
import { Button } from "../ui/button";
import { useAppStore } from "../../stores/appStore";
import { cn } from "../../lib/utils";
```

### After
```typescript
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";
```

## IDE Configuration

Most modern IDEs automatically recognize the `@/` alias from `tsconfig.json`. If autocomplete isn't working:

1. **VS Code**: Restart the TypeScript server (Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")
2. **WebStorm**: Invalidate caches and restart
3. **Cursor**: Same as VS Code

## Exceptions

The only acceptable relative imports are:

1. **CSS files in the same directory**
   ```typescript
   import "./App.css";
   import "./styles.module.css";
   ```

2. **Assets in the same directory** (though `@/assets` is preferred)
   ```typescript
   import logo from "./logo.svg"; // OK but not preferred
   import logo from "@/assets/logo.svg"; // Preferred
   ```

## Enforcement

- All new code MUST use `@/` aliases
- When refactoring existing code, convert relative imports to aliases
- Code reviews should flag relative imports for internal modules
- TypeScript will validate that imports resolve correctly

## Quick Reference

| Import Type | Alias Pattern | Example |
|-------------|---------------|---------|
| UI Components | `@/components/ui/*` | `@/components/ui/button` |
| Feature Components | `@/components/*` | `@/components/main-menu/MainMenu` |
| Stores | `@/stores/*` | `@/stores/appStore` |
| Utilities | `@/lib/*` | `@/lib/utils` |
| Hooks | `@/hooks/*` | `@/hooks/useAuth` |
| Types | `@/types/*` | `@/types/user` |
| Assets | `@/assets/*` | `@/assets/logo.svg` |

## Summary

- ✅ Always use `@/` for internal imports
- ❌ Never use relative paths like `../` or `../../`
- 📁 Organize imports by category (external → internal → styles)
- 🔄 Convert relative imports when refactoring
- 🎯 Exceptions: CSS files and assets in same directory (but aliases preferred)
