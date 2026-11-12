"use client";

import { cn } from "@/lib/utils";
import { studioCopy } from "../copy";
import { useNetworkStatus } from "../hooks/use-network-status";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function StatusRail() {
  const { blockNumber, blockStatus, address, isConnected } = useNetworkStatus();

  return (
    <aside className="flex flex-col gap-4">
      <section aria-labelledby="network-title" className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2
            id="network-title"
            className="font-mono text-xs tracking-wide text-muted-foreground uppercase"
          >
            {studioCopy.network.title}
          </h2>
          <span
            className={cn(
              "flex items-center gap-1.5 font-mono text-xs",
              blockStatus === "live" && "text-success",
              blockStatus === "error" && "text-severity-critical",
              blockStatus === "loading" && "text-muted-foreground"
            )}
          >
            <span aria-hidden className="relative flex size-1.5">
              {blockStatus === "live" ? (
                <span className="absolute inline-flex size-full rounded-full bg-success opacity-75 motion-safe:animate-ping" />
              ) : null}
              <span className="relative inline-flex size-1.5 rounded-full bg-current" />
            </span>
            {blockStatus === "live"
              ? studioCopy.network.live
              : blockStatus === "error"
                ? studioCopy.network.error
                : studioCopy.network.loading}
          </span>
        </div>
        <p className="mt-3 font-medium">{studioCopy.network.name}</p>
        <dl className="mt-3 grid grid-cols-2 gap-3 font-mono text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">{studioCopy.network.chain}</dt>
            <dd>{studioCopy.network.chainId}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{studioCopy.network.block}</dt>
            <dd aria-live="off" className="tabular-nums">
              {blockNumber === undefined ? "" : blockNumber.toLocaleString("en-US")}
            </dd>
          </div>
        </dl>
      </section>
      <section aria-labelledby="wallet-title" className="rounded-xl border bg-card p-4">
        <h2
          id="wallet-title"
          className="font-mono text-xs tracking-wide text-muted-foreground uppercase"
        >
          {studioCopy.wallet.title}
        </h2>
        <p className="mt-3 flex items-center gap-2 font-medium">
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full",
              isConnected ? "bg-success" : "bg-muted-foreground/50"
            )}
          />
          {isConnected ? studioCopy.wallet.connected : studioCopy.wallet.disconnected}
        </p>
        {isConnected && address ? (
          <p className="mt-1 font-mono text-sm text-muted-foreground">{shortAddress(address)}</p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">{studioCopy.wallet.note}</p>
        )}
      </section>
    </aside>
  );
}
