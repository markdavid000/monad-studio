# ADR-2026-11-11: Design and copy

- **Status:** Accepted
- **Approved by:** (MarkDavid, 11th Nov 2026)
- **Superseded in part by:** [ADR-2026-11-11-landing-design-v2.md](ADR-2026-11-11-landing-design-v2.md) (visual direction, type, landing page), if approved
- **Companion:** [ADR-2026-11-11-design-and-copy-for-dummies.md](ADR-2026-11-11-design-and-copy-for-dummies.md)

## Context

The owner says the landing page looks AI generated. The patterns behind that impression, all present today:

- Gradient headline text, purple glow shadows, a grid background with a radial glow, pulsing status dots.
- Five tools in five colours (red, yellow, purple, cyan, green), each in an identical icon-title-blurb card, repeated on the landing page, the dashboard and the sidebar.
- Generic claims: "The complete developer environment", "elite", "Catch vulnerabilities before they cost you millions", "Instant alerts at Monad's 0.4s block speed".
- Status that is not true: "Monad Testnet: Connected" with no connection check, "Free plan", "Open source coming soon", links to `/docs` and `/pricing` that do not exist.
- Three display fonts (Outfit, Syne, JetBrains Mono) and hardcoded hex colours in components.

Strings are written inline in components, so nothing checks them.

## Options considered

### Visual direction

- **Restyle the current look.** Keeps the pattern the owner dislikes.
- **A tool-first look, in the manner of established developer tools.** Neutral surfaces, one accent colour, type and spacing doing the work, the product itself as the hero.

### Copy control

- **Review only.**
- **`copy.ts` per feature plus a check script**, as Bluff. Bluff's script bans crypto jargon for non-crypto players; ours bans filler and hype instead, because Solidity terms are the product's vocabulary.

## Decision

- **Palette:** shadcn neutral tokens, light and dark, one accent (Monad purple) for primary actions and focus. Severity colours only where severity is shown. Tools are told apart by name and icon, not by colour.
- **Type:** the system font stack for text, the system monospace stack for code. No web fonts.
- **No decoration:** no gradient text, glows, grid or noise backgrounds, or pulsing dots. One subtle border and radius scale from the tokens.
- **Landing page:** a plain headline saying what the product does, a real MonGuard result on the example contract rendered as the hero, then one row per tool showing what it outputs. Links only to routes that exist. Server rendered, no client JavaScript beyond the theme toggle.
- **Studio:** a header with the tool switcher, the network and the wallet button; each tool is one page with an input pane and a result pane. No dashboard until there is real data for it.
- **Copy:** every user-facing string lives in the feature's `copy.ts`; `react/jsx-no-literals` keeps them out of JSX. `scripts/check-copy.mjs` rejects em and en dashes, emoji, exclamation marks, and a list of filler words (seamless, robust, leverage, unleash, supercharge, elite, cutting-edge, revolutionary, effortless, powerful, next-generation, game-changing, in seconds). Claims must be true of the shipped code.

## Diagram

```
 Landing                              Studio
 ┌──────────────────────────────┐    ┌──────────────────────────────────────┐
 │ MonadStudio   Tools  GitHub  │    │ MonadStudio  [Tool ▾]  Testnet [0x..]│
 │                              │    ├───────────────────┬──────────────────┤
 │ Check, optimise and deploy   │    │ input             │ result           │
 │ Solidity on Monad.           │    │ (editor / form)   │ (findings, diff, │
 │ [Open the studio]            │    │                   │  chart, deploy)  │
 │ ┌──────────────────────────┐ │    │ [Run]             │                  │
 │ │ real MonGuard result     │ │    └───────────────────┴──────────────────┘
 │ └──────────────────────────┘ │
 │ MonGuard   ... what you get  │
 │ GasLens    ... what you get  │
 └──────────────────────────────┘
```

## Consequences

- The product looks like a tool and says only what it does.
- Light mode is supported for the first time.
- Every claim on the site can be checked against the code.
- Packages added: `next-themes` with the theme toggle. Removed: `framer-motion` and the three `next/font` families. `lucide-react` stays because shadcn uses it.

## Verification

`pnpm copy:check` passes. The landing page scores 98 or more in all four Lighthouse categories on mobile, in light and dark. The owner reviews the landing page and one tool page on the preview before the foundation pull request merges.
