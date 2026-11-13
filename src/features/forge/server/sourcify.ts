import "server-only";
import { z } from "zod";
import { UpstreamError } from "@/lib/server/upstream-error";
import { MATCHES } from "../lib/schema";
import type { Verification, VerifyInput } from "../types";

const SOURCIFY_URL = "https://sourcify-api-monad.blockvision.org";
const CHAIN_ID = 10143;
const TIMEOUT_MS = 20_000;

const errorSchema = z.looseObject({ customCode: z.string().optional(), message: z.string() });
const matchSchema = z.enum(MATCHES).nullable();

const jobSchema = z.looseObject({
  isJobCompleted: z.boolean(),
  verificationId: z.string(),
  contract: z.looseObject({ match: matchSchema.optional() }).optional(),
  error: errorSchema.optional(),
});

const contractSchema = z.looseObject({ match: matchSchema });

async function request(path: string, init?: RequestInit) {
  try {
    return await fetch(`${SOURCIFY_URL}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new UpstreamError("upstream_unavailable", "Sourcify did not respond", { cause: error });
  }
}

async function body(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    throw new UpstreamError("invalid_reply", "Sourcify reply is not JSON", { cause: error });
  }
}

function upstreamFailure(response: Response) {
  if (response.status === 429) {
    return new UpstreamError("upstream_busy", "Sourcify rate limit reached");
  }
  return new UpstreamError("upstream_unavailable", `Sourcify answered ${response.status}`);
}

function parse<T extends z.ZodType>(schema: T, value: unknown): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new UpstreamError("invalid_reply", "Sourcify reply has an unexpected shape", {
      cause: result.error,
    });
  }
  return result.data;
}

export async function contractStatus(address: string): Promise<Verification> {
  const response = await request(`/v2/contract/${CHAIN_ID}/${address}`);
  if (response.status === 404) return { status: "unverified" };
  if (!response.ok) throw upstreamFailure(response);
  const { match } = parse(contractSchema, await body(response));
  return match ? { status: "verified", match } : { status: "unverified" };
}

export async function submitVerification(input: VerifyInput): Promise<Verification> {
  let stdJsonInput: unknown;
  try {
    stdJsonInput = JSON.parse(input.standardJsonInput);
  } catch (error) {
    console.warn("Rejected a standard JSON input that is not JSON", error);
    return { status: "failed", message: "The compiler input is not valid JSON." };
  }
  const response = await request(`/v2/verify/${CHAIN_ID}/${input.address}`, {
    method: "POST",
    body: JSON.stringify({
      stdJsonInput,
      compilerVersion: input.compilerVersion,
      contractIdentifier: input.contractIdentifier,
      creationTransactionHash: input.creationTxHash,
    }),
  });
  if (response.status === 202) {
    const { verificationId } = parse(
      z.object({ verificationId: z.string() }),
      await body(response)
    );
    return { status: "pending", verificationId };
  }
  if (response.status === 409) return contractStatus(input.address);
  if (response.status === 400) {
    return { status: "failed", message: parse(errorSchema, await body(response)).message };
  }
  throw upstreamFailure(response);
}

export async function verificationStatus(verificationId: string): Promise<Verification> {
  const response = await request(`/v2/verify/${verificationId}`);
  if (response.status === 404) {
    return { status: "failed", message: "Sourcify no longer has this verification job." };
  }
  if (!response.ok) throw upstreamFailure(response);
  const job = parse(jobSchema, await body(response));
  if (!job.isJobCompleted) return { status: "pending", verificationId: job.verificationId };
  const match = job.contract?.match;
  if (match) return { status: "verified", match };
  return {
    status: "failed",
    message: job.error?.message ?? "Sourcify could not verify the contract.",
  };
}
