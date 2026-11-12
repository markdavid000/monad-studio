import { errorResponse } from "@/lib/server/ai-route";
import { deleteRemoteRun, getRemoteRun } from "@/lib/server/history-store";
import { syncRoute } from "@/lib/server/sync-route";

interface Params {
  id: string;
}

export const GET = syncRoute<Params>(async ({ address }, { id }) => {
  const run = address ? await getRemoteRun(address, id) : null;
  return run
    ? Response.json({ data: { run } })
    : errorResponse(404, "not_found", "That run is not in your synced history.");
});

export const DELETE = syncRoute<Params>(async ({ address }, { id }) => {
  if (address) await deleteRemoteRun(address, id);
  return Response.json({ data: { deleted: true } });
});
