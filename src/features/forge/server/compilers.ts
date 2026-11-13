import "server-only";
import { z } from "zod";
import { UpstreamError } from "@/lib/server/upstream-error";

const LIST_URL = "https://binaries.soliditylang.org/bin/list.json";
const CACHE_MS = 24 * 60 * 60 * 1000;
const FULL_VERSION = /^v?(\d+\.\d+\.\d+\+commit\.[0-9a-f]+)$/;

const listSchema = z.object({ releases: z.record(z.string(), z.string()) });

let cached: { at: number; releases: Record<string, string> } | undefined;

async function releases() {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.releases;
  let response: Response;
  try {
    response = await fetch(LIST_URL, { signal: AbortSignal.timeout(15_000) });
  } catch (error) {
    throw new UpstreamError("upstream_unavailable", "Solidity release list did not respond", {
      cause: error,
    });
  }
  if (!response.ok) {
    throw new UpstreamError("upstream_unavailable", `Release list answered ${response.status}`);
  }
  const parsed = listSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new UpstreamError("invalid_reply", "Release list has an unexpected shape", {
      cause: parsed.error,
    });
  }
  cached = { at: Date.now(), releases: parsed.data.releases };
  return parsed.data.releases;
}

export async function fullCompilerVersion(version: string): Promise<string | undefined> {
  const full = FULL_VERSION.exec(version)?.[1];
  if (full) return full;
  const file = (await releases())[version.replace(/^v/, "")];
  return file?.replace(/^soljson-v/, "").replace(/\.js$/, "");
}
