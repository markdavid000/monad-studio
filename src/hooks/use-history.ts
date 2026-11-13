import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import type { z } from "zod";
import { ApiError } from "@/lib/api-error";
import { historyCopy } from "@/lib/copy";
import {
  clearRuns,
  deleteRun,
  getRun,
  listRuns,
  putRuns,
  saveRun,
  type HistoryRun,
  type HistoryTool,
  type NewHistoryRun,
} from "@/lib/history";
import type { HistoryMeta } from "@/lib/history-schema";
import {
  clearRemoteRuns,
  deleteRemoteRun,
  fetchRemoteRun,
  fetchRemoteRuns,
  pushRuns,
} from "@/lib/sync-api";
import { toast } from "@/lib/toast";
import { addSyncedAddress, removeSyncedAddress, useSyncedAddress } from "./use-synced-address";

const HISTORY_KEY = ["history"] as const;

export interface ActivityItem extends HistoryMeta {
  isLocal: boolean;
}

function handleSyncError(error: unknown) {
  console.error(error);
  if (error instanceof ApiError && error.code === "unauthorized") {
    toast.warning(historyCopy.syncEndedTitle, { description: historyCopy.syncEndedBody });
    return;
  }
  toast.warning(historyCopy.syncFailedTitle, { description: historyCopy.syncFailedBody });
}

function mergeRuns(local: readonly HistoryRun[], remote: readonly HistoryMeta[]): ActivityItem[] {
  const localIds = new Set(local.map((run) => run.id));
  return [
    ...local.map(({ source: _source, report: _report, ...meta }) => ({ ...meta, isLocal: true })),
    ...remote.filter((meta) => !localIds.has(meta.id)).map((meta) => ({ ...meta, isLocal: false })),
  ].sort((a, b) => b.createdAt - a.createdAt);
}

export function useHistoryRuns() {
  const synced = useSyncedAddress();
  const local = useQuery({ queryKey: [...HISTORY_KEY, "local"], queryFn: listRuns, retry: false });
  const remote = useQuery({
    queryKey: [...HISTORY_KEY, "remote", synced],
    queryFn: async () => {
      try {
        return await fetchRemoteRuns();
      } catch (error) {
        handleSyncError(error);
        throw error;
      }
    },
    enabled: synced !== null,
    retry: false,
  });

  return {
    status: local.status,
    items: local.data ? mergeRuns(local.data, remote.data ?? []) : [],
    isRemotePending: synced !== null && remote.isPending,
  };
}

function useHistoryRun(id: string | undefined) {
  return useQuery({
    queryKey: [...HISTORY_KEY, "run", id],
    queryFn: async () => (id ? ((await getRun(id)) ?? null) : null),
    enabled: id !== undefined,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

function useHistoryMutation<T, R = unknown>(mutationFn: (input: T) => Promise<R>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSettled: () => client.invalidateQueries({ queryKey: HISTORY_KEY }),
  });
}

export function useRecordRun(tool: HistoryTool) {
  const synced = useSyncedAddress();
  const save = useHistoryMutation(async (run: NewHistoryRun) => {
    const saved = await saveRun(run);
    if (synced) await pushRuns([saved]).catch(handleSyncError);
    return saved;
  });
  return (run: Omit<NewHistoryRun, "tool">) =>
    save.mutate(
      { ...run, tool },
      {
        onError: (error) => {
          console.error(error);
          toast.warning(historyCopy.saveFailedTitle, { description: historyCopy.saveFailedBody });
        },
      }
    );
}

export function useSavedRun<T>(tool: HistoryTool, id: string | undefined, schema: z.ZodType<T>) {
  const query = useHistoryRun(id);
  const run = query.data?.tool === tool ? query.data : undefined;
  const parsed = run ? schema.safeParse(run.report) : undefined;
  return {
    report: parsed?.success ? parsed.data : undefined,
    source: run?.source,
    isMissing: id !== undefined && (query.isError || (query.isSuccess && !parsed?.success)),
  };
}

export function useOpenRun() {
  return useHistoryMutation(async (item: ActivityItem): Promise<HistoryRun> => {
    const local = item.isLocal ? await getRun(item.id) : undefined;
    if (local) return local;
    const run = await fetchRemoteRun(item.id);
    await putRuns([run]);
    return run;
  });
}

export function useDeleteRun() {
  const synced = useSyncedAddress();
  return useHistoryMutation(async (id: string) => {
    await deleteRun(id);
    if (synced) await deleteRemoteRun(id);
  });
}

export function useClearRuns() {
  const synced = useSyncedAddress();
  return useHistoryMutation(async () => {
    await clearRuns();
    if (synced) await clearRemoteRuns();
  });
}

export function useStartSync() {
  return useHistoryMutation(async (address: Address) => {
    const local = await listRuns();
    await pushRuns(local);
    addSyncedAddress(address);
    return local.length;
  });
}

export function useStopSync() {
  return useHistoryMutation(async (address: Address) => {
    removeSyncedAddress(address);
  });
}
