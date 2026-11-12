"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { walletCopy } from "../copy";

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, mounted, openAccountModal, openChainModal, openConnectModal }) => {
        if (!mounted) {
          return <span aria-hidden className="inline-block h-8 w-36" />;
        }
        if (!account || !chain) {
          return (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {walletCopy.network}
              </span>
              <Button size="sm" onClick={openConnectModal}>
                <Wallet aria-hidden />
                {walletCopy.connect}
              </Button>
            </div>
          );
        }
        if (chain.unsupported) {
          return (
            <Button size="sm" variant="destructive" onClick={openChainModal}>
              {walletCopy.switchNetwork}
            </Button>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={openChainModal}
              aria-label={walletCopy.networkMenu}
              className="hidden sm:inline-flex"
            >
              <span aria-hidden className="size-1.5 rounded-full bg-success" />
              {chain.name ?? walletCopy.network}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={openAccountModal}
              aria-label={walletCopy.accountMenu}
              className="font-mono"
            >
              {account.displayName}
              <ChevronDown aria-hidden />
            </Button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
