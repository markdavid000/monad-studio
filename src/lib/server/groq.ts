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
}

const DEFAULT_MAX_OUTPUT_TOKENS = 16_384;

let client: Groq | undefined;

function groq() {
  client ??= new Groq({ apiKey: serverEnv().GROQ_API_KEY, maxRetries: 1, timeout: 90_000 });
  return client;
}

function responseSchema(schema: z.ZodType) {
  const jsonSchema = z.toJSONSchema(schema);
  delete jsonSchema.$schema;
  return jsonSchema;
}

async function requestCompletion(request: StructuredRequest<z.ZodType>) {
  try {
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
  } catch (error) {
    if (error instanceof Groq.APIError && error.status === 400) {
      throw new UpstreamError("invalid_reply", "Groq could not produce a valid reply", {
        cause: error,
      });
    }
    throw new UpstreamError("upstream_unavailable", "Groq request failed", { cause: error });
  }
}

export async function completeStructured<T extends z.ZodType>(
  request: StructuredRequest<T>
): Promise<z.infer<T>> {
  const content = await requestCompletion(request);
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
