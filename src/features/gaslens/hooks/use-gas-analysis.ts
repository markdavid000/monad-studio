import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useRecordRun } from "@/hooks/use-history";
import { showAiErrorToast } from "@/lib/ai-toast";
import { postJson } from "@/lib/api-error";
import { findingsCount } from "@/lib/copy";
import { toast } from "@/lib/toast";
import { flaggedTitle, gaslensCopy, runSummary } from "../copy";
import { gasReportSchema } from "../lib/schema";
import type { GasReport } from "../types";

const MUTATION_KEY = ["gaslens", "analyse"];
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

interface AnalyseInput {
  source: string;
  fileName: string;
}

export function useGasAnalysis(onResult: () => void) {
  const recordRun = useRecordRun("gaslens");
  const runningCount = useIsMutating({ mutationKey: MUTATION_KEY });
  const mutation = useMutation({
    mutationKey: MUTATION_KEY,
    mutationFn: ({ source }: AnalyseInput) =>
      postJson("/api/gaslens/analyze", { source }, gasReportSchema),
    onMutate: () => {
      toast.loading(gaslensCopy.pendingTitle, {
        id: TOAST_ID,
        description: gaslensCopy.pendingBody,
      });
    },
    onSuccess: (report, input) => {
      onResult();
      recordRun({
        fileName: input.fileName,
        contractName: report.contractName,
        summary: runSummary(report),
        source: input.source,
        report,
      });
      showDoneToast(report);
    },
    onError: (error, input) => {
      showAiErrorToast(error, {
        id: TOAST_ID,
        title: gaslensCopy.failedTitle,
        onRetry: () => mutation.mutate(input),
      });
    },
  });

  return {
    status: mutation.status,
    isRunning: runningCount > 0,
    report: mutation.data,
    analysedSource: mutation.variables?.source,
    analyse: mutation.mutate,
  };
}
