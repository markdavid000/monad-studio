"use client";

import type { ReactNode } from "react";
import { useIsClient } from "../hooks/use-is-client";

interface ClientPreviewProps {
  children: ReactNode;
}

export function ClientPreview({ children }: ClientPreviewProps) {
  const isClient = useIsClient();
  return isClient ? children : null;
}
