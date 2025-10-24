# Design Guidelines: Farcaster Wordle Mini-App

## Design Approach

**Reference-Based Approach:** Drawing inspiration from the original Wordle's clean, focused game experience combined with Farcaster's modern mobile-first design language. The design emphasizes clarity, immediate comprehension, and delightful micro-interactions that enhance the daily ritual of word puzzle solving.

**Key Design Principles:**
1. **Mobile-First Focus:** Optimized for vertical mobile viewports within Farcaster client
2. **Game-Centric Layout:** Eliminate distractions, center the game board as the hero element
3. **Clear Feedback:** Instant visual confirmation of game state through tile animations
4. **Accessibility-First:** Ensure color-blind users can play comfortably with shape/pattern alternatives

## Typography

**Font Family:** 
- Primary: 'Inter' or 'SF Pro Display' for clean, modern readability
- Monospace: 'JetBrains Mono' or 'Roboto Mono' for game tiles (uppercase letters)

**Type Scale:**
- Hero/Header: text-2xl font-bold (daily date, streaks)
- Tile Letters: text-3xl font-bold uppercase (game board)
- Keyboard Keys: text-lg font-semibold uppercase
- Body/Stats: text-base font-medium
- Caption/Helper: text-sm font-normal
- Micro-labels: text-xs font-medium uppercase tracking-wide

**Letter Spacing:** 
- Game tiles: tracking-tight for optimal tile density
- Stats/labels: tracking-normal
- Micro-labels: tracking-wider for emphasis

## Layout System

**Spacing Primitives:** Standardize on Tailwind units: 1, 2, 3, 4, 6, 8, 12, 16
- Micro spacing (gaps, padding): p-1, p-2, gap-1
- Component spacing: p-4, p-6, m-4, m-6
- Section spacing: py-8, py-12, mt-8
- Large breaks: py-16 (rare, only between major sections)

**Container Strategy:**
- App wrapper: max-w-lg mx-auto (optimized for mobile, centered on larger screens)
- Game board: max-w-sm mx-auto (perfect square proportions)
- Keyboard: w-full max-w-md mx-auto
- Modals: max-w-sm mx-auto with p-6

**Grid Systems:**
- Game board: 6 rows × 5 columns with gap-1 between tiles
- Keyboard: 3 rows with variable column counts (top: 10, middle: 9, bottom: 7 with wider action keys)
- Stats display: grid-cols-3 for streak/attempts/win stats

## Component Library

### Core Game Components

**Game Tiles:**
- Square aspect ratio (aspect-square)
- Size: w-14 h-14 (mobile), w-16 h-16 (tablet+)
- Border: border-2 with rounded corners (rounded-sm)
- Typography: text-3xl font-bold uppercase centered
- States: empty, filled (typing), submitted (locked)
- Accessibility: Add subtle texture patterns for color-blind mode (diagonal stripes for "present", dots for "absent")

**Keyboard:**
- Three-row layout with fixed bottom positioning
- Key sizing: Regular keys w-8 h-12, Action keys (Enter/Delete) w-16 h-12
- Typography: text-lg font-semibold uppercase
- Rounded corners: rounded-md
- Spacing: gap-1 between keys, gap-2 between rows
- States: unused, absent, present, correct (reflected from game board)

**Header:**
- Fixed top bar with h-16
- Layout: flex justify-between items-center with px-4
- Left: Menu/info icon
- Center: "WORDCAST" title (text-2xl font-bold tracking-tight)
- Right: Settings/stats icons
- Sticky positioning for constant visibility

**Stats Badge:**
- Positioned below header or in modal
- Three-column grid: Current Streak | Max Streak | Win %
- Each stat: text-center with text-3xl font-bold for number, text-xs uppercase for label
- Compact with py-4

**Modals (Win/Loss):**
- Centered overlay with backdrop-blur-sm
- Card: rounded-xl with p-8
- Title: text-2xl font-bold mb-4
- Stats summary: grid layout showing attempt count, streak status
- Share button: Full-width, h-12, text-lg font-semibold rounded-lg
- Spacing: gap-6 between sections

### Navigation & Actions

**Primary CTA (Share Button):**
- Full-width within modal or w-full max-w-xs mx-auto
- Height: h-12 to h-14 for easy tapping
- Typography: text-base font-semibold
- Rounded: rounded-lg
- Icon + text layout with gap-2

**Icon Buttons:**
- Size: w-10 h-10 for adequate tap targets
- Use Heroicons via CDN for consistency
- Icons: Settings (cog), Stats (chart-bar), Info (information-circle), Close (x-mark)
- Rounded: rounded-full for icon-only buttons

**Settings Toggle:**
- Color-blind mode: Toggle switch with descriptive label
- Layout: flex items-center justify-between with p-4
- Typography: text-base font-medium

### Feedback Elements

**Toast Notifications:**
- Fixed top positioning with top-20 (below header)
- Compact: px-6 py-3 with rounded-full
- Typography: text-sm font-medium
- Auto-dismiss after 2s
- Messages: "Not in word list", "Not enough letters", "Copied to clipboard"

**Guard Screen (Non-Farcaster):**
- Full-screen centered layout
- Icon: Large warning or app logo (w-24 h-24)
- Title: text-2xl font-bold mb-2
- Message: text-base font-normal max-w-sm text-center
- Spacing: gap-4 in flex column

**Loading States:**
- Spinner: w-8 h-8 centered with mx-auto
- Typography: text-sm font-normal mt-4 text-center
- Message: "Loading your game..." or "Checking streak..."

## Animations

**Critical: Use Very Sparingly**

**Tile Reveal (Only on Submit):**
- Flip animation: rotateX from 0 to 180deg
- Duration: 300ms per tile with 100ms stagger delay
- Easing: ease-in-out
- Triggered only when row is submitted

**Tile Bounce (Invalid Input):**
- Shake animation: translateX(-4px to 4px)
- Duration: 200ms
- Triggered on invalid word submission

**Modal Entry:**
- Fade + scale: opacity 0→1, scale 0.95→1
- Duration: 200ms
- Easing: ease-out

**No Animations On:**
- Typing letters (instant)
- Deleting letters (instant)
- Keyboard state updates (instant)
- Loading states (simple spinner, no complex animations)

## Accessibility Implementation

**Color-Blind Mode:**
- Correct: Solid fill (no pattern needed, reference color handles it)
- Present: Diagonal stripe pattern (repeating-linear-gradient at 45deg)
- Absent: Subtle dot pattern or cross-hatch
- Toggle preserves preference in localStorage

**Touch Targets:**
- Minimum 44×44px for all interactive elements
- Keyboard keys exceed this with h-12
- Icon buttons at w-10 h-10
- Adequate spacing between touch zones (gap-1 minimum)

**Focus States:**
- Visible focus rings on all interactive elements
- Use ring-2 ring-offset-2 for keyboard navigation
- Focus trap in modals

**Screen Reader Support:**
- Aria-labels on all icon buttons
- Aria-live regions for game feedback and toast messages
- Semantic HTML structure (header, main, section)

## Layout Structure

**Overall App Layout:**
```
┌─────────────────────┐
│   Header (Fixed)    │ <- h-16, sticky top-0
├─────────────────────┤
│                     │
│   Stats Badge       │ <- py-4, grid-cols-3
│                     │
│   Game Board        │ <- mt-8, max-w-sm centered
│   (6×5 Grid)        │
│                     │
│   [spacing py-8]    │
│                     │
│   Keyboard          │ <- fixed bottom-0, safe-area-inset
│   (3 rows)          │
│                     │
└─────────────────────┘
```

**Spacing Flow:**
- Header to stats: mt-4
- Stats to board: mt-8
- Board to keyboard: Auto-grow with flex-1, keyboard fixed at bottom
- Keyboard padding: pb-safe-area-inset-bottom for mobile notches

**Responsive Breakpoints:**
- Mobile (base): Optimized default
- Tablet (md:): Slightly larger tiles (w-16), keyboard keys (w-10)
- Desktop (lg:): Max-width container enforced, centered presentation

This design creates a focused, accessible, mobile-optimized word game experience that integrates seamlessly with Farcaster while maintaining the beloved simplicity of Wordle's core gameplay.