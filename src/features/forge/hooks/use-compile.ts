import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useRecordRun } from "@/hooks/use-history";
import { showAiErrorToast } from "@/lib/ai-toast";
import { postJson } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { compiledTitle, compileSummary, errorsTitle, forgeCopy } from "../copy";
import { compileResultSchema } from "../lib/schema";
import type { CompileResult } from "../types";

const MUTATION_KEY = ["forge", "compile"];
const TOAST_ID = "forge-compile";
export const COMPILE_SLOT = "forge-compile";

interface CompileInput {
  fileName: string;
  source: string;
}

function showCompiledToast(result: CompileResult) {
  if (result.status === "failed") {
    toast.error(forgeCopy.compile.failedTitle, {
      id: TOAST_ID,
      description: errorsTitle(result.errors.length),
    });
    return;
  }
  toast.success(compiledTitle(result.contracts.length), { id: TOAST_ID });
}

function mainContract(result: CompileResult, fileName: string) {
  const contracts = result.status === "compiled" ? result.contracts : [];
  return contracts.at(-1)?.name ?? fileName.replace(/\.sol$/, "");
}

export function useCompile(onResult: () => void) {
  const recordRun = useRecordRun("forge");
  const runningCount = useIsMutating({ mutationKey: MUTATION_KEY });
  const mutation = useMutation({
    mutationKey: MUTATION_KEY,
    mutationFn: (input: CompileInput) => postJson("/api/forge/compile", input, compileResultSchema),
    onSuccess: (result, input) => {
      recordRun(
        {
          fileName: input.fileName,
          contractName: mainContract(result, input.fileName),
          summary: compileSummary(
            result.status === "compiled",
            result.status === "compiled" ? result.contracts.length : result.errors.length
          ),
          source: input.source,
          report: { kind: "compile", fileName: input.fileName, result },
        },
        COMPILE_SLOT
      );
      showCompiledToast(result);
      onResult();
    },
    onError: (error, input) => {
      showAiErrorToast(error, {
        id: TOAST_ID,
        title: forgeCopy.compile.failedTitle,
        onRetry: () => mutation.mutate(input),
      });
    },
  });

  return {
    status: mutation.status,
    isRunning: runningCount > 0,
    result: mutation.data,
    compiledSource: mutation.variables?.source,
    compiledFileName: mutation.variables?.fileName,
    compile: mutation.mutate,
  };
}
