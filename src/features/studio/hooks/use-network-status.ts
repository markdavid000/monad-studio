import { monadTestnet } from "viem/chains";
import { useAccount, useBlockNumber } from "wagmi";

export function useNetworkStatus() {
  const block = useBlockNumber({ chainId: monadTestnet.id, watch: true });
  const account = useAccount();

  return {
    blockNumber: block.data,
    blockStatus: block.isError ? "error" : block.data === undefined ? "loading" : "live",
    address: account.address,
    isConnected: account.isConnected,
  } as const;
}
