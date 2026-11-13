import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getAddress, type Address } from "viem";
import { useAccount } from "wagmi";
import { connectUrl } from "@/lib/studio-entry";
import { endSession } from "@/lib/sync-api";
import { useSessionStatus } from "./use-wallet-session";

const SETTLE_MS = 3000;

export function useSessionGuard(sessionAddress: Address) {
  const router = useRouter();
  const { status, address } = useAccount();
  const authStatus = useSessionStatus();
  const [isSettled, setSettled] = useState(false);
  const hasSeenWallet = useRef(false);
  const isLeaving = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(true), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status !== "disconnected") hasSeenWallet.current = true;
    const isWalletGone = status === "disconnected" && (hasSeenWallet.current || isSettled);
    const isOtherWallet =
      status === "connected" && address !== undefined && getAddress(address) !== sessionAddress;
    const isSignedOut = authStatus === "unauthenticated";
    if (isLeaving.current || !(isWalletGone || isOtherWallet || isSignedOut)) return;

    isLeaving.current = true;
    const next = window.location.pathname + window.location.search;
    endSession()
      .catch((error: unknown) => console.error(error))
      .finally(() => router.replace(connectUrl(next)));
  }, [status, address, authStatus, isSettled, sessionAddress, router]);
}
