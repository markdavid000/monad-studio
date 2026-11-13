import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useSessionStatus } from "./use-wallet-session";

export function useStudioGate(next: string, onDismiss: () => void) {
  const router = useRouter();
  const authStatus = useSessionStatus();
  const { status: walletStatus } = useAccount();
  const { openConnectModal, connectModalOpen } = useConnectModal();
  const wasShown = useRef(false);

  useEffect(() => {
    if (authStatus === "authenticated") {
      router.push(next);
      return;
    }
    if (connectModalOpen) {
      wasShown.current = true;
      return;
    }
    if (authStatus !== "unauthenticated") return;
    if (walletStatus === "connecting" || walletStatus === "reconnecting") return;
    if (walletStatus === "disconnected" && wasShown.current) {
      onDismiss();
      return;
    }
    if (!openConnectModal) return;
    const timer = window.setTimeout(openConnectModal, 0);
    return () => window.clearTimeout(timer);
  }, [authStatus, walletStatus, connectModalOpen, openConnectModal, router, next, onDismiss]);
}
