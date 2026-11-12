import { UserRejectedRequestError } from "viem";
import { monadTestnet } from "viem/chains";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";

type SwitchFailure = "rejected" | "failed";

export function useNetworkGuard() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending, error, reset } = useSwitchChain();
  const { disconnect } = useDisconnect();

  let failure: SwitchFailure | null = null;
  if (error) {
    failure =
      error.name === UserRejectedRequestError.name ||
      ("code" in error && error.code === UserRejectedRequestError.code)
        ? "rejected"
        : "failed";
  }

  return {
    isWrongNetwork: isConnected && chainId !== monadTestnet.id,
    isSwitching: isPending,
    failure,
    switchToMonad: () => switchChain({ chainId: monadTestnet.id }),
    disconnect: () => {
      reset();
      disconnect();
    },
  };
}
