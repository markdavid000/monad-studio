"use client";

import dynamic from "next/dynamic";
import { useConnectRequest } from "@/hooks/use-connect-request";
import { useInterceptedClick } from "@/hooks/use-intercepted-click";

const StudioGate = dynamic(() => import("@/features/wallet").then((module) => module.StudioGate), {
  ssr: false,
});

const STUDIO_ENTRY = "[data-studio-entry]";

export function StudioEntryGate() {
  const entry = useInterceptedClick(STUDIO_ENTRY);
  const request = useConnectRequest();

  if (!entry.isTriggered && !request.isRequested) return null;
  return (
    <StudioGate
      next={request.next}
      onDismiss={() => {
        entry.reset();
        request.clear();
      }}
    />
  );
}
