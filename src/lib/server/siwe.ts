import "server-only";
import { createPublicClient, http, isHex, type Address } from "viem";
import { monadTestnet } from "viem/chains";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { z } from "zod";

export const verifyInputSchema = z.object({
  message: z.string().min(1).max(2000),
  signature: z.string().refine(isHex),
});

let client: ReturnType<typeof createPublicClient> | undefined;

function publicClient() {
  client ??= createPublicClient({ chain: monadTestnet, transport: http() });
  return client;
}

export async function verifySignIn(
  { message, signature }: z.infer<typeof verifyInputSchema>,
  { domain, nonce }: { domain: string; nonce: string }
): Promise<Address | null> {
  const parsed = parseSiweMessage(message);
  if (!parsed.address || parsed.chainId !== monadTestnet.id) return null;
  const isValid = await verifySiweMessage(publicClient(), {
    message,
    signature: signature as `0x${string}`,
    domain,
    nonce,
  });
  return isValid ? parsed.address : null;
}
