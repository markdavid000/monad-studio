import { createAuthenticationAdapter, type AuthenticationStatus } from "@rainbow-me/rainbowkit";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createSiweMessage } from "viem/siwe";
import { endSession, fetchNonce, fetchSession, verifySignature } from "@/lib/sync-api";
import { walletCopy } from "../copy";

const SESSION_KEY = ["wallet-session"] as const;

export function useSessionStatus(): AuthenticationStatus {
  const session = useQuery({ queryKey: SESSION_KEY, queryFn: fetchSession, retry: false });
  if (session.data) return "authenticated";
  return session.data === null ? "unauthenticated" : "loading";
}

export function useWalletSession() {
  const client = useQueryClient();
  const status = useSessionStatus();

  const adapter = createAuthenticationAdapter({
    getNonce: async () => (await fetchNonce()).nonce,
    createMessage: ({ nonce, address, chainId }) =>
      createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: "1",
        statement: walletCopy.signInStatement,
      }),
    verify: async ({ message, signature }) => {
      try {
        const { address } = await verifySignature(message, signature);
        client.setQueryData(SESSION_KEY, address);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    signOut: async () => {
      await endSession();
      client.setQueryData(SESSION_KEY, null);
    },
  });

  return { status, adapter };
}
