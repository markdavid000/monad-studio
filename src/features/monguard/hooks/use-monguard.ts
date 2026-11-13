import { useState } from "react";
import { useContractDraft } from "@/hooks/use-contract-draft";
import { useSavedRun } from "@/hooks/use-history";
import { useLastRunId } from "@/hooks/use-last-run";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { monguardCopy } from "../copy";
import { scanReportSchema } from "../lib/schema";
import { useFindingFocus } from "./use-finding-focus";
import { useScan } from "./use-scan";

export function useMonguard(runId?: string) {
  const draft = useContractDraft();
  const lastRunId = useLastRunId("monguard");
  const saved = useSavedRun("monguard", runId ?? lastRunId, scanReportSchema);
  const [isResultsOpen, setResultsOpen] = useState(runId !== undefined);
  const scan = useScan(() => setResultsOpen(true));

  const isFresh = scan.status !== "idle";
  const report = isFresh ? scan.report : saved.report;
  const reportSource = (isFresh ? scan.scannedSource : saved.source) ?? draft.source;
  const focus = useFindingFocus(report);

  function run() {
    focus.reset();
    setResultsOpen(false);
    scan.scan({ source: draft.source, fileName: draft.name || monguardCopy.untitled });
  }

  return {
    fileName: draft.name,
    source: draft.source,
    isEmpty: draft.source.trim().length === 0,
    isTooLarge: byteSize(draft.source) > SOURCE_LIMIT_BYTES,
    isPending: scan.isRunning,
    report,
    scannedSource: reportSource,
    isMissing: runId !== undefined && saved.isMissing && !isFresh,
    isStale: report !== undefined && reportSource !== draft.source,
    activeId: focus.activeId,
    highlightedLines: focus.highlightedLines,
    isResultsOpen,
    setResultsOpen,
    toggle: focus.toggle,
    run,
  };
}
