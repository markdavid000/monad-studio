import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import { historyCopy } from "@/lib/copy";
import {
  clearRuns,
  deleteRun,
  getRun,
  listRuns,
  saveRun,
  type HistoryTool,
  type NewHistoryRun,
} from "@/lib/history";
import { toast } from "@/lib/toast";

const HISTORY_KEY = ["history"] as const;

export function useHistoryRuns() {
  return useQuery({ queryKey: HISTORY_KEY, queryFn: listRuns, retry: false });
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

function useHistoryMutation<T>(mutationFn: (input: T) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSettled: () => client.invalidateQueries({ queryKey: HISTORY_KEY }),
  });
}

export function useRecordRun(tool: HistoryTool) {
  const save = useHistoryMutation((run: NewHistoryRun) => saveRun(run));
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

export function useDeleteRun() {
  return useHistoryMutation((id: string) => deleteRun(id));
}

export function useClearRuns() {
  return useHistoryMutation(() => clearRuns());
}
