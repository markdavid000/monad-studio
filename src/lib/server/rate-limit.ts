import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { serverEnv } from "./env";

let limiter: Ratelimit | undefined;

function aiLimiter() {
  if (!limiter) {
    const env = serverEnv();
    limiter = new Ratelimit({
      redis: new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN }),
      limiter: Ratelimit.slidingWindow(20, "10 m"),
      prefix: "monad-studio:ai",
    });
  }
  return limiter;
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "anonymous";
}

export async function limitAiCall(request: Request) {
  const { success, reset } = await aiLimiter().limit(clientIp(request));
  return {
    allowed: success,
    retryAfterSeconds: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
  };
}
