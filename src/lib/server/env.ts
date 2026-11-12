import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  GROQ_API_KEY: z.string().min(1),
  GROQ_MODEL: z.string().min(1).default("openai/gpt-oss-120b"),
  UPSTASH_REDIS_REST_URL: z.url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function serverEnv() {
  cached ??= serverEnvSchema.parse(process.env);
  return cached;
}

const sessionSecretSchema = z.string().min(32);

let cachedSecret: string | undefined;

export function sessionSecret() {
  cachedSecret ??= sessionSecretSchema.parse(process.env.SESSION_SECRET);
  return cachedSecret;
}
