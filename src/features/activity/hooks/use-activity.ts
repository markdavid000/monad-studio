import { useRouter } from "next/navigation";
import { useState } from "react";
import { useContractDraft } from "@/hooks/use-contract-draft";
import {
  useClearRuns,
  useDeleteRun,
  useHistoryRuns,
  useOpenRun,
  type ActivityItem,
} from "@/hooks/use-history";
import { useSyncedAddress } from "@/hooks/use-synced-address";
import type { HistoryTool } from "@/lib/history";
import { toast } from "@/lib/toast";
import { activityCopy } from "../copy";

export type ActivityFilter = HistoryTool | "all";

export function useActivity() {
  const runs = useHistoryRuns();
  const draft = useContractDraft();
  const openRun = useOpenRun();
  const deleteRun = useDeleteRun();
  const clearRuns = useClearRuns();
  const router = useRouter();
  const synced = useSyncedAddress();
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [isConfirmingClear, setConfirmingClear] = useState(false);

  const all = runs.items;

  return {
    status: runs.status,
    isSynced: synced !== null,
    isRemotePending: runs.isRemotePending,
    total: all.length,
    countFor: (tool: HistoryTool) => all.filter((run) => run.tool === tool).length,
    items: filter === "all" ? all : all.filter((run) => run.tool === filter),
    filter,
    setFilter,
    openingId: openRun.isPending ? openRun.variables.id : null,
    open: (item: ActivityItem) =>
      openRun.mutate(item, {
        onSuccess: (run) => {
          draft.load(run.fileName, run.source);
          router.push(`/studio/${run.tool}?run=${run.id}`);
        },
        onError: (error) => {
          console.error(error);
          toast.error(activityCopy.openFailed, { description: activityCopy.tryAgain });
        },
      }),
    remove: (id: string) =>
      deleteRun.mutate(id, {
        onError: () =>
          toast.error(activityCopy.deleteFailed, { description: activityCopy.tryAgain }),
      }),
    isConfirmingClear,
    setConfirmingClear,
    isClearing: clearRuns.isPending,
    clearAll: () =>
      clearRuns.mutate(undefined, {
        onSuccess: () => {
          setConfirmingClear(false);
          setFilter("all");
          toast.success(activityCopy.cleared);
        },
        onError: () =>
          toast.error(activityCopy.clearFailed, { description: activityCopy.tryAgain }),
      }),
  };
}
