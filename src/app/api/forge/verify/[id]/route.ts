import { verificationIdSchema, verificationStatus } from "@/features/forge/server";
import { errorResponse } from "@/lib/server/ai-route";
import { syncRoute } from "@/lib/server/sync-route";
import { UpstreamError } from "@/lib/server/upstream-error";

export const maxDuration = 30;

export const GET = syncRoute<{ id: string }>(async (_context, { id }) => {
  const parsed = verificationIdSchema.safeParse(id);
  if (!parsed.success) return errorResponse(400, "invalid_input", "That is not a verification id.");
  try {
    return Response.json({ data: await verificationStatus(parsed.data) });
  } catch (error) {
    if (!(error instanceof UpstreamError)) throw error;
    console.error(error);
    return errorResponse(502, error.code, error.message);
  }
});
