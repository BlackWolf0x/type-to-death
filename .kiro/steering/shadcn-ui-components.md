# shadcn/ui Component Standards

## Overview

This project uses [shadcn/ui](https://ui.shadcn.com/) as the primary UI component library. All frontend UI components MUST use shadcn/ui components as the foundation.

## Core Principles

1. **Always use shadcn/ui first** - Before creating custom UI components, check if shadcn/ui has a suitable component
2. **Never reinvent the wheel** - Don't build custom buttons, inputs, dialogs, etc. when shadcn provides them
3. **Extend, don't replace** - If shadcn components need customization, extend them rather than creating alternatives
4. **Consistent styling** - Use shadcn's built-in variants and Tailwind classes for styling

## Installation Commands

### Adding New Components

When you need a new shadcn component, you MUST run the command from the `/app` directory:

```bash
# Navigate to app directory first
cd app

# Then add the component
pnpm dlx shadcn@latest add [component-name]
```

**Examples:**
```bash
# Add a single component
pnpm dlx shadcn@latest add button

# Add multiple components at once
pnpm dlx shadcn@latest add dialog input button

# Add a card component
pnpm dlx shadcn@latest add card
```

### ⚠️ Common Mistakes to Avoid

- ❌ Running `shadcn add` from the project root
- ❌ Running `npx shadcn add` (use `pnpm dlx` instead)
- ❌ Manually copying component code from the website
- ❌ Creating custom components when shadcn has an equivalent

## Project Configuration

This project is configured with:
- **Style**: New York
- **TypeScript**: Enabled
- **Tailwind CSS**: v4 with CSS variables
- **Base Color**: Neutral
- **Icon Library**: Lucide React
- **Import Aliases**: `@/components/ui/*`

## Available Components

Currently installed shadcn components:
- `button` - Buttons with variants (default, destructive, outline, etc.)
- `dialog` - Modal dialogs with DialogTrigger, DialogContent, etc.
- `input` - Form input fields

## Usage Patterns

### 1. Import from @/components/ui

Always use the `@/` alias for imports:

```typescript
// ✅ Correct
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// ❌ Wrong
import { Button } from "../ui/button";
import { Button } from "../../components/ui/button";
```

### 2. Use Component Variants

shadcn components come with built-in variants. Use them instead of custom styling:

```typescript
// ✅ Correct - Using built-in variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Close</Button>

// ❌ Wrong - Custom styling when variant exists
<Button className="bg-red-600 hover:bg-red-700">Delete</Button>
```

### 3. Extend with Tailwind Classes

You can extend shadcn components with additional Tailwind classes:

```typescript
// ✅ Correct - Extending with additional classes
<Button className="w-full mt-4">Submit</Button>
<Dialog>
  <DialogContent className="z-50 max-w-2xl">
    {/* content */}
  </DialogContent>
</Dialog>
```

### 4. Self-Contained Dialog Pattern

For modals that don't need external state management, use the self-contained pattern:

```typescript
// ✅ Correct - Self-contained modal
export function MyModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>Open Modal</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        {/* Modal content */}
      </DialogContent>
    </Dialog>
  );
}

// ✅ Also correct - Controlled modal (when you need external logic)
export function MyModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        {/* content */}
      </DialogContent>
    </Dialog>
  );
}
```

## When to Add New Components

Before implementing any UI feature, check if shadcn has a component in /app/src/components/ui/:

### Complete Component List

| Component | Use Case | Command |
|-----------|----------|---------|
| `accordion` | Collapsible content sections | `pnpm dlx shadcn@latest add accordion` |
| `alert` | Alert messages and notifications | `pnpm dlx shadcn@latest add alert` |
| `alert-dialog` | Confirmation dialogs | `pnpm dlx shadcn@latest add alert-dialog` |
| `aspect-ratio` | Maintain aspect ratios | `pnpm dlx shadcn@latest add aspect-ratio` |
| `avatar` | User profile images | `pnpm dlx shadcn@latest add avatar` |
| `badge` | Status indicators, tags | `pnpm dlx shadcn@latest add badge` |
| `breadcrumb` | Navigation breadcrumbs | `pnpm dlx shadcn@latest add breadcrumb` |
| `button` | Clickable buttons | `pnpm dlx shadcn@latest add button` |
| `button-group` | Grouped buttons | `pnpm dlx shadcn@latest add button-group` |
| `calendar` | Date selection calendar | `pnpm dlx shadcn@latest add calendar` |
| `card` | Content containers | `pnpm dlx shadcn@latest add card` |
| `carousel` | Image/content carousels | `pnpm dlx shadcn@latest add carousel` |
| `chart` | Data visualization charts | `pnpm dlx shadcn@latest add chart` |
| `checkbox` | Checkbox inputs | `pnpm dlx shadcn@latest add checkbox` |
| `collapsible` | Collapsible content | `pnpm dlx shadcn@latest add collapsible` |
| `combobox` | Searchable select | `pnpm dlx shadcn@latest add combobox` |
| `command` | Command palette | `pnpm dlx shadcn@latest add command` |
| `context-menu` | Right-click menus | `pnpm dlx shadcn@latest add context-menu` |
| `data-table` | Advanced data tables | `pnpm dlx shadcn@latest add data-table` |
| `date-picker` | Date picker input | `pnpm dlx shadcn@latest add date-picker` |
| `dialog` | Modal dialogs | `pnpm dlx shadcn@latest add dialog` |
| `drawer` | Slide-out panels | `pnpm dlx shadcn@latest add drawer` |
| `dropdown-menu` | Dropdown menus | `pnpm dlx shadcn@latest add dropdown-menu` |
| `empty` | Empty state placeholders | `pnpm dlx shadcn@latest add empty` |
| `field` | Form field wrapper | `pnpm dlx shadcn@latest add field` |
| `form` | Form components | `pnpm dlx shadcn@latest add form` |
| `hover-card` | Hover popover cards | `pnpm dlx shadcn@latest add hover-card` |
| `input` | Text input fields | `pnpm dlx shadcn@latest add input` |
| `input-group` | Grouped inputs | `pnpm dlx shadcn@latest add input-group` |
| `input-otp` | OTP/PIN inputs | `pnpm dlx shadcn@latest add input-otp` |
| `item` | List items | `pnpm dlx shadcn@latest add item` |
| `kbd` | Keyboard shortcuts display | `pnpm dlx shadcn@latest add kbd` |
| `label` | Form labels | `pnpm dlx shadcn@latest add label` |
| `menubar` | Application menu bar | `pnpm dlx shadcn@latest add menubar` |
| `native-select` | Native select dropdown | `pnpm dlx shadcn@latest add native-select` |
| `navigation-menu` | Navigation menus | `pnpm dlx shadcn@latest add navigation-menu` |
| `pagination` | Pagination controls | `pnpm dlx shadcn@latest add pagination` |
| `popover` | Popover overlays | `pnpm dlx shadcn@latest add popover` |
| `progress` | Progress bars | `pnpm dlx shadcn@latest add progress` |
| `radio-group` | Radio button groups | `pnpm dlx shadcn@latest add radio-group` |
| `resizable` | Resizable panels | `pnpm dlx shadcn@latest add resizable` |
| `scroll-area` | Custom scrollbars | `pnpm dlx shadcn@latest add scroll-area` |
| `select` | Select dropdowns | `pnpm dlx shadcn@latest add select` |
| `separator` | Visual dividers | `pnpm dlx shadcn@latest add separator` |
| `sheet` | Side sheets/panels | `pnpm dlx shadcn@latest add sheet` |
| `sidebar` | Application sidebar | `pnpm dlx shadcn@latest add sidebar` |
| `skeleton` | Loading skeletons | `pnpm dlx shadcn@latest add skeleton` |
| `slider` | Range sliders | `pnpm dlx shadcn@latest add slider` |
| `sonner` | Toast notifications | `pnpm dlx shadcn@latest add sonner` |
| `spinner` | Loading spinners | `pnpm dlx shadcn@latest add spinner` |
| `switch` | Toggle switches | `pnpm dlx shadcn@latest add switch` |
| `table` | Data tables | `pnpm dlx shadcn@latest add table` |
| `tabs` | Tabbed interfaces | `pnpm dlx shadcn@latest add tabs` |
| `textarea` | Multi-line text input | `pnpm dlx shadcn@latest add textarea` |
| `toast` | Toast notifications | `pnpm dlx shadcn@latest add toast` |
| `toggle` | Toggle buttons | `pnpm dlx shadcn@latest add toggle` |
| `toggle-group` | Toggle button groups | `pnpm dlx shadcn@latest add toggle-group` |
| `tooltip` | Tooltips | `pnpm dlx shadcn@latest add tooltip` |
| `typography` | Typography styles | `pnpm dlx shadcn@latest add typography` |

### Quick Reference by Use Case

**Navigation & Menus:**
- `navigation-menu`, `menubar`, `breadcrumb`, `sidebar`, `dropdown-menu`, `context-menu`, `command`

**Forms & Inputs:**
- `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `combobox`, `date-picker`, `input-otp`, `form`, `label`, `field`

**Feedback & Overlays:**
- `dialog`, `alert-dialog`, `drawer`, `sheet`, `popover`, `hover-card`, `tooltip`, `toast`, `sonner`, `alert`

**Data Display:**
- `table`, `data-table`, `card`, `badge`, `avatar`, `separator`, `empty`, `typography`

**Layout & Structure:**
- `tabs`, `accordion`, `collapsible`, `resizable`, `scroll-area`, `aspect-ratio`, `carousel`

**Interactive:**
- `button`, `button-group`, `toggle`, `toggle-group`, `slider`, `pagination`

**Loading States:**
- `skeleton`, `spinner`, `progress`

**Visual:**
- `chart`, `kbd`, `item`

Full documentation: https://ui.shadcn.com/docs/components

## Customization Guidelines

### When Customization is Needed

If a shadcn component doesn't meet requirements:

1. **First**: Check if props or variants can solve it
2. **Second**: Extend with Tailwind classes
3. **Third**: Create a wrapper component that uses shadcn as base
4. **Last Resort**: Modify the shadcn component file in `src/components/ui/`

### Example: Creating a Wrapper Component

```typescript
// ✅ Correct - Wrapper that extends shadcn
import { Button } from "@/components/ui/button";

export function GameButton({ children, ...props }: ButtonProps) {
  return (
    <Button 
      className="px-6 py-3 font-semibold rounded-lg transition-colors"
      {...props}
    >
      {children}
    </Button>
  );
}
```

## Accessibility

shadcn components come with built-in accessibility features:
- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support

**Do not remove or override these features** unless absolutely necessary.

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Component Examples](https://ui.shadcn.com/examples)
- [Theming Guide](https://ui.shadcn.com/docs/theming)
- [Lucide Icons](https://lucide.dev/) (for icons)

## Quick Reference

```bash
# Add a component (run from /app directory)
cd app
pnpm dlx shadcn@latest add [component-name]

# View available components
pnpm dlx shadcn@latest add

# Update all components
pnpm dlx shadcn@latest update
```
