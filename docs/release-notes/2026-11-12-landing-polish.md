---
date: 2026-11-12
branch: fix/landing-polish
base: dev
scenario-impact: none
---

# Smoother landing page with one button size

Sections now run into each other without divider lines, anchor links scroll smoothly, and every button that opens the studio is the same, slightly larger size.

## Changes

- Removed the divider lines above the checks marquee, the flow section, the tool sections and the call to action.
- Smooth scrolling for in-page links, off when the visitor prefers reduced motion; `data-scroll-behavior="smooth"` keeps route changes instant.
- New `cta` button size (44px tall, base text) used by the header, hero, call to action and try-it result buttons.
- Removed the "No sign-in. A wallet is only needed to deploy." line under the hero buttons.

## Removed

- The hero's `noWallet` copy.

## Verification

- `pnpm preflight` passed. Checked the hero in a production build at 1440px.
