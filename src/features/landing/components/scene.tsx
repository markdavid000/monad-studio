"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "../hooks/use-in-view";

interface SceneProps {
  children: ReactNode;
  className?: string;
}

export function Scene({ children, className }: SceneProps) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} data-play={isInView} className={cn("scene", className)}>
      {children}
    </div>
  );
}
