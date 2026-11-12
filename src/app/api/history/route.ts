import { z } from "zod";
import { SYNC_BATCH, historyRunSchema } from "@/lib/history-schema";
import { errorResponse, readJson } from "@/lib/server/ai-route";
import { clearRemoteRuns, listRemoteRuns, saveRemoteRuns } from "@/lib/server/history-store";
import { syncRoute } from "@/lib/server/sync-route";

const saveInputSchema = z.object({ runs: z.array(historyRunSchema).min(1).max(SYNC_BATCH) });

export const GET = syncRoute(async ({ address }) =>
  Response.json({ data: { runs: address ? await listRemoteRuns(address) : [] } })
);

export const POST = syncRoute(async ({ request, address }) => {
  const read = await readJson(request);
  const input = read.ok ? saveInputSchema.safeParse(read.body) : null;
  if (!input?.success || !address) {
    return errorResponse(
      400,
      "invalid_input",
      input && !input.success ? z.prettifyError(input.error) : "The request body must be JSON."
    );
  }
  await saveRemoteRuns(address, input.data.runs);
  return Response.json({ data: { saved: input.data.runs.length } });
});

export const DELETE = syncRoute(async ({ address }) => {
  if (address) await clearRemoteRuns(address);
  return Response.json({ data: { cleared: true } });
});
