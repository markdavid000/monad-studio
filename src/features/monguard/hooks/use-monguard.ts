import { useState } from "react";
import { useAcceptContract } from "@/hooks/use-accept-contract";
import { useAutoRun } from "@/hooks/use-auto-run";
import { useContractDraft } from "@/hooks/use-contract-draft";
import { useSavedRun } from "@/hooks/use-history";
import { useLastRunId } from "@/hooks/use-last-run";
import { useSendContract, type JourneyTool } from "@/hooks/use-send-contract";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { monguardCopy } from "../copy";
import { monguardRunSchema } from "../lib/schema";
import type { Finding, FixResult, ScanReport } from "../types";
import { useFindingFocus } from "./use-finding-focus";
import { useFix } from "./use-fix";
import { useScan } from "./use-scan";

type SavedRun = ReturnType<typeof monguardRunSchema.parse>;

function savedScan(run: SavedRun | undefined): ScanReport | undefined {
  if (!run) return undefined;
  return "kind" in run ? run.scan : run;
}

function savedFix(run: SavedRun | undefined): FixResult | undefined {
  return run && "kind" in run ? run.fix : undefined;
}

function hasFix(finding: Finding) {
  return finding.fix.length > 0 || finding.fixCode.length > 0;
}

export function useMonguard(runId?: string, autoRun = false) {
  const draft = useContractDraft();
  const lastRunId = useLastRunId("monguard");
  const saved = useSavedRun("monguard", runId ?? lastRunId, monguardRunSchema);
  const [isResultsOpen, setResultsOpen] = useState(runId !== undefined);
  const [isShowingFindings, setShowingFindings] = useState(false);
  const [excluded, setExcluded] = useState<ReadonlySet<string>>(new Set());
  const scan = useScan(() => setResultsOpen(true));
  const fixer = useFix(() => {
    setShowingFindings(false);
    setResultsOpen(true);
  });
  const accept = useAcceptContract();
  const send = useSendContract();

  const isScanFresh = scan.status !== "idle";
  const isFixFresh =
    fixer.status !== "idle" && (!isScanFresh || fixer.request?.report === scan.report);
  let report: ScanReport | undefined;
  let reportSource: string | undefined;
  let fix: FixResult | undefined;
  if (isFixFresh) {
    report = fixer.request?.report;
    reportSource = fixer.request?.source;
    fix = fixer.fix;
  } else if (isScanFresh) {
    report = scan.report;
    reportSource = scan.scannedSource;
  } else {
    report = savedScan(saved.report);
    reportSource = saved.source;
    fix = savedFix(saved.report);
  }
  const scannedSource = reportSource ?? draft.source;
  const focus = useFindingFocus(report);

  const fixable = report?.findings.filter(hasFix) ?? [];
  const chosen = fixable.filter((finding) => !excluded.has(finding.id));
  const hasChangedSource = fix !== undefined && fix.fixedSource !== scannedSource;
  const isAccepted = hasChangedSource && draft.source === fix?.fixedSource;
  const view: "findings" | "fixes" = fix && !isShowingFindings ? "fixes" : "findings";

  function run() {
    focus.reset();
    setResultsOpen(false);
    setShowingFindings(false);
    setExcluded(new Set());
    scan.scan({ source: draft.source, fileName: draft.name || monguardCopy.untitled });
  }

  useAutoRun(autoRun && draft.source.trim().length > 0, run);

  function reviewFixes() {
    if (!report || chosen.length === 0) return;
    fixer.applyFixes({
      source: scannedSource,
      fileName: draft.name || monguardCopy.untitled,
      report,
      findings: chosen,
    });
  }

  function toggleFix(id: string) {
    const next = new Set(excluded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExcluded(next);
  }

  return {
    fileName: draft.name,
    source: draft.source,
    isEmpty: draft.source.trim().length === 0,
    isTooLarge: byteSize(draft.source) > SOURCE_LIMIT_BYTES,
    isPending: scan.isRunning,
    report,
    scannedSource,
    isMissing: runId !== undefined && saved.isMissing && !isScanFresh && !isFixFresh,
    isStale: report !== undefined && scannedSource !== draft.source && !isAccepted,
    activeId: focus.activeId,
    highlightedLines: focus.highlightedLines,
    isResultsOpen,
    setResultsOpen,
    toggle: focus.toggle,
    run,
    fix,
    view,
    isFixing: fixer.isRunning,
    isAccepted,
    canAccept: hasChangedSource && !isAccepted,
    isChosen: (id: string) => !excluded.has(id),
    chosenCount: chosen.length,
    toggleFix,
    reviewFixes,
    showFindings: () => setShowingFindings(true),
    showFixes: () => setShowingFindings(false),
    acceptFixes: () => {
      if (fix)
        accept(
          monguardCopy.fixes.acceptedTitle,
          draft.name || monguardCopy.untitled,
          fix.fixedSource
        );
    },
    sendTo: (tool: JourneyTool) => send(tool, isAccepted && fix ? fix.fixedSource : scannedSource),
  };
}
