import type { Address } from "viem";
import { z } from "zod";
import { requestJson } from "./api-error";
import type { HistoryRun } from "./history";
import { SYNC_BATCH, historyMetaSchema, historyRunSchema } from "./history-schema";

const addressSchema = z.string().regex(/^0x[0-9a-fA-F]{40}$/) as z.ZodType<Address>;

export function fetchNonce() {
  return requestJson("GET", "/api/auth/nonce", z.object({ nonce: z.string() }));
}

export function verifySignature(message: string, signature: string) {
  return requestJson("POST", "/api/auth/session", z.object({ address: addressSchema }), {
    message,
    signature,
  });
}

export function endSession() {
  return requestJson("DELETE", "/api/auth/session", z.object({ address: z.null() }));
}

export async function fetchRemoteRuns() {
  const { runs } = await requestJson(
    "GET",
    "/api/history",
    z.object({ runs: z.array(historyMetaSchema) })
  );
  return runs;
}

export async function fetchRemoteRun(id: string): Promise<HistoryRun> {
  const { run } = await requestJson(
    "GET",
    `/api/history/${encodeURIComponent(id)}`,
    z.object({ run: historyRunSchema })
  );
  return run;
}

export async function pushRuns(runs: readonly HistoryRun[]) {
  for (let start = 0; start < runs.length; start += SYNC_BATCH) {
    await requestJson("POST", "/api/history", z.object({ saved: z.number() }), {
      runs: runs.slice(start, start + SYNC_BATCH),
    });
  }
}

export function deleteRemoteRun(id: string) {
  return requestJson(
    "DELETE",
    `/api/history/${encodeURIComponent(id)}`,
    z.object({ deleted: z.boolean() })
  );
}

export function clearRemoteRuns() {
  return requestJson("DELETE", "/api/history", z.object({ cleared: z.boolean() }));
}
