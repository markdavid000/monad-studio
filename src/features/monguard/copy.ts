import type { Severity } from "@/lib/severity";

export const monguardCopy = {
  title: "MonGuard",
  lead: "A security review of the contract in your workspace. Each finding names the lines involved and suggests a fix.",
  about: "About MonGuard",
  checks:
    "It checks external calls, access control, arithmetic and value flow, then lists what it finds by severity.",
  sourceLabel: "Contract source",
  untitled: "Untitled.sol",
  editInWorkspace: "Edit in workspace",
  emptyTitle: "No contract in the workspace yet",
  emptyBody:
    "Paste a contract or load an example in the workspace, then come back here to scan it.",
  openWorkspace: "Open the workspace",
  tooLarge: "This contract is over the 60 KB limit. Trim it in the workspace before scanning.",
  scan: "Scan contract",
  rescan: "Scan again",
  scanning: "Scanning",
  pendingTitle: "Reading the contract",
  pendingBody: "This usually takes 10 to 40 seconds.",
  stale: "The contract changed since this scan. Scan again to update the findings.",
  scoreLabel: "Security score",
  outOf: "/100",
  scoreNote:
    "Starts at 100 and drops with each finding: critical 25, high 15, medium 8, low 3, info 1.",
  findingsLabel: "Findings",
  noFindingsTitle: "No issues found",
  noFindingsBody:
    "MonGuard found nothing to report. That does not prove the contract is safe, so review it before you deploy.",
  impact: "Why it matters",
  fix: "Suggested fix",
  copyFix: "Copy fix",
  copied: "Copied",
  severity: {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    info: "Info",
  } satisfies Record<Severity, string>,
} as const;
