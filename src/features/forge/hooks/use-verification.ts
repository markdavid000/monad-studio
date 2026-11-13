import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postJson, requestJson } from "@/lib/api-error";
import { verificationSchema } from "../lib/schema";
import type { Verification, VerifyInput } from "../types";

const POLL_MS = 3000;
const MAX_POLLS = 60;

function verificationKey(address: string | undefined) {
  return ["forge", "verification", address?.toLowerCase()];
}

export function useSubmitVerification() {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["forge", "verify"],
    mutationFn: (input: VerifyInput) => postJson("/api/forge/verify", input, verificationSchema),
    onSuccess: async (verification, input) => {
      const key = verificationKey(input.address);
      await client.cancelQueries({ queryKey: key });
      client.setQueryData(key, verification);
    },
    onError: (error) => console.error(error),
  });
}

export function useVerification(address: string | undefined, isSubmitting: boolean) {
  const client = useQueryClient();
  return useQuery({
    queryKey: verificationKey(address),
    queryFn: async ({ queryKey }): Promise<Verification> => {
      const current = client.getQueryData<Verification>(queryKey);
      if (current?.status === "verified" || current?.status === "failed") return current;
      if (current?.status === "pending") {
        return requestJson(
          "GET",
          `/api/forge/verify/${current.verificationId}`,
          verificationSchema
        );
      }
      return requestJson("GET", `/api/forge/contract/${address}`, verificationSchema);
    },
    enabled: address !== undefined && !isSubmitting,
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.status === "pending" && query.state.dataUpdateCount < MAX_POLLS
        ? POLL_MS
        : false,
  });
}
