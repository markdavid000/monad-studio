import type { IMPACTS, SAVING_SCOPES } from "./lib/schema";

type Impact = (typeof IMPACTS)[number];
type SavingScope = (typeof SAVING_SCOPES)[number];

export const gaslensCopy = {
  title: "GasLens",
  lead: "A gas review of the contract in your workspace. Each finding estimates what it saves, and the rewritten contract is shown as a diff against yours.",
  codeLabel: "Contract",
  viewSource: "Source",
  viewChanges: "Changes",
  untitled: "Untitled.sol",
  editInWorkspace: "Edit in workspace",
  emptyTitle: "No contract in the workspace yet",
  emptyBody:
    "Paste a contract or load an example in the workspace, then come back here to review its gas.",
  openWorkspace: "Open the workspace",
  tooLarge: "This contract is over the 60 KB limit. Trim it in the workspace before reviewing it.",
  analyse: "Review gas",
  rerun: "Review again",
  idleTitle: "Ready to review gas",
  idleBody:
    "GasLens looks for storage reads in loops, memory where calldata will do, string reverts, missing immutables and loop counters, then rewrites the contract.",
  pendingTitle: "Rewriting the contract",
  pendingBody: "This usually takes 15 to 60 seconds, longer for big contracts.",
  stale: "The contract changed since this review. Review again to update it.",
  applied: "The workspace now holds the optimised contract. Run MonGuard on it before you deploy.",
  reviewNote:
    "Read every change before you use it. A rewrite can change behaviour even when it looks like a pure gas fix.",
  findingsLabel: "Optimisations",
  estimateNote:
    "Savings are the model's estimates for one call, one deployment or one loop iteration, not measured gas.",
  noFindingsTitle: "Nothing to optimise",
  noFindingsBody: "GasLens found no clear gas waste, so the contract is unchanged.",
  copyOptimised: "Copy optimised contract",
  copied: "Copied",
  useOptimised: "Use in workspace",
  impact: { high: "High", medium: "Medium", low: "Low" } satisfies Record<Impact, string>,
  per: {
    call: "per call",
    deployment: "on deployment",
    iteration: "per loop iteration",
  } satisfies Record<SavingScope, string>,
} as const;

export function savingLabel(gas: number, per: SavingScope) {
  return `About ${gas.toLocaleString("en-US")} gas ${gaslensCopy.per[per]}`;
}

export function changeSummary(added: number, removed: number) {
  return `${added} added, ${removed} removed`;
}
