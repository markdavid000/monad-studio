"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { useRainbowTheme } from "../hooks/use-rainbow-theme";
import { createWagmiConfig } from "../wagmi-config";
import { NetworkGuard } from "./network-guard";

interface WalletProvidersProps {
  children: ReactNode;
}

export function WalletProviders({ children }: WalletProvidersProps) {
  const [config] = useState(createWagmiConfig);
  const [queryClient] = useState(() => new QueryClient());
  const theme = useRainbowTheme();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme} modalSize="compact">
          {children}
          <NetworkGuard />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
