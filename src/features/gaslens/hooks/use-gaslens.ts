import { useState } from "react";
import { useContractDraft } from "@/hooks/use-contract-draft";
import { useRecordRun, useSavedRun } from "@/hooks/use-history";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { showAiErrorToast } from "@/lib/ai-toast";
import { findingsCount } from "@/lib/copy";
import { toast } from "@/lib/toast";
import { flaggedTitle, gaslensCopy, runSummary } from "../copy";
import { gasReportSchema } from "../lib/schema";
import type { GasReport } from "../types";
import { useGasAnalysis } from "./use-gas-analysis";
import { useGasReportView } from "./use-gas-report-view";

const TOAST_ID = "gaslens-review";

function showDoneToast(report: GasReport) {
  const description = findingsCount(report.optimizations.length);
  if (report.check.status === "flagged") {
    toast.warning(gaslensCopy.doneTitle, {
      id: TOAST_ID,
      description: `${description}. ${flaggedTitle(report.check.risks.length)}.`,
    });
  } else if (report.check.status === "unavailable") {
    toast.warning(gaslensCopy.doneTitle, {
      id: TOAST_ID,
      description: `${description}. ${gaslensCopy.check.unavailableTitle}.`,
    });
  } else {
    toast.success(gaslensCopy.doneTitle, { id: TOAST_ID, description });
  }
}

export function useGaslens(runId?: string) {
  const draft = useContractDraft();
  const analysis = useGasAnalysis();
  const saved = useSavedRun("gaslens", runId, gasReportSchema);
  const recordRun = useRecordRun("gaslens");
  const [isResultsOpen, setResultsOpen] = useState(runId !== undefined);

  const isFresh = analysis.status !== "idle";
  const report = isFresh
    ? analysis.status === "success"
      ? analysis.report
      : undefined
    : saved.report;
  const reviewedSource = report
    ? ((isFresh ? analysis.analysedSource : saved.source) ?? draft.source)
    : draft.source;
  const view = useGasReportView(report, reviewedSource);

  function run() {
    view.reset();
    setResultsOpen(false);
    toast.loading(gaslensCopy.pendingTitle, { id: TOAST_ID, description: gaslensCopy.pendingBody });
    const source = draft.source;
    analysis.analyse(source, {
      onSuccess: (next) => {
        recordRun({
          fileName: draft.name || gaslensCopy.untitled,
          contractName: next.contractName,
          summary: runSummary(next),
          source,
          report: next,
        });
        showDoneToast(next);
        setResultsOpen(true);
      },
      onError: (error) => {
        showAiErrorToast(error, { id: TOAST_ID, title: gaslensCopy.failedTitle, onRetry: run });
      },
    });
  }

  return {
    fileName: draft.name,
    draftSource: draft.source,
    source: reviewedSource,
    isEmpty: draft.source.trim().length === 0,
    isTooLarge: byteSize(draft.source) > SOURCE_LIMIT_BYTES,
    isPending: analysis.status === "pending",
    report,
    isMissing: saved.isMissing && !isFresh,
    isStale: report !== undefined && draft.source !== reviewedSource,
    view,
    isResultsOpen,
    setResultsOpen,
    run,
  };
}
