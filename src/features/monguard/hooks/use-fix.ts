import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useRecordRun } from "@/hooks/use-history";
import { showAiErrorToast } from "@/lib/ai-toast";
import { postJson } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { fixSummary, monguardCopy } from "../copy";
import { fixResultSchema } from "../lib/schema";
import type { Finding, ScanReport } from "../types";

const MUTATION_KEY = ["monguard", "fix"];
const TOAST_ID = "monguard-fix";

interface FixRequest {
  source: string;
  fileName: string;
  report: ScanReport;
  findings: readonly Finding[];
}

export function useFix(onResult: () => void) {
  const recordRun = useRecordRun("monguard");
  const runningCount = useIsMutating({ mutationKey: MUTATION_KEY });
  const mutation = useMutation({
    mutationKey: MUTATION_KEY,
    mutationFn: ({ source, findings }: FixRequest) =>
      postJson(
        "/api/monguard/fix",
        {
          source,
          findings: findings.map(({ id, title, fix, fixCode, lines }) => ({
            id,
            title,
            fix,
            fixCode,
            lines,
          })),
        },
        fixResultSchema
      ),
    onMutate: () => {
      toast.loading(monguardCopy.fixes.pendingTitle, {
        id: TOAST_ID,
        description: monguardCopy.fixes.pendingBody,
      });
    },
    onSuccess: (fix, request) => {
      const summary = fixSummary(fix.applied.length, fix.skipped.length);
      recordRun({
        fileName: request.fileName,
        contractName: request.report.contractName,
        summary,
        source: request.source,
        report: { kind: "fix", scan: request.report, fix },
      });
      toast.success(monguardCopy.fixes.doneTitle, { id: TOAST_ID, description: summary });
      onResult();
    },
    onError: (error, request) => {
      showAiErrorToast(error, {
        id: TOAST_ID,
        title: monguardCopy.fixes.failedTitle,
        onRetry: () => mutation.mutate(request),
      });
    },
  });

  return {
    status: mutation.status,
    isRunning: runningCount > 0,
    fix: mutation.data,
    request: mutation.variables,
    applyFixes: mutation.mutate,
  };
}
