import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/api-error";
import { generatedContractSchema } from "../lib/schema";

export function useGenerate() {
  const mutation = useMutation({
    mutationKey: ["forge", "generate"],
    mutationFn: (prompt: string) =>
      postJson("/api/forge/generate", { prompt }, generatedContractSchema),
  });

  return {
    status: mutation.status,
    contract: mutation.data,
    generate: mutation.mutate,
  };
}
