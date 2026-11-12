import { z } from "zod";
import { errorResponse, readJson } from "@/lib/server/ai-route";
import {
  clearedNonceCookie,
  clearedSessionCookie,
  readNonce,
  sessionCookie,
} from "@/lib/server/session";
import { verifyInputSchema, verifySignIn } from "@/lib/server/siwe";
import { syncRoute } from "@/lib/server/sync-route";

export const GET = syncRoute(async ({ address }) => Response.json({ data: { address } }), {
  requireSession: false,
});

export const POST = syncRoute(
  async ({ request }) => {
    const read = await readJson(request);
    const input = read.ok ? verifyInputSchema.safeParse(read.body) : null;
    if (!input?.success) {
      return errorResponse(
        400,
        "invalid_input",
        input ? z.prettifyError(input.error) : "The request body must be JSON."
      );
    }
    const nonce = readNonce(request);
    if (!nonce) {
      return errorResponse(401, "unauthorized", "The sign-in request expired. Try again.");
    }
    const domain = request.headers.get("host") ?? new URL(request.url).host;
    const address = await verifySignIn(input.data, { domain, nonce });
    if (!address) {
      return errorResponse(401, "unauthorized", "The signature could not be verified.");
    }
    const headers = new Headers();
    headers.append("Set-Cookie", sessionCookie(address));
    headers.append("Set-Cookie", clearedNonceCookie());
    return Response.json({ data: { address } }, { headers });
  },
  { requireSession: false }
);

export const DELETE = syncRoute(
  async () =>
    Response.json(
      { data: { address: null } },
      { headers: { "Set-Cookie": clearedSessionCookie() } }
    ),
  { requireSession: false }
);
