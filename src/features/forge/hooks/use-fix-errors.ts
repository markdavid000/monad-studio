import { useIsMutating, useMutation } from "@tanstack/react-query";
import { showAiErrorToast } from "@/lib/ai-toast";
import { postJson } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { errorsTitle, forgeCopy } from "../copy";
import { errorFixSchema } from "../lib/schema";

const MUTATION_KEY = ["forge", "fix-errors"];
const TOAST_ID = "forge-fix-errors";
const copy = forgeCopy.compile.fixes;

interface FixRequest {
  fileName: string;
  source: string;
}

export function useFixErrors(onResult: () => void) {
  const runningCount = useIsMutating({ mutationKey: MUTATION_KEY });
  const mutation = useMutation({
    mutationKey: MUTATION_KEY,
    mutationFn: (request: FixRequest) => postJson("/api/forge/fix", request, errorFixSchema),
    onMutate: () => {
      toast.loading(copy.pendingTitle, { id: TOAST_ID, description: copy.pendingBody });
    },
    onSuccess: (fix) => {
      const description =
        fix.compile.status === "compiled" ? copy.compiles : errorsTitle(fix.compile.errors.length);
      if (fix.changes.length === 0) {
        toast.warning(copy.failedTitle, { id: TOAST_ID, description: copy.noChange });
      } else {
        toast.success(copy.readyTitle, { id: TOAST_ID, description });
      }
      onResult();
    },
    onError: (error, request) => {
      showAiErrorToast(error, {
        id: TOAST_ID,
        title: copy.failedTitle,
        onRetry: () => mutation.mutate(request),
      });
    },
  });

  return {
    isRunning: runningCount > 0,
    fix: mutation.data,
    request: mutation.variables,
    suggest: mutation.mutate,
  };
}
