"use client";

import dynamic from "next/dynamic";
import { useInterceptedClick } from "@/hooks/use-intercepted-click";

const StudioGate = dynamic(() => import("@/features/wallet").then((module) => module.StudioGate), {
  ssr: false,
});

const STUDIO_ENTRY = "[data-studio-entry]";

export function StudioEntryGate() {
  const entry = useInterceptedClick(STUDIO_ENTRY);
  return entry.isTriggered ? <StudioGate onDismiss={entry.reset} /> : null;
}
