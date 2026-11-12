---
date: 2026-11-12
branch: fix/tool-layout
base: dev
scenario-impact: none
---

# Tool pages: full width code, toasts for progress, results in a layer

MonGuard and GasLens no longer split the page in two. The contract spans the full width with the run button under it. Progress, success and errors show as toasts, and results open in a wide layer over the page with the code beside the findings, so nobody scrolls to find them. Closing the layer leaves a "Show results" button that brings it back. The description under each title moved into an info icon next to the title.

## Changes

- Toasts: `lib/toast.ts` (store with loading, success, error, info and warning; a loading toast turns into its result in place; newest four kept), `hooks/use-toasts.ts`, `components/ui/toaster.tsx` on Radix Toast, mounted in the studio layout. Errors carry a Try again action, except the rate limit, which says when to come back.
- `lib/ai-toast.ts`: maps API errors to the error toast.
- `components/ui/results-sheet.tsx`: a Radix Dialog sliding in from the right, up to 88rem wide, closed by the X, Escape or a click outside. It opens by itself when a run succeeds.
- Inside the layer the code sits next to the findings (sticky on wide screens, stacked on phones), so selecting a finding still highlights its lines. GasLens shows the diff there; the page itself shows the current contract.
- GasLens success toast turns into a warning when the behaviour check flagged a change or did not run.
- `components/ui/page-title.tsx` with `hooks/use-hover-popover.ts`: info popover by the title on MonGuard, GasLens and the workspace, opened by hover, click, tap or keyboard.
- The run button reads "Scanning" or "Reviewing" and is disabled while it runs, then "Scan again" or "Review again".

## Removed

- `components/ui/ai-error-state.tsx`, the loading and error cards, and the "Ready to scan" and "Ready to review gas" cards with their copy.
- The rerun buttons inside the out of date notices and the side by side page layout.

## Verification

- Tests: toast store (replace in place, infinite loading, cap, subscribe), both tools: loading toast and disabled button, layer opens with results, Show results after closing, out of date notice in the layer, error and rate limit toasts with and without Try again, flagged warning toast, info popover.
- Chrome at 1440px and 390px with mocked replies: loading toast, layer with diff and findings, closing and reopening, error toast and retry, closing a toast leaves the layer open.
