import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/api-error";
import { gasReportSchema } from "../lib/schema";

export function useGasAnalysis() {
  const mutation = useMutation({
    mutationKey: ["gaslens", "analyse"],
    mutationFn: (source: string) => postJson("/api/gaslens/analyze", { source }, gasReportSchema),
  });

  return {
    status: mutation.status,
    report: mutation.data,
    error: mutation.error,
    analysedSource: mutation.variables,
    analyse: mutation.mutate,
  };
}
