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

### Motion

The owner found the first v2 page still too static and asked for CodeRabbit's movement. Each pattern below is built with CSS keyframes and one `IntersectionObserver` hook; no animation library.

| CodeRabbit pattern                          | MonadStudio                                                                                                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Headline word that changes letter by letter | "Write the contract. Review it on Monad." The verb follows the showcase tab, each letter rising in and flashing the accent colour. Screen readers get one stable heading. |
| Showcase as a horizontal accordion          | The active preview grows wide; the others shrink to cropped, faded slices that open on click.                                                                             |
| Scenes that play inside each preview        | Items rise in one after another; MonGuard's score counts down to its value; a scan line sweeps; deploy steps tick; flagged rows pulse; contention bars grow.              |
| "Fast code. Faster chaos." flow lines       | "Monad is fast. So are its bugs." Dashed lines flow from twelve contracts into MonadStudio and on to Monad testnet.                                                       |
| Logo wall and marquee                       | A marquee of what the reviews check. No customer logos: there are none yet.                                                                                               |
| Travelling colour bar under each frame      | Same, in the accent, success, warning and critical colours.                                                                                                               |
| Fade-up on scroll                           | Each section's eyebrow, heading, frame and points rise in when 15% of it is visible.                                                                                      |

### Second review by the owner

The owner compared the page with CodeRabbit again and asked for four changes, now built:

- **Width.** One `page-container` utility copies the reference container: full width with 1.5rem gutters, 80rem with 3rem gutters from 64rem, 120rem with 7.5rem gutters from 80rem.
- **Hero.** The headline verb cycles on its own timer (every 2.8 s) and no longer follows the showcase. The showcase is one bordered strip of columns, each with its own header; hovering or clicking a column opens it to about 3.75 times the width of the others, and the progress line runs along its bottom. The columns use the disclosure pattern (`aria-expanded` on each header, `role="region"` on each panel) because a panel inside a tab list breaks ARIA.
- **Flow section.** Full width: a faint grid of contract icons, lines that fade in towards a vertical wall, one bundle that runs to the right edge and fades out, and light pulses travelling along every line. The heading sits above the bundle and the body below it.
- **Scroll section.** "What happens when you press Scan": a sticky panel inside a 260vh track. Scroll position picks one of five true steps (your contract, the checklist, the fixed reply shape, the scoring rules, the next tool); a progress line grows down the step list and the stage on the right changes with each step.
- **Footer.** A large outlined MonadStudio wordmark fading downward, a bordered box with a call to open the studio and the AI note in place of a newsletter (no mailing service exists), and a row linking the studio and the public GitHub repository. Legal pages and a newsletter wait for their own decisions.

(plus the score counter, a registered `@property`); everything stops under `prefers-reduced-motion`; nothing visible on first paint starts hidden, so the largest contentful paint is not delayed.

To keep Lighthouse at 98 or more, the four inactive showcase previews and the five section previews render on the client after hydration (`useIsClient`), and their frames reserve their height so nothing shifts. The page's text, the active preview and every heading stay in the server HTML.

### Measured

| Change                                          | Lighthouse performance (mobile) |
| ----------------------------------------------- | ------------------------------- |
| First version with Geist, both fonts preloaded  | 0.95 to 0.97                    |
| Fonts not preloaded, mono font dropped          | 0.95 to 0.98                    |
| Previews as client components (smaller payload) | 0.97 to 0.99                    |
| `inlineCss` turned off                          | 0.96, worse; kept on            |
| `tw-animate-css` removed, tab strip fixed       | 0.98 to 1.00                    |
| Motion added (more client code and CSS)         | 0.97 to 0.99                    |
| Hidden and below-the-fold previews client only  | 0.98 to 1.00, CLS 0             |

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
- About 29 KB of font and roughly 30 KB of client JavaScript for the showcase, previews and scenes.
- Without JavaScript the section previews do not appear; the text around them does.
- Example data in `copy.ts` must stay consistent with what the tools really produce; each tool pull request checks its previews.
- Packages: `tw-animate-css` removed. No packages added; Geist ships with `next/font`.

## Verification

`pnpm preflight` passes with Lighthouse at 98 or more in every category. Tests cover the stable heading and changing verb, the showcase tabs, previews that open on click, keyboard navigation, auto-advance, pause, the in-view hook, the flow diagram, the marquee, and links appearing only for tools that exist. The owner reviews the page in the browser.
