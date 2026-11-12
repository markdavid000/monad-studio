import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/api-error";
import { scanReportSchema } from "../lib/schema";

export function useScan() {
  const mutation = useMutation({
    mutationKey: ["monguard", "scan"],
    mutationFn: (source: string) => postJson("/api/monguard/scan", { source }, scanReportSchema),
  });

  return {
    status: mutation.status,
    report: mutation.data,
    error: mutation.error,
    scannedSource: mutation.variables,
    scan: mutation.mutate,
  };
}
