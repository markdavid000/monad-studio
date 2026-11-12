import "server-only";
import type { Address } from "viem";
import { errorResponse } from "./ai-route";
import { limitSyncCall } from "./rate-limit";
import { readSession } from "./session";

interface SyncContext {
  request: Request;
  address: Address | null;
}

type Handler<P> = (context: SyncContext, params: P) => Promise<Response>;

interface SyncRouteOptions {
  requireSession?: boolean;
}

export function syncRoute<P extends object = object>(
  handler: Handler<P>,
  { requireSession = true }: SyncRouteOptions = {}
) {
  return async function handle(request: Request, route: { params: Promise<P> }) {
    try {
      const limit = await limitSyncCall(request);
      if (!limit.allowed) {
        return errorResponse(429, "rate_limited", "Too many requests.", {
          "Retry-After": String(limit.retryAfterSeconds),
        });
      }
      const address = readSession(request);
      if (requireSession && !address) {
        return errorResponse(401, "unauthorized", "Sign in with your wallet first.");
      }
      return await handler({ request, address }, await route.params);
    } catch (error) {
      console.error(error);
      return errorResponse(500, "internal", "Unexpected server error.");
    }
  };
}
