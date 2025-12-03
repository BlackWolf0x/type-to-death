# Calibration Page Styling Implementation

**Date:** December 1, 2025  
**Status:** Completed

## Overview

This document describes the visual styling and effects implemented for the calibration page (`app-next/app/calibration/page.tsx`), creating a horror-themed aesthetic consistent with the Type to Death game's atmosphere.

## Implemented Features

### 1. Operating Room Background Image

**Location:** `app-next/app/calibration/page.tsx`

- Added full-screen background image (`/operating-room.png`)
- Uses Next.js `Image` component with `fill` prop for responsive sizing
- Set to 10% opacity for subtle atmospheric effect
- Uses `priority` prop for immediate loading

```tsx
<Image
    src="/operating-room.png"
    alt="Operating room"
    fill
    className="object-cover opacity-10"
    priority
/>
```

### 2. Film Grain Overlay

**Component:** `app-next/components/vhs-static.tsx`

Created a reusable film grain effect component using pure CSS/SVG:

- Uses SVG `feTurbulence` filter for fractal noise texture
- Configured with `baseFrequency="0.65"` and `numOctaves="3"` for optimal grain
- Applied via inline SVG data URL for zero JavaScript overhead
- Uses `mix-blend-multiply` for authentic film grain blending
- Default opacity of 70% (configurable via props)
- GPU-accelerated for performance

**Technical Implementation:**
```tsx
backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
```

### 3. Card Component Enhancements

**Component:** `app-next/components/ui/card.tsx`

Enhanced all shadcn Card components with horror-themed styling:

#### Red Corner Brackets
- Added four corner brackets (top-left, top-right, bottom-left, bottom-right)
- Uses 2px red borders (`border-red-600`)
- Rounded to match card's `rounded-xl` border radius
- Positioned absolutely with `pointer-events-none`
- Creates surveillance camera/horror UI aesthetic

#### Red Rain Background
**Component:** `app-next/components/ui/card-rain.tsx`

Created a card-specific rain animation component:

- Canvas-based animation with 50 red raindrops
- Raindrops use red color (`rgba(251, 44, 54, opacity)`)
- Optimized for card dimensions (not full screen)
- Uses `ResizeObserver` for responsive sizing
- Slower speed (2-5 units) for subtle effect
- Set to 20% opacity within cards
- Positioned behind card content with proper z-indexing

**Technical Details:**
- Drop count: 50 (reduced from 150 for performance)
- Speed range: 2-5 units per frame
- Length range: 10-30 pixels
- Opacity range: 0.3-0.8 per drop

#### Border Styling
- Changed card border to `border-red-500/30` for subtle red glow
- Added `overflow-hidden` to contain rain animation

### 4. Shake Animation

**Location:** `app-next/app/globals.css`

Created a subtle shake animation for visual feedback:

```css
@keyframes shake {
    0%, 100% { transform: translate(0, 0); }
    10%, 30%, 50%, 70%, 90% { transform: translate(-1px, -1px); }
    20%, 40%, 60%, 80% { transform: translate(1px, 1px); }
}

.animate-shake {
    animation: shake 0.5s ease-in-out infinite;
}
```

**Usage:** Applied conditionally to the calibration card when webcam is not streaming:
```tsx
className={`relative z-10 w-full max-w-2xl ${!webcam.isStreaming ? 'animate-shake' : ''}`}
```

**Behavior:**
- Only active when webcam is not connected
- 1px jitter in diagonal directions
- 0.5s duration with infinite repeat
- Creates urgency/tension before calibration begins

## Visual Hierarchy

The layering from back to front:

1. **Operating room background** (z-0, opacity 10%)
2. **Film grain overlay** (z-0, opacity 70%, mix-blend-multiply)
3. **Card container** (z-10)
   - **Red rain background** (inside card, opacity 20%)
   - **Red corner brackets** (z-10)
   - **Card content** (z-10)

## Performance Considerations

### Film Grain
- Pure CSS/SVG solution (no JavaScript)
- GPU-accelerated rendering
- Zero CPU overhead
- Static texture (no animation)

### Card Rain
- Limited to 50 raindrops per card
- Uses `requestAnimationFrame` for smooth animation
- Canvas cleared and redrawn each frame
- Scoped to card dimensions (not full screen)
- Automatic cleanup on unmount

### Shake Animation
- CSS-only animation
- Conditional rendering (only when needed)
- Minimal transform operations (1px translations)

## Browser Compatibility

All effects use standard web APIs:
- SVG filters (supported in all modern browsers)
- CSS animations (widely supported)
- Canvas 2D API (universal support)
- ResizeObserver (modern browsers, polyfill available if needed)

## Files Modified

1. `app-next/app/calibration/page.tsx` - Added background image, film grain, conditional shake
2. `app-next/components/vhs-static.tsx` - Created film grain component
3. `app-next/components/ui/card.tsx` - Added red corners, rain background, border styling
4. `app-next/components/ui/card-rain.tsx` - Created card-specific rain animation
5. `app-next/app/globals.css` - Added shake animation keyframes

## Design Rationale

### Horror Aesthetic
- Red color scheme evokes danger and urgency
- Film grain creates vintage horror film atmosphere
- Operating room background suggests medical horror theme
- Rain adds dynamic movement and unease

### User Experience
- Shake animation provides feedback when webcam is needed
- Subtle effects don't distract from calibration process
- Consistent styling across all cards
- Performance-optimized to not interfere with webcam/MediaPipe

### Technical Approach
- Reusable components for consistency
- CSS-first approach for performance
- Conditional effects based on application state
- Proper z-indexing for layered effects

## Future Enhancements

Potential improvements (out of scope for current implementation):

- Animated film grain (seed animation) - tested but reverted for performance
- Color-tinted film grain options
- Adjustable rain intensity based on game state
- Glitch effects during critical moments
- Scanline overlay for CRT monitor effect
- Vignette effect around card edges

## Testing Notes

- Tested on Chrome, Firefox, Edge
- Verified performance with webcam + MediaPipe running
- Confirmed shake animation stops when webcam connects
- Validated rain animation stays within card bounds
- Checked z-index layering with all elements visible

## Conclusion

The calibration page now features a cohesive horror-themed visual style that enhances the game's atmosphere while maintaining performance and usability. All effects are implemented using modern web standards and optimized for smooth operation alongside the webcam and blink detection systems.
