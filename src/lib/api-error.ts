import { z } from "zod";

const UPSTREAM_ERROR_CODES = ["upstream_unavailable", "upstream_busy", "invalid_reply"] as const;
const API_ERROR_CODES = [
  "invalid_input",
  "rate_limited",
  "internal",
  "unauthorized",
  "not_found",
  ...UPSTREAM_ERROR_CODES,
] as const;

export type UpstreamErrorCode = (typeof UPSTREAM_ERROR_CODES)[number];
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

const errorBodySchema = z.object({
  error: z.object({ code: z.enum(API_ERROR_CODES), message: z.string() }),
});

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly retryAfterSeconds?: number;

  constructor(code: ApiErrorCode, message: string, retryAfterSeconds?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function retryAfter(response: Response) {
  const value = Number(response.headers.get("Retry-After"));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export function postJson<T extends z.ZodType>(
  url: string,
  body: unknown,
  dataSchema: T
): Promise<z.infer<T>> {
  return requestJson("POST", url, dataSchema, body);
}

export async function requestJson<T extends z.ZodType>(
  method: "GET" | "POST" | "DELETE",
  url: string,
  dataSchema: T,
  body?: unknown
): Promise<z.infer<T>> {
  const response = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload: unknown = await response.json().catch((error: unknown) => {
    console.error(error);
    return null;
  });
  if (!response.ok) {
    const parsed = errorBodySchema.safeParse(payload);
    if (parsed.success) {
      throw new ApiError(parsed.data.error.code, parsed.data.error.message, retryAfter(response));
    }
    throw new ApiError("internal", `Request failed with status ${response.status}`);
  }
  const envelope = z.object({ data: z.unknown() }).safeParse(payload);
  const parsed = dataSchema.safeParse(envelope.success ? envelope.data.data : undefined);
  if (!parsed.success) {
    throw new ApiError("invalid_reply", "The server reply did not match the expected shape");
  }
  return parsed.data;
}
