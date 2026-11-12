"use client";

import type { Address } from "viem";
import { useSessionGuard } from "../hooks/use-session-guard";

export function SessionGuard({ address }: { address: Address }) {
  useSessionGuard(address);
  return null;
}
