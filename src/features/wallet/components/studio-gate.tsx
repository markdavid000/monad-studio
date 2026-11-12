"use client";

import { useStudioGate } from "../hooks/use-studio-gate";
import { WalletProviders } from "./wallet-providers";

interface StudioGateProps {
  onDismiss: () => void;
}

function Gate({ onDismiss }: StudioGateProps) {
  useStudioGate(onDismiss);
  return null;
}

export function StudioGate({ onDismiss }: StudioGateProps) {
  return (
    <WalletProviders>
      <Gate onDismiss={onDismiss} />
    </WalletProviders>
  );
}
