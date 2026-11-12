import { generateSiweNonce } from "viem/siwe";
import { nonceCookie } from "@/lib/server/session";
import { syncRoute } from "@/lib/server/sync-route";

export const GET = syncRoute(
  async () => {
    const nonce = generateSiweNonce();
    return Response.json({ data: { nonce } }, { headers: { "Set-Cookie": nonceCookie(nonce) } });
  },
  { requireSession: false }
);
