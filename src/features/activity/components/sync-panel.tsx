import { Cloud, CloudOff, LoaderCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { activityCopy, syncedWith } from "../copy";
import { useWalletSync } from "../hooks/use-wallet-sync";

export function SyncPanel() {
  const sync = useWalletSync();

  if (sync.state === "on" && sync.syncedAddress) {
    return (
      <section
        aria-label={activityCopy.syncLabel}
        className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-card p-5"
      >
        <div className="flex items-start gap-3">
          <Cloud aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">{syncedWith(sync.syncedAddress)}</p>
            <p className="max-w-2xl text-sm text-muted-foreground">{activityCopy.syncOnBody}</p>
            <p className="text-xs text-muted-foreground">{activityCopy.stopSyncNote}</p>
          </div>
        </div>
        <Button variant="outline" onClick={sync.stopSync} disabled={sync.isStopping}>
          <CloudOff aria-hidden />
          {activityCopy.stopSync}
        </Button>
      </section>
    );
  }

  return (
    <section
      aria-label={activityCopy.syncLabel}
      className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-card p-5"
    >
      <div className="flex items-start gap-3">
        <Wallet aria-hidden className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <p className="font-medium">{activityCopy.syncOffTitle}</p>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {sync.state === "no-wallet" ? activityCopy.syncNoWalletBody : activityCopy.syncOffBody}
          </p>
          {sync.syncedAddress && sync.state === "off" ? (
            <p className="text-xs text-muted-foreground">
              {activityCopy.syncOtherWallet} {syncedWith(sync.syncedAddress)}
            </p>
          ) : null}
        </div>
      </div>
      {sync.state === "off" ? (
        <Button onClick={sync.startSync} disabled={sync.isStarting}>
          {sync.isStarting ? (
            <LoaderCircle aria-hidden className="animate-spin" />
          ) : (
            <Cloud aria-hidden />
          )}
          {sync.isStarting ? activityCopy.syncConfirm : activityCopy.syncButton}
        </Button>
      ) : null}
    </section>
  );
}
