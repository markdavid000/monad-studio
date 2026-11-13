import { useAccount } from "wagmi";
import { useStartSync, useStopSync } from "@/hooks/use-history";
import { useSyncedAddress } from "@/hooks/use-synced-address";
import { toast } from "@/lib/toast";
import { activityCopy, syncDoneBody } from "../copy";

const TOAST_ID = "wallet-sync";

type SyncState = "no-wallet" | "off" | "on";

export function useWalletSync() {
  const { address } = useAccount();
  const synced = useSyncedAddress();
  const start = useStartSync();
  const stop = useStopSync();

  let state: SyncState = "off";
  if (!address) state = "no-wallet";
  else if (synced) state = "on";

  return {
    state,
    address,
    syncedAddress: synced,
    isStarting: start.isPending,
    isStopping: stop.isPending,
    startSync: () => {
      if (!address) return;
      toast.loading(activityCopy.syncPendingTitle, { id: TOAST_ID });
      start.mutate(address, {
        onSuccess: (count) =>
          toast.success(activityCopy.syncDoneTitle, {
            id: TOAST_ID,
            description: syncDoneBody(count),
          }),
        onError: (error) => {
          console.error(error);
          toast.error(activityCopy.syncFailedTitle, {
            id: TOAST_ID,
            description: activityCopy.tryAgain,
          });
        },
      });
    },
    stopSync: () => {
      if (!address) return;
      stop.mutate(address, {
        onSuccess: () => toast.info(activityCopy.syncStopped),
        onError: () =>
          toast.error(activityCopy.syncFailedTitle, { description: activityCopy.tryAgain }),
      });
    },
  };
}
