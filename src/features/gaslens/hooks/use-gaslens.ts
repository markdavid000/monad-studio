import { useState } from "react";
import { useAcceptContract } from "@/hooks/use-accept-contract";
import { useAutoRun } from "@/hooks/use-auto-run";
import { useContractDraft } from "@/hooks/use-contract-draft";
import { useSavedRun } from "@/hooks/use-history";
import { useLastRunId } from "@/hooks/use-last-run";
import { useSendContract, type JourneyTool } from "@/hooks/use-send-contract";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { gaslensCopy } from "../copy";
import { gasReportSchema } from "../lib/schema";
import { useGasAnalysis } from "./use-gas-analysis";
import { useGasReportView } from "./use-gas-report-view";

export function useGaslens(runId?: string, autoRun = false) {
  const draft = useContractDraft();
  const lastRunId = useLastRunId("gaslens");
  const saved = useSavedRun("gaslens", runId ?? lastRunId, gasReportSchema);
  const [isResultsOpen, setResultsOpen] = useState(runId !== undefined);
  const analysis = useGasAnalysis(() => setResultsOpen(true));
  const accept = useAcceptContract();
  const send = useSendContract();

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
    analysis.analyse({ source: draft.source, fileName: draft.name || gaslensCopy.untitled });
  }

  useAutoRun(autoRun && draft.source.trim().length > 0, run);

  const rewrite = report?.optimizedSource;
  const isAccepted = view.hasChanges && rewrite !== undefined && draft.source === rewrite;

  return {
    fileName: draft.name,
    draftSource: draft.source,
    source: reviewedSource,
    isEmpty: draft.source.trim().length === 0,
    isTooLarge: byteSize(draft.source) > SOURCE_LIMIT_BYTES,
    isPending: analysis.isRunning,
    report,
    isMissing: runId !== undefined && saved.isMissing && !isFresh,
    isStale: report !== undefined && draft.source !== reviewedSource && !isAccepted,
    isAccepted,
    canAccept: view.hasChanges && !isAccepted && report?.check.status === "clear",
    acceptRewrite: () => {
      if (rewrite)
        accept(gaslensCopy.journey.acceptedTitle, draft.name || gaslensCopy.untitled, rewrite);
    },
    sendTo: (tool: JourneyTool) => send(tool, isAccepted && rewrite ? rewrite : reviewedSource),
    view,
    isResultsOpen,
    setResultsOpen,
    run,
  };
}
