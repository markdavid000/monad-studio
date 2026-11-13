import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useRecordRun } from "@/hooks/use-history";
import { showAiErrorToast } from "@/lib/ai-toast";
import { postJson } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { forgeCopy, writtenSummary } from "../copy";
import { generatedContractSchema } from "../lib/schema";

const MUTATION_KEY = ["forge", "generate"];
const TOAST_ID = "forge-generate";
export const GENERATE_SLOT = "forge-generate";

export function useGenerate(onResult: () => void) {
  const recordRun = useRecordRun("forge");
  const runningCount = useIsMutating({ mutationKey: MUTATION_KEY });
  const mutation = useMutation({
    mutationKey: MUTATION_KEY,
    mutationFn: (prompt: string) =>
      postJson("/api/forge/generate", { prompt }, generatedContractSchema),
    onMutate: () => {
      toast.loading(forgeCopy.generate.pendingTitle, {
        id: TOAST_ID,
        description: forgeCopy.generate.pendingBody,
      });
    },
    onSuccess: (contract) => {
      const { compile } = contract;
      recordRun(
        {
          fileName: contract.fileName,
          contractName: contract.contractName,
          summary: writtenSummary(
            compile.status === "compiled",
            compile.status === "failed" ? compile.errors.length : 0
          ),
          source: contract.source,
          report: { kind: "generate", contract },
        },
        GENERATE_SLOT
      );
      toast.success(forgeCopy.generate.doneTitle, {
        id: TOAST_ID,
        description: contract.contractName,
      });
      onResult();
    },
    onError: (error, prompt) => {
      showAiErrorToast(error, {
        id: TOAST_ID,
        title: forgeCopy.generate.failedTitle,
        onRetry: () => mutation.mutate(prompt),
      });
    },
  });

  return {
    status: mutation.status,
    isRunning: runningCount > 0,
    contract: mutation.data,
    generate: mutation.mutate,
  };
}
