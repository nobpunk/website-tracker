# Design

## Visual Theme
A terminal-native dark tech theme optimized for long trading sessions and high information density.

## Dials
- **DESIGN_VARIANCE:** 7 (Asymmetric panel layouts, off-center charts, but clean and structured grid alignment for data).
- **MOTION_INTENSITY:** 6 (Subtle real-time price tick flashes, smooth chart crosshairs, quick 150ms transitions on tab switches, and clean skeleton fades. No bouncy animations).
- **VISUAL_DENSITY:** 8 (Data-dense layout. Tight paddings, hairline separators instead of heavy cards, monospace typography for all financial figures).

## Color Palette (OKLCH)
We use a high-contrast dark theme with a single primary brand accent and clear semantic states.
- **Background (Canvas):** `oklch(0.12 0.006 240)` — Deep charcoal with a subtle cool blue tint.
- **Surface (Panels/Sidebar):** `oklch(0.15 0.008 240)` — Slightly lighter for depth and layer separation.
- **Surface Elevated (Dropdowns/Tooltips):** `oklch(0.18 0.010 240)`
- **Border / Divider:** `oklch(0.22 0.008 240)` — Precise 1px separators.
- **Accent (Interactive/Brand):** `oklch(0.75 0.18 145)` — High-visibility electric green.
- **Bullish (Up):** `oklch(0.70 0.19 140)` — Vibrant emerald green (min 4.5:1 contrast against surface).
- **Bearish (Down):** `oklch(0.62 0.21 28)` — Clean red-orange.
- **Text Primary (Ink):** `oklch(0.94 0.004 240)` — Off-white.
- **Text Secondary (Muted):** `oklch(0.60 0.004 240)` — Low-intensity grey for secondary labels.

## Typography
- **UI & Body Font:** `var(--font-geist-sans)`, sans-serif.
- **Data & Numbers Font:** `var(--font-geist-mono)`, monospace (mandatory for all prices, volumes, timestamps, and percentages to prevent layout shifting).
- **Headings:** Bold sans-serif with tight tracking (`tracking-tight`).

## Spacing & Layout
- **Grid Layout:** Asymmetric three-panel layout on desktop:
  - Sidebar (240px, fixed)
  - Main Panel (flexible, contains chart and market stats)
  - AI Analysis Panel (340px, fixed, right side)
- **Dividers:** 1px solid borders (`border-zinc-800` or equivalent OKLCH variable) instead of cards or shadows.
- **Paddings:** Consistent `p-4` (16px) or `p-3` (12px) for high density.
- **Corner Radii:** Consistent sharp or slightly rounded corners (`rounded-sm` / 4px) for a technical feel.

## Interactive States
- **Button Hover:** Slight background brightness increase (`hover:bg-zinc-800` or accent tint).
- **Button Active (Tactile):** Scale-down (`active:scale-[0.98]`).
- **Price Ticks:** A brief, low-opacity green or red background flash on the price cell when it updates.
- **Loading:** Smooth, shimmering skeleton loaders matching the exact dimensions of the data rows.
