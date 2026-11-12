import { UserRejectedRequestError } from "viem";
import { monadTestnet } from "viem/chains";
import { useAccount, useSignMessage } from "wagmi";
import { useStartSync, useStopSync } from "@/hooks/use-history";
import { useSyncedAddress } from "@/hooks/use-synced-address";
import { toast } from "@/lib/toast";
import { activityCopy, syncDoneBody } from "../copy";

const TOAST_ID = "wallet-sync";

type SyncState = "no-wallet" | "off" | "on";

function isRejection(error: Error) {
  for (let current: unknown = error; current instanceof Error; current = current.cause) {
    if (
      current.name === UserRejectedRequestError.name ||
      ("code" in current && current.code === UserRejectedRequestError.code)
    ) {
      return true;
    }
  }
  return false;
}

export function useWalletSync() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const synced = useSyncedAddress();
  const start = useStartSync();
  const stop = useStopSync();

  let state: SyncState = "off";
  if (synced && synced === address) state = "on";
  else if (!address) state = synced ? "on" : "no-wallet";

  return {
    state,
    address,
    syncedAddress: synced,
    isStarting: start.isPending,
    isStopping: stop.isPending,
    startSync: () => {
      if (!address) return;
      toast.loading(activityCopy.syncPendingTitle, {
        id: TOAST_ID,
        description: activityCopy.syncPendingBody,
      });
      start.mutate(
        {
          address,
          chainId: monadTestnet.id,
          signMessage: (message) => signMessageAsync({ message }),
        },
        {
          onSuccess: (count) =>
            toast.success(activityCopy.syncDoneTitle, {
              id: TOAST_ID,
              description: syncDoneBody(count),
            }),
          onError: (error) => {
            if (isRejection(error)) {
              toast.info(activityCopy.syncCancelled, { id: TOAST_ID });
              return;
            }
            console.error(error);
            toast.error(activityCopy.syncFailedTitle, {
              id: TOAST_ID,
              description: activityCopy.tryAgain,
            });
          },
        }
      );
    },
    stopSync: () =>
      stop.mutate(undefined, {
        onSuccess: () => toast.info(activityCopy.syncStopped),
        onError: () =>
          toast.error(activityCopy.syncFailedTitle, { description: activityCopy.tryAgain }),
      }),
  };
}
