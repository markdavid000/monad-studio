import type { ReactNode } from "react";
import { landingCopy } from "../copy";

interface ToolsSectionProps {
  children: ReactNode;
}

export function ToolsSection({ children }: ToolsSectionProps) {
  return (
    <section aria-labelledby="tools-title" className="flex flex-col gap-6 pb-20">
      <h2 id="tools-title" className="text-xl font-semibold tracking-tight">
        {landingCopy.toolsHeading}
      </h2>
      {children}
      <p className="text-sm text-muted-foreground">{landingCopy.honesty}</p>
    </section>
  );
}
