---
date: 2026-11-12
branch: fix/landing-wires
base: dev
scenario-impact: none
---

# The landing flow diagram is one connected set of wires

Each contract icon on the left now has its own wire that bends into the bundle at the hub and carries on to the right edge, instead of stopping in the middle where a separate set of straight lines began. The icons drift between positions with their wires attached, and the pulses travel about twice as fast.

## Changes

- `features/landing/lib/flow-wires.ts`: wire geometry. Ten wires, one lane each at the hub, four stops per icon kept in lane order so the wires do not cross on the left. Every path for a wire has the same commands, so SVG `animate` can morph it between stops in step with the icon's `animateTransform`.
- `flow-diagram.tsx` renders those wires with one gradient each from icon to edge.
- `hooks/use-reduced-motion.ts`: with reduced motion the icons and wires stay still; the CSS rule already stops the pulses.
- Pulses: 2.6 seconds per run instead of 4.5 to 8, with a longer dash.

## Removed

- The separate right-hand bundle, the dim unlinked icons and the `.flow-pulse-long` style.

## Verification

- Tests for the geometry: wires start at the icon, pass the hub in their lane and end at the right edge; paths keep one shape per wire; icons stay in lane order; hold and loop timing.
- Watched the section in Chrome at 1440px and 390px in dark mode, frames 3 seconds apart, and with reduced motion (no animation elements rendered).
