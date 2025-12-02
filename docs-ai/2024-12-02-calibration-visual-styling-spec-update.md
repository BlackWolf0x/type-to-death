# Calibration Page Visual Styling - Spec Update

**Date:** December 2, 2024  
**Status:** Complete

## Summary

Updated the `next-webcam` spec to document the horror-themed visual styling features implemented for the calibration page. This includes background image cycling, film grain effects, card enhancements, and shake animations.

## Changes Made

### 1. Requirements Document

**Added Requirement 10: Horror-Themed Visual Styling**

New acceptance criteria:
- AC 10.1: Display horror-themed background image
- AC 10.2: Cycle through horror images on blink
- AC 10.3: Display film grain overlay effect
- AC 10.4: Show shake animation when webcam not streaming
- AC 10.5: Display red corner brackets on card
- AC 10.6: Display red rain animation effect

### 2. Design Document

**Added Visual Styling Components Section**

Documented three new components:

1. **VHSStatic Component** (`app-next/components/vhs-static.tsx`)
   - SVG-based film grain overlay
   - GPU-accelerated rendering
   - 70% opacity with mix-blend-multiply

2. **CardRain Component** (`app-next/components/ui/card-rain.tsx`)
   - Canvas-based red rain animation
   - 50 raindrops with varying properties
   - ResizeObserver for responsive sizing

3. **Enhanced Card Component** (`app-next/components/ui/card.tsx`)
   - Red corner brackets
   - Red border styling
   - Integrated rain background

**Added Correctness Properties**

- **Property 13:** Background Image Cycling - validates AC 10.2
- **Property 14:** Visual Effects Rendering - validates AC 10.3, 10.5, 10.6
- **Property 15:** Shake Animation Conditional Display - validates AC 10.4

### 3. Tasks Document

**Added Task 14: Implement horror-themed visual styling**

Comprehensive task covering:
- Background image cycling system (default + 10 horror images)
- VHSStatic component with SVG film grain
- CardRain component with canvas animation
- Card component enhancements (corners, border, rain)
- Shake animation implementation
- State management for image cycling
- Conditional rendering based on webcam state

**Status:** Marked as complete [x]

## Implementation Details

### Background Image System

```typescript
const HORROR_IMAGES = [
    '/horror-images/horror1.jpg',
    '/horror-images/horror2.jpg',
    // ... 10 total images
];
const DEFAULT_IMAGE = '/operating-room.png';

const [currentImageIndex, setCurrentImageIndex] = useState(-1); // -1 = default

// Cycle on blink
useEffect(() => {
    if (pageState === 'ready' && blink.blinkCount > prevBlinkCountRef.current) {
        setCurrentImageIndex(prev => (prev + 1) % HORROR_IMAGES.length);
    }
    prevBlinkCountRef.current = blink.blinkCount;
}, [blink.blinkCount, pageState]);
```

### Film Grain Effect

```typescript
// VHSStatic component
backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
```

### Shake Animation

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

Applied conditionally:
```tsx
className={`relative z-10 w-full max-w-2xl ${!webcam.isStreaming ? 'animate-shake' : ''}`}
```

## Visual Hierarchy

Layering from back to front:
1. Background image (cycling horror images or default operating room)
2. Film grain overlay (VHSStatic)
3. Card with red corners, border, and rain effect
4. Card content

## Performance Considerations

- **Film Grain:** Pure CSS/SVG, GPU-accelerated, zero CPU overhead
- **Card Rain:** Limited to 50 drops, uses requestAnimationFrame
- **Shake Animation:** CSS-only, minimal transform operations
- **Background Images:** Next.js Image component with priority loading

## Files Modified

1. `.kiro/specs/next-webcam/requirements.md` - Added Requirement 10
2. `.kiro/specs/next-webcam/design.md` - Added visual components and properties
3. `.kiro/specs/next-webcam/tasks.md` - Added Task 14 (marked complete)

## Related Documentation

- `docs-ai/calibration-page-styling.md` - Original implementation documentation
- `docs-ai/next-webcam-play-page-integration.md` - Play page integration

## Verification

- ✅ All acceptance criteria documented in requirements
- ✅ All components documented in design
- ✅ Correctness properties added and linked to requirements
- ✅ Task created with comprehensive subtasks
- ✅ Task marked as complete
- ✅ Estimated effort updated (13 → 14 tasks)

## Design Rationale

### Horror Aesthetic
- Red color scheme evokes danger and urgency
- Film grain creates vintage horror film atmosphere
- Operating room background suggests medical horror theme
- Rain adds dynamic movement and unease
- Image cycling on blink creates tension and surprise

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

## Conclusion

The spec now fully documents the horror-themed visual styling implemented for the calibration page. All requirements, design details, and implementation tasks are captured, providing complete traceability from user stories to implementation.
