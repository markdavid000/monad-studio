import { findingsCount } from "@/lib/copy";
import type { Severity } from "@/lib/severity";
import type { ScanReport } from "./types";

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
  pendingTitle: "Scanning the contract",
  doneTitle: "Scan finished",
  failedTitle: "Scan failed",
  resultsTitle: "MonGuard results",
  showResults: "Show results",
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
  fixes: {
    applying: "Applying fixes",
    pendingTitle: "Applying the chosen fixes",
    pendingBody: "This usually takes 15 to 60 seconds.",
    doneTitle: "Fixes ready to review",
    failedTitle: "Could not apply the fixes",
    accept: "Accept fixes",
    acceptedTitle: "Fixes accepted into the workspace",
    statusScanned: "Scanned contract",
    statusReady: "Fixed contract, not accepted yet",
    statusAccepted: "Fixes accepted into the workspace",
    readyNote: "Check every change on the left before you accept.",
    pickNote: "Untick a finding to leave its fix out.",
    label: "Suggested fixes",
    applied: "Applied",
    skipped: "Left out",
    noReason: "No reason given.",
    noChange:
      "None of the chosen fixes could be applied, so the contract is unchanged. Edit it in the workspace instead.",
    back: "Back to findings",
    showFixes: "Show fixes",
    diffLabel: "Changes made by the fixes",
  },
  copied: "Copied",
  severity: {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    info: "Info",
  } satisfies Record<Severity, string>,
  intro: {
    title: "MonGuard: security review",
    body: "MonGuard reads the contract in your workspace the way an attacker would and lists what it finds.",
    points: [
      {
        title: "Scan",
        body: "Press Scan contract under the code. A scan usually takes 10 to 40 seconds.",
      },
      {
        title: "Read the findings",
        body: "Each finding has a severity, the lines involved, why it matters and a suggested fix. Select one to highlight its lines.",
      },
      {
        title: "Check before you rely on it",
        body: "The score starts at 100 and drops with each finding. It is AI analysis, not an audit.",
      },
    ],
    done: "Got it",
  },
} as const;

export function runSummary(report: ScanReport) {
  return `Score ${report.score}, ${findingsCount(report.findings.length)}`;
}

export const monguardDemoCopy = {
  lead: "A security review of a Solidity contract. Each finding names the lines involved and suggests a fix.",
  pick: "Pick an example contract",
  run: "See the scan",
  note: "Recorded from a real MonGuard scan of this example. Nothing is sent when you press it.",
} as const;

export function reviewFixesLabel(count: number) {
  return count === 1 ? "Review 1 fix" : `Review ${count} fixes`;
}

export function includeFixLabel(title: string) {
  return `Include the fix for ${title}`;
}

export function fixSummary(applied: number, skipped: number) {
  const fixes = applied === 1 ? "1 fix applied" : `${applied} fixes applied`;
  return skipped > 0 ? `${fixes}, ${skipped} left out` : fixes;
}
