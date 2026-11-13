import "server-only";
import Groq from "groq-sdk";
import { z } from "zod";
import { serverEnv } from "./env";
import { UpstreamError } from "./upstream-error";

interface StructuredRequest<T extends z.ZodType> {
  name: string;
  system: string;
  user: string;
  schema: T;
  maxOutputTokens?: number;
  retryBudgetMs?: number;
}

const DEFAULT_MAX_OUTPUT_TOKENS = 16_384;
const DEFAULT_RETRY_BUDGET_MS = 15_000;
const FIRST_RATE_LIMIT_WAIT_MS = 4_000;
const MAX_RATE_LIMIT_WAIT_MS = 20_000;
const SERVER_ERROR_WAIT_MS = 1_000;

let client: Groq | undefined;

function groq() {
  client ??= new Groq({ apiKey: serverEnv().GROQ_API_KEY, maxRetries: 0, timeout: 90_000 });
  return client;
}

function responseSchema(schema: z.ZodType) {
  const jsonSchema = z.toJSONSchema(schema);
  delete jsonSchema.$schema;
  return jsonSchema;
}

function toUpstreamError(error: unknown) {
  if (error instanceof Groq.APIError && error.status === 400) {
    return new UpstreamError("invalid_reply", "Groq could not produce a valid reply", {
      cause: error,
    });
  }
  if (error instanceof Groq.RateLimitError) {
    return new UpstreamError("upstream_busy", "Groq token limit reached", { cause: error });
  }
  return new UpstreamError("upstream_unavailable", "Groq request failed", { cause: error });
}

function isServerError(error: unknown) {
  if (error instanceof Groq.APIConnectionTimeoutError) return false;
  if (error instanceof Groq.APIConnectionError) return true;
  return error instanceof Groq.APIError && error.status !== undefined && error.status >= 500;
}

function retryWaitMs(error: unknown, attempt: number) {
  if (attempt === 0 && isServerError(error)) return SERVER_ERROR_WAIT_MS;
  if (!(error instanceof Groq.RateLimitError)) return undefined;
  const retryAfterSeconds = Number(error.headers?.get("retry-after"));
  const askedMs = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : 0;
  const backoffMs = FIRST_RATE_LIMIT_WAIT_MS * 2 ** attempt;
  return Math.min(Math.max(askedMs, backoffMs), MAX_RATE_LIMIT_WAIT_MS);
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function requestCompletion(request: StructuredRequest<z.ZodType>) {
  const completion = await groq().chat.completions.create({
    model: serverEnv().GROQ_MODEL,
    temperature: 0.1,
    max_completion_tokens: request.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
    messages: [
      { role: "system", content: request.system },
      { role: "user", content: request.user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: request.name, schema: responseSchema(request.schema), strict: true },
    },
  });
  return completion.choices[0]?.message.content;
}

async function requestWithRetry(
  request: StructuredRequest<z.ZodType>,
  deadline: number,
  attempt = 0
): Promise<string | null | undefined> {
  try {
    return await requestCompletion(request);
  } catch (error) {
    const waitMs = retryWaitMs(error, attempt);
    if (waitMs === undefined || Date.now() + waitMs > deadline) throw toUpstreamError(error);
    console.warn(`Groq request ${request.name} failed, retrying in ${waitMs} ms`);
    await wait(waitMs);
    return requestWithRetry(request, deadline, attempt + 1);
  }
}

export async function completeStructured<T extends z.ZodType>(
  request: StructuredRequest<T>
): Promise<z.infer<T>> {
  const content = await requestWithRetry(
    request,
    Date.now() + (request.retryBudgetMs ?? DEFAULT_RETRY_BUDGET_MS)
  );
  if (!content) {
    throw new UpstreamError("invalid_reply", "Groq returned an empty reply");
  }
  let reply: unknown;
  try {
    reply = JSON.parse(content);
  } catch (error) {
    throw new UpstreamError("invalid_reply", "Groq reply is not JSON", { cause: error });
  }
  const result = request.schema.safeParse(reply);
  if (!result.success) {
    throw new UpstreamError("invalid_reply", "Groq reply does not match the schema", {
      cause: result.error,
    });
  }
  return result.data;
}
