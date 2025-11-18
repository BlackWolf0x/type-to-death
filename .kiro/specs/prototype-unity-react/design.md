# Design Document

## Overview

This design implements a React application that integrates a Unity WebGL game as a full-screen background with a React UI overlay component. The architecture uses the `react-unity-webgl` library to handle Unity game loading and rendering, while maintaining a clean component structure that separates concerns between the game layer and UI layer.

## Architecture

The application follows a layered architecture:

1. **Game Layer**: Full-screen Unity WebGL game rendered as the background
2. **UI Layer**: React components positioned on top of the game using fixed positioning and z-index stacking

```
┌─────────────────────────────────────┐
│         App.tsx (Root)              │
│  ┌───────────────────────────────┐  │
│  │   UnityGame Component         │  │
│  │   (z-index: 0, fixed, 100%)   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Game Component              │  │
│  │   (z-index: 10, fixed,        │  │
│  │    bottom-center, 500x400)    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Components and Interfaces

### 1. UnityGame Component

**Location**: `src/components/unity/UnityGame.tsx`

**Purpose**: Encapsulates Unity WebGL game loading and rendering logic

**Key Features**:
- Uses `useUnityContext` hook from `react-unity-webgl`
- Configures Unity build file paths
- Displays loading progress
- Handles game visibility based on load state
- Full-screen fixed positioning

**Props**: None (self-contained)

**State**:
- `unityProvider`: Unity context provider from the hook
- `loadingProgression`: Number (0-1) representing load progress
- `isLoaded`: Boolean indicating if game is ready

**Styling**:
- Fixed positioning covering entire viewport
- z-index: 0 (background layer)
- Width: 100vw, Height: 100vh
- Tailwind classes: `fixed inset-0 w-screen h-screen`

### 2. Game Component

**Location**: `src/components/game/Game.tsx`

**Purpose**: Provides a UI overlay that sits on top of the Unity game

**Props**: None (static for prototype)

**Styling**:
- Fixed positioning at bottom-center
- Dimensions: 500px × 400px
- Background: Red (#FF0000 or Tailwind `bg-red-500`)
- z-index: 10 (above game layer)
- Tailwind classes: `fixed bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-red-500`

### 3. App Component

**Location**: `src/App.tsx`

**Purpose**: Root component that composes the game and overlay

**Structure**:
```tsx
function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <UnityGame />
      <Game />
    </div>
  );
}
```

## Data Models

### Unity Context Configuration

```typescript
interface UnityConfig {
  loaderUrl: string;      // "/unity/cursor-test-webgl-build.loader.js"
  dataUrl: string;        // "/unity/cursor-test-webgl-build.data"
  frameworkUrl: string;   // "/unity/cursor-test-webgl-build.framework.js"
  codeUrl: string;        // "/unity/cursor-test-webgl-build.wasm"
}
```

### Unity Context Return Type

```typescript
interface UnityContextValue {
  unityProvider: UnityProvider;
  loadingProgression: number;  // 0 to 1
  isLoaded: boolean;
}
```

## File Structure

```
app/
├── src/
│   ├── components/
│   │   ├── unity/
│   │   │   ├── UnityGame.tsx      # Unity WebGL game component
│   │   │   └── LoadingScreen.tsx  # Loading screen component (future)
│   │   └── game/
│   │       └── Game.tsx           # Red overlay UI component
│   ├── App.tsx                    # Root component
│   └── main.tsx                   # Entry point
├── public/
│   └── unity/
│       ├── cursor-test-webgl-build.loader.js
│       ├── cursor-test-webgl-build.data
│       ├── cursor-test-webgl-build.framework.js
│       └── cursor-test-webgl-build.wasm
└── package.json
```

## Best Practices from react-unity-webgl

Following the official package guidelines from https://github.com/jeffreylanters/react-unity-webgl:

### 1. Unity Context Initialization

- Initialize `useUnityContext` at the component level, not inside render
- Keep the Unity context stable across re-renders
- Use memoization if needed to prevent unnecessary re-initialization

### 2. Component Lifecycle

- The Unity instance should be created once and reused
- Avoid recreating the Unity context on every render
- Clean up properly when component unmounts (handled by the library)

### 3. Loading State Management

- Always check `isLoaded` before showing the Unity canvas
- Display loading progress using `loadingProgression`
- Hide Unity component until fully loaded to prevent flickering

### 4. File Path Configuration

- Use absolute paths from the public directory (e.g., `/unity/file.js`)
- Ensure all four required files are present: loader, data, framework, wasm
- Files must be served from the same origin (no CORS issues)

### 5. Styling Considerations

- Use `style` prop or className for Unity component styling
- Ensure Unity canvas has explicit dimensions
- Use `visibility: hidden` instead of `display: none` during loading

### 6. Performance

- Unity WebGL builds can be large; optimize build size in Unity
- Consider compression (Brotli/Gzip) for production
- Monitor memory usage, especially on mobile devices

## Implementation Details

### Unity Game Loading Flow

1. Component mounts and `useUnityContext` initializes
2. Unity starts loading build files from `/unity/` directory
3. Loading progress updates `loadingProgression` state
4. Loading indicator displays percentage
5. When `isLoaded` becomes true:
   - Loading indicator hides
   - Unity canvas becomes visible
   - Game starts running

### CSS Positioning Strategy

**Game Layer**:
- `position: fixed` with `inset-0` ensures full viewport coverage
- `z-index: 0` keeps it in the background
- No scrolling or overflow

**Overlay Layer**:
- `position: fixed` with `bottom-0` anchors to bottom
- `left-1/2` + `translate-x-[-50%]` centers horizontally
- `z-index: 10` ensures it renders above the game
- Fixed dimensions prevent layout shifts

### Tailwind CSS Classes

**UnityGame**:
- `fixed inset-0 w-screen h-screen` - Full screen coverage
- `z-0` - Background layer

**Game**:
- `fixed bottom-0 left-1/2 -translate-x-1/2` - Bottom-center positioning
- `w-[500px] h-[400px]` - Fixed dimensions
- `bg-red-500` - Red background color
- `z-10` - Foreground layer

**Loading Indicator**:
- `fixed inset-0 flex items-center justify-center` - Centered overlay
- `bg-black bg-opacity-50` - Semi-transparent background
- `text-white text-2xl` - Visible text styling
- `z-20` - Above all other layers

## Error Handling

### Unity Loading Errors

- If Unity files fail to load, the loading indicator will remain visible
- Browser console will show network errors for missing files
- Future enhancement: Add error state handling in `useUnityContext`

### Missing Dependencies

- If `react-unity-webgl` is not installed, build will fail
- Solution: Ensure `pnpm add react-unity-webgl` is run before development

### File Path Issues

- If Unity build files are not in `/public/unity/`, game will fail to load
- Paths are relative to the public directory (Vite serves from `/`)
- Verify all four files exist: `.loader.js`, `.data`, `.framework.js`, `.wasm`

## Testing Strategy

### Manual Testing Checklist

1. **Installation Test**:
   - Run `pnpm install` to verify `react-unity-webgl` is installed
   - Check `package.json` for dependency entry

2. **Unity Game Loading Test**:
   - Start dev server
   - Verify loading indicator appears
   - Verify loading percentage updates
   - Verify game becomes visible when loaded
   - Verify game covers entire viewport

3. **Game Component Positioning Test**:
   - Verify red div appears at bottom-center
   - Verify dimensions are approximately 500px × 400px
   - Verify Game component is above the Unity game (clickable)
   - Resize browser window to test responsiveness

4. **Component Structure Test**:
   - Verify `UnityGame.tsx` exists in `src/components/unity/`
   - Verify `Game.tsx` exists in `src/components/game/`
   - Verify both are imported in `App.tsx`

5. **Browser Compatibility Test**:
   - Test in Chrome/Edge (primary)
   - Test in Firefox (secondary)
   - Verify WebGL support is available

### Integration Testing

- Verify Unity game and React Game component can coexist without conflicts
- Verify no z-index or positioning issues
- Verify no performance degradation from layering

## Performance Considerations

- Unity WebGL games can be resource-intensive
- Loading times depend on build file sizes
- Fixed positioning with GPU-accelerated transforms (translate) for smooth rendering
- No unnecessary re-renders (components are mostly static)

## Future Enhancements

- Add interactive elements to the overlay
- Implement communication between React and Unity (using `sendMessage`)
- Add error boundaries for Unity loading failures
- Make Game component configurable (size, position, color)
- Add responsive design for mobile devices
