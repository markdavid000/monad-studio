import { addressSchema, contractStatus } from "@/features/forge/server";
import { errorResponse } from "@/lib/server/ai-route";
import { syncRoute } from "@/lib/server/sync-route";
import { UpstreamError } from "@/lib/server/upstream-error";

export const maxDuration = 30;

export const GET = syncRoute<{ address: string }>(async (_context, { address }) => {
  const parsed = addressSchema.safeParse(address);
  if (!parsed.success)
    return errorResponse(400, "invalid_input", "That is not a contract address.");
  try {
    return Response.json({ data: await contractStatus(parsed.data) });
  } catch (error) {
    if (!(error instanceof UpstreamError)) throw error;
    console.error(error);
    return errorResponse(502, error.code, error.message);
  }
});
