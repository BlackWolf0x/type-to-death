# State Management with Zustand

## Overview

This project uses [Zustand](https://github.com/pmndrs/zustand) for global state management. Zustand provides a simple, unopinionated API for managing application state without the boilerplate of Redux.

## Core Principles

1. **Global state only** - Use Zustand for state that needs to be shared across components
2. **Local state first** - Use React's `useState` for component-local state
3. **Single store per domain** - Organize stores by feature/domain (e.g., `appStore`, `gameStore`, `userStore`)
4. **Immutable updates** - Always use `set()` to update state
5. **Selector-based access** - Use selectors for optimal performance

## When to Use Zustand vs useState

### Use Zustand (Global State) When:
- State needs to be accessed by multiple unrelated components
- State needs to persist across component unmounts
- State needs to sync with localStorage/sessionStorage
- State represents application-wide concerns (auth, theme, UI state)

### Use useState (Local State) When:
- State is only used within a single component
- State is temporary (form inputs, modal open/close)
- State doesn't need to be shared
- State is tied to component lifecycle

## Store Structure

### File Organization

```
src/
├── stores/
│   ├── appStore.ts       # Application-wide UI state
│   ├── gameStore.ts      # Game-specific state
│   └── userStore.ts      # User/auth state
```

### Store Template

```typescript
import { create } from 'zustand';

interface MyStore {
    // State
    someValue: string;
    count: number;
    isLoading: boolean;

    // Actions
    setSomeValue: (value: string) => void;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
    // Initial state
    someValue: '',
    count: 0,
    isLoading: false,

    // Actions
    setSomeValue: (value) => set({ someValue: value }),
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0, someValue: '', isLoading: false }),
}));
```

## Usage Patterns

### 1. Basic Usage - Accessing State

```typescript
import { useAppStore } from "@/stores/appStore";

export function MyComponent() {
    // ✅ Correct - Using selector for specific state
    const showMainMenu = useAppStore((state) => state.showMainMenu);
    const skipIntro = useAppStore((state) => state.skipIntro);

    // ❌ Wrong - Accessing entire store (causes unnecessary re-renders)
    const store = useAppStore();
    const showMainMenu = store.showMainMenu;

    return <div>{showMainMenu ? 'Menu visible' : 'Menu hidden'}</div>;
}
```

### 2. Accessing Actions

```typescript
import { useAppStore } from "@/stores/appStore";

export function MyComponent() {
    // ✅ Correct - Selecting specific actions
    const hideMainMenu = useAppStore((state) => state.hideMainMenu);
    const setSkipIntro = useAppStore((state) => state.setSkipIntro);

    // ✅ Also correct - Destructuring multiple values
    const { hideMainMenu, setSkipIntro } = useAppStore();

    return (
        <button onClick={hideMainMenu}>
            Hide Menu
        </button>
    );
}
```

### 3. Combining State and Actions

```typescript
import { useAppStore } from "@/stores/appStore";

export function MyComponent() {
    // ✅ Correct - Destructure what you need
    const { showMainMenu, skipIntro, hideMainMenu, setSkipIntro } = useAppStore();

    const handleStartGame = () => {
        if (skipIntro) {
            hideMainMenu();
        } else {
            // Show intro modal
        }
    };

    return (
        <button onClick={handleStartGame}>
            Start Game
        </button>
    );
}
```

### 4. Performance Optimization with Selectors

```typescript
import { useAppStore } from "@/stores/appStore";

export function MyComponent() {
    // ✅ Best - Only re-renders when showMainMenu changes
    const showMainMenu = useAppStore((state) => state.showMainMenu);

    // ❌ Bad - Re-renders on ANY store change
    const { showMainMenu } = useAppStore();

    return <div>{showMainMenu && <Menu />}</div>;
}
```

## Action Patterns

### Simple State Updates

```typescript
// Direct value update
setSomeValue: (value: string) => set({ someValue: value }),

// Boolean toggle
toggleMenu: () => set((state) => ({ showMenu: !state.showMenu })),

// Multiple values
updateUser: (name: string, email: string) => set({ userName: name, userEmail: email }),
```

### State Updates Based on Previous State

```typescript
// Increment counter
increment: () => set((state) => ({ count: state.count + 1 })),

// Add to array
addItem: (item: Item) => set((state) => ({ 
    items: [...state.items, item] 
})),

// Remove from array
removeItem: (id: string) => set((state) => ({ 
    items: state.items.filter(item => item.id !== id) 
})),

// Update object
updateSettings: (key: string, value: any) => set((state) => ({
    settings: { ...state.settings, [key]: value }
})),
```

### Async Actions

```typescript
// Async action with loading state
fetchData: async () => {
    set({ isLoading: true, error: null });
    
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        set({ data, isLoading: false });
    } catch (error) {
        set({ error: error.message, isLoading: false });
    }
},
```

## localStorage Integration

### Pattern for Persisting State

```typescript
import { create } from 'zustand';

const STORAGE_KEY = 'myStorageKey';

interface MyStore {
    value: string;
    setValue: (value: string) => void;
    initializeFromLocalStorage: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
    value: '',

    setValue: (value: string) => {
        set({ value });
        
        // Sync to localStorage
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    },

    initializeFromLocalStorage: () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored !== null) {
                const value = JSON.parse(stored);
                set({ value });
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            // Use default value on error
            set({ value: '' });
        }
    },
}));
```

### Initializing from localStorage

```typescript
// In App.tsx or root component
import { useEffect } from 'react';
import { useMyStore } from '@/stores/myStore';

function App() {
    const initializeFromLocalStorage = useMyStore(
        (state) => state.initializeFromLocalStorage
    );

    useEffect(() => {
        initializeFromLocalStorage();
    }, [initializeFromLocalStorage]);

    return <div>App content</div>;
}
```

## Best Practices

### 1. Naming Conventions

```typescript
// State: descriptive nouns
showMainMenu: boolean
skipIntro: boolean
currentUser: User | null
isLoading: boolean

// Actions: verbs or set/toggle/update prefix
hideMainMenu: () => void
setSkipIntro: (skip: boolean) => void
toggleTheme: () => void
updateUser: (user: User) => void
resetState: () => void
```

### 2. Type Safety

```typescript
// ✅ Always define interface for store
interface AppStore {
    showMainMenu: boolean;
    hideMainMenu: () => void;
}

// ✅ Use TypeScript generics
export const useAppStore = create<AppStore>((set) => ({
    // ...
}));

// ❌ Don't skip types
export const useAppStore = create((set) => ({
    // TypeScript can't infer types properly
}));
```

### 3. Error Handling

```typescript
// ✅ Always wrap localStorage operations in try-catch
setSkipIntro: (skip: boolean) => {
    set({ skipIntro: skip });
    
    try {
        localStorage.setItem(SKIP_INTRO_KEY, JSON.stringify(skip));
    } catch (error) {
        console.error('Failed to save preference:', error);
        // Optionally set error state
    }
},

// ✅ Provide fallback values
initializeFromLocalStorage: () => {
    try {
        const stored = localStorage.getItem(KEY);
        if (stored !== null) {
            set({ value: JSON.parse(stored) });
        }
    } catch (error) {
        console.error('Failed to load:', error);
        set({ value: DEFAULT_VALUE }); // Fallback
    }
},
```

### 4. Store Organization

```typescript
// ✅ Group related state and actions
interface AppStore {
    // UI State
    showMainMenu: boolean;
    showSidebar: boolean;
    
    // UI Actions
    hideMainMenu: () => void;
    toggleSidebar: () => void;
    
    // User Preferences
    skipIntro: boolean;
    theme: 'light' | 'dark';
    
    // Preference Actions
    setSkipIntro: (skip: boolean) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    
    // Initialization
    initializeFromLocalStorage: () => void;
}
```

### 5. Avoid Over-Using Global State

```typescript
// ❌ Don't put everything in Zustand
const [modalOpen, setModalOpen] = useState(false); // Local state is fine!

// ✅ Only use Zustand when state needs to be shared
const showMainMenu = useAppStore((state) => state.showMainMenu);
```

## Common Patterns

### Pattern 1: UI Visibility State

```typescript
interface UIStore {
    showMainMenu: boolean;
    showSidebar: boolean;
    
    hideMainMenu: () => void;
    showMainMenu: () => void;
    toggleSidebar: () => void;
}
```

### Pattern 2: User Preferences

```typescript
interface PreferencesStore {
    theme: 'light' | 'dark';
    language: string;
    skipIntro: boolean;
    
    setTheme: (theme: 'light' | 'dark') => void;
    setLanguage: (lang: string) => void;
    setSkipIntro: (skip: boolean) => void;
    
    initializeFromLocalStorage: () => void;
}
```

### Pattern 3: Loading States

```typescript
interface DataStore {
    data: Data | null;
    isLoading: boolean;
    error: string | null;
    
    fetchData: () => Promise<void>;
    clearError: () => void;
    reset: () => void;
}
```

## Testing Considerations

```typescript
// Stores can be tested by calling actions directly
import { useMyStore } from '@/stores/myStore';

test('increment increases count', () => {
    const { increment, count } = useMyStore.getState();
    expect(count).toBe(0);
    
    increment();
    expect(useMyStore.getState().count).toBe(1);
});

// Reset state between tests
afterEach(() => {
    useMyStore.getState().reset();
});
```

## Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- [TypeScript Guide](https://docs.pmnd.rs/zustand/guides/typescript)

## Quick Reference

```typescript
// Create store
export const useStore = create<Store>((set) => ({ /* ... */ }));

// Access state (with selector)
const value = useStore((state) => state.value);

// Access action
const action = useStore((state) => state.action);

// Destructure multiple
const { value, action } = useStore();

// Update state
set({ value: newValue })

// Update based on previous state
set((state) => ({ count: state.count + 1 }))

// Get state outside component
const state = useStore.getState();
```
