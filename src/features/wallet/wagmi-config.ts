import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "viem/chains";
import { cookieStorage, createStorage } from "wagmi";
import { publicEnv } from "@/config/env";
import { walletCopy } from "./copy";

export function createWagmiConfig() {
  return getDefaultConfig({
    appName: walletCopy.appName,
    projectId: publicEnv.walletConnectProjectId,
    chains: [monadTestnet],
    ssr: true,
    storage: createStorage({ storage: cookieStorage }),
  });
}
