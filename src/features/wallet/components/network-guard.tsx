"use client";

import { LoaderCircle } from "lucide-react";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";
import { networkGuardCopy } from "../copy";
import { useNetworkGuard } from "../hooks/use-network-guard";

export function NetworkGuard() {
  const guard = useNetworkGuard();

  return (
    <Dialog.Root open={guard.isWrongNetwork}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl border bg-popover p-6 text-popover-foreground shadow-lg"
        >
          <div className="flex flex-col gap-2">
            <Dialog.Title className="text-lg font-medium">{networkGuardCopy.title}</Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              {networkGuardCopy.body}
            </Dialog.Description>
          </div>
          {guard.failure ? (
            <p role="alert" className="text-sm text-destructive">
              {networkGuardCopy[guard.failure]}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={guard.disconnect}>
              {networkGuardCopy.disconnect}
            </Button>
            <Button onClick={guard.switchToMonad} disabled={guard.isSwitching}>
              {guard.isSwitching ? (
                <>
                  <LoaderCircle aria-hidden className="animate-spin" />
                  {networkGuardCopy.confirming}
                </>
              ) : (
                networkGuardCopy.switch
              )}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
