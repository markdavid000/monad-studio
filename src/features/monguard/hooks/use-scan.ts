import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useRecordRun } from "@/hooks/use-history";
import { showAiErrorToast } from "@/lib/ai-toast";
import { postJson } from "@/lib/api-error";
import { findingsCount } from "@/lib/copy";
import { toast } from "@/lib/toast";
import { monguardCopy, runSummary } from "../copy";
import { scanReportSchema } from "../lib/schema";

const MUTATION_KEY = ["monguard", "scan"];
const TOAST_ID = "monguard-scan";

interface ScanInput {
  source: string;
  fileName: string;
}

export function useScan(onResult: () => void) {
  const recordRun = useRecordRun("monguard");
  const runningCount = useIsMutating({ mutationKey: MUTATION_KEY });
  const mutation = useMutation({
    mutationKey: MUTATION_KEY,
    mutationFn: ({ source }: ScanInput) =>
      postJson("/api/monguard/scan", { source }, scanReportSchema),
    onMutate: () => {
      toast.loading(monguardCopy.pendingTitle, {
        id: TOAST_ID,
        description: monguardCopy.pendingBody,
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
      toast.success(monguardCopy.doneTitle, {
        id: TOAST_ID,
        description: findingsCount(report.findings.length),
      });
    },
    onError: (error, input) => {
      showAiErrorToast(error, {
        id: TOAST_ID,
        title: monguardCopy.failedTitle,
        onRetry: () => mutation.mutate(input),
      });
    },
  });

  return {
    status: mutation.status,
    isRunning: runningCount > 0,
    report: mutation.data,
    scannedSource: mutation.variables?.source,
    scan: mutation.mutate,
  };
}
