# ADR-2026-11-11: Landing design v2

- **Status:** Proposed
- **Approved by:** (name, date; filled in by the maintainer)
- **Supersedes:** the visual direction, type and landing page parts of [ADR-2026-11-11-design-and-copy.md](ADR-2026-11-11-design-and-copy.md). Its copy rules stand.
- **Companion:** [ADR-2026-11-11-landing-design-v2-for-dummies.md](ADR-2026-11-11-landing-design-v2-for-dummies.md)

## Context

The first landing page followed the design ADR: system fonts, neutral surfaces, a headline and a list of tools. The owner reviewed it and found it too basic, and pointed to CodeRabbit's site as the target. What makes that site work:

- Dark first, near-black background, white primary buttons.
- Geist, large medium-weight headlines with tight letter spacing.
- Numbered mono eyebrows ("01 Review") over each section.
- The product as the visual: realistic UI rendered in HTML inside warm-toned frames, never stock art.
- A tabbed showcase under the hero that advances on its own, with a progress bar and a pause button.
- Each section pairs one product shot with three short benefit points.

## Options considered

- **Keep the plain page.** Rejected by the owner.
- **Screenshots of the real tools.** Accurate, but the tools are not rebuilt yet, images need an image ADR, and screenshots go stale with every UI change.
- **Product previews built from components and example data.** Same look as CodeRabbit, theme aware, no images, updated by editing `copy.ts`.

## Decision

- Dark is the default theme; light still works through the toggle.
- Geist (sans) through `next/font`, not preloaded. Code and labels use the system monospace stack.
- Landing page: eyebrow, headline and lead in two columns; a five-tab showcase (Review, Optimise, Deploy, Watch, Contention) that advances every seven seconds on the progress bar's `animationend`, pauses on request and never auto-advances under `prefers-reduced-motion`; one section per tool with a framed preview and three points; a closing call to action.
- Previews are client components fed with example data from `features/landing/copy.ts`, each labelled "Example output". The hero and the sections use different examples. Numbers in them follow the real rules (the MonGuard scores match the approved scoring).
- A tool section links to its tool only once the tool's route exists.
- The `tw-animate-css` import and package are removed; nothing uses them.

### Measured

| Change                                          | Lighthouse performance (mobile) |
| ----------------------------------------------- | ------------------------------- |
| First version with Geist, both fonts preloaded  | 0.95 to 0.97                    |
| Fonts not preloaded, mono font dropped          | 0.95 to 0.98                    |
| Previews as client components (smaller payload) | 0.97 to 0.99                    |
| `inlineCss` turned off                          | 0.96, worse; kept on            |
| `tw-animate-css` removed, tab strip fixed       | 0.98 to 1.00                    |

Observed largest contentful paint is 141 ms; the 2 to 2.5 s figure is Lighthouse's slow 4G simulation.

## Diagram

```
 ┌──────────────────────────────────────────────────────┐
 │ SOLIDITY TOOLING FOR MONAD     Review a contract ... │
 │ Write it. Break it.            [Open the studio ->]  │
 │ Ship it to Monad.                                    │
 │ ┌──────────────────────────────────────────────────┐ │
 │ │ 01 Review  02 Optimise  03 Deploy  04 ...   [||] │ │
 │ │ ┌──────────────── preview ─────────────────────┐ │ │
 │ └──────────────────────────────────────────────────┘ │
 ├──────────────────────────────────────────────────────┤
 │ 01 SECURITY REVIEW                                   │
 │ Find the bug before someone else does.               │
 │ ┌──── warm frame ────┐   Findings you can act on     │
 │ │   preview          │   A score that matches ...    │
 │ └────────────────────┘   Straight into the next step │
 ├──── 02 ... 05, alternating warm and sand frames ─────┤
 │ Paste a contract and see what it finds. [Open ...]   │
 └──────────────────────────────────────────────────────┘
```

## Consequences

- The landing page shows the product instead of describing it.
- About 23 KB of font and a few KB of client JavaScript for the showcase and previews.
- Example data in `copy.ts` must stay consistent with what the tools really produce; each tool pull request checks its previews.
- Packages: `tw-animate-css` removed. No packages added; Geist ships with `next/font`.

## Verification

`pnpm preflight` passes with Lighthouse at 98 or more in every category. Tests cover the showcase tabs, keyboard navigation, auto-advance, pause, and links appearing only for tools that exist. The owner reviews the page in the browser.
