"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitAuthenticationProvider, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { useRainbowTheme } from "../hooks/use-rainbow-theme";
import { useWalletSession } from "../hooks/use-wallet-session";
import { createWagmiConfig } from "../wagmi-config";
import { NetworkGuard } from "./network-guard";

interface WalletProvidersProps {
  children: ReactNode;
}

function AuthenticatedRainbowKit({ children }: WalletProvidersProps) {
  const theme = useRainbowTheme();
  const session = useWalletSession();

  return (
    <RainbowKitAuthenticationProvider adapter={session.adapter} status={session.status}>
      <RainbowKitProvider theme={theme} modalSize="compact">
        {children}
        <NetworkGuard />
      </RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  );
}

export function WalletProviders({ children }: WalletProvidersProps) {
  const [config] = useState(createWagmiConfig);
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthenticatedRainbowKit>{children}</AuthenticatedRainbowKit>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
