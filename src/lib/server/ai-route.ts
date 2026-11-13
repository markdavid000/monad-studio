import "server-only";
import { z } from "zod";
import type { ApiErrorCode } from "@/lib/api-error";
import { limitAiCall } from "./rate-limit";
import { readSession } from "./session";
import { UpstreamError } from "./upstream-error";

export function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  headers?: HeadersInit
) {
  return Response.json({ error: { code, message } }, { status, headers });
}

export async function readJson(
  request: Request
): Promise<{ ok: true; body: unknown } | { ok: false }> {
  try {
    return { ok: true, body: await request.json() };
  } catch (error) {
    console.warn("Rejected a request body that is not JSON", error);
    return { ok: false };
  }
}

export function aiRoute<T extends z.ZodType, R>(
  input: T,
  run: (value: z.infer<T>) => Promise<R>,
  limitCall: (
    request: Request
  ) => Promise<{ allowed: boolean; retryAfterSeconds: number }> = limitAiCall
) {
  return async function handle(request: Request) {
    const address = readSession(request);
    if (!address) {
      return errorResponse(401, "unauthorized", "Connect and sign in with your wallet first.");
    }
    const read = await readJson(request);
    if (!read.ok) {
      return errorResponse(400, "invalid_input", "The request body must be JSON.");
    }
    const parsed = input.safeParse(read.body);
    if (!parsed.success) {
      return errorResponse(400, "invalid_input", z.prettifyError(parsed.error));
    }
    try {
      const limit = await limitCall(request);
      if (!limit.allowed) {
        return errorResponse(429, "rate_limited", "Too many requests.", {
          "Retry-After": String(limit.retryAfterSeconds),
        });
      }
      return Response.json({ data: await run(parsed.data) });
    } catch (error) {
      console.error(error);
      if (error instanceof UpstreamError) {
        return errorResponse(502, error.code, error.message);
      }
      return errorResponse(500, "internal", "Unexpected server error.");
    }
  };
}
