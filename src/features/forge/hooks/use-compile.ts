import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/api-error";
import { compileResultSchema } from "../lib/schema";

interface CompileInput {
  fileName: string;
  source: string;
}

export function useCompile() {
  const mutation = useMutation({
    mutationKey: ["forge", "compile"],
    mutationFn: (input: CompileInput) => postJson("/api/forge/compile", input, compileResultSchema),
  });

  return {
    status: mutation.status,
    result: mutation.data,
    compiledSource: mutation.variables?.source,
    compile: mutation.mutate,
    reset: mutation.reset,
  };
}
