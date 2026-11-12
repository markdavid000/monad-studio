"use client";

import { useStudioGate } from "../hooks/use-studio-gate";
import { WalletProviders } from "./wallet-providers";

interface StudioGateProps {
  next: string;
  onDismiss: () => void;
}

function Gate({ next, onDismiss }: StudioGateProps) {
  useStudioGate(next, onDismiss);
  return null;
}

export function StudioGate({ next, onDismiss }: StudioGateProps) {
  return (
    <WalletProviders>
      <Gate next={next} onDismiss={onDismiss} />
    </WalletProviders>
  );
}
