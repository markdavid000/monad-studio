import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

export function useStudioGate(onDismiss: () => void) {
  const router = useRouter();
  const { status } = useAccount();
  const { openConnectModal, connectModalOpen } = useConnectModal();
  const hasRequested = useRef(false);
  const wasShown = useRef(false);

  useEffect(() => {
    if (status === "connected") {
      router.push("/studio");
      return;
    }
    if (status !== "disconnected" || !openConnectModal || hasRequested.current) return;
    hasRequested.current = true;
    openConnectModal();
  }, [status, openConnectModal, router]);

  useEffect(() => {
    if (connectModalOpen) {
      wasShown.current = true;
      return;
    }
    if (wasShown.current && status === "disconnected") onDismiss();
  }, [connectModalOpen, status, onDismiss]);
}
