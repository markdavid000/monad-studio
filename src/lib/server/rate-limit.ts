import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { serverEnv } from "./env";

const LIMITS = {
  ai: { requests: 20, prefix: "monad-studio:ai" },
  sync: { requests: 120, prefix: "monad-studio:sync" },
  compile: { requests: 60, prefix: "monad-studio:compile" },
} as const;

type LimitKind = keyof typeof LIMITS;

let redis: Redis | undefined;
const limiters = new Map<LimitKind, Ratelimit>();

export function redisClient() {
  if (!redis) {
    const env = serverEnv();
    redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });
  }
  return redis;
}

function limiter(kind: LimitKind) {
  let existing = limiters.get(kind);
  if (!existing) {
    existing = new Ratelimit({
      redis: redisClient(),
      limiter: Ratelimit.slidingWindow(LIMITS[kind].requests, "10 m"),
      prefix: LIMITS[kind].prefix,
    });
    limiters.set(kind, existing);
  }
  return existing;
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "anonymous";
}

async function limitCall(kind: LimitKind, request: Request) {
  const { success, reset } = await limiter(kind).limit(clientIp(request));
  return {
    allowed: success,
    retryAfterSeconds: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
  };
}

export function limitAiCall(request: Request) {
  return limitCall("ai", request);
}

export function limitSyncCall(request: Request) {
  return limitCall("sync", request);
}

export function limitCompileCall(request: Request) {
  return limitCall("compile", request);
}
