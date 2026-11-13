import type { ReactNode } from "react";

interface PanelCardProps {
  step: number;
  titleId: string;
  title: string;
  lead: string;
  children: ReactNode;
}

export function PanelCard({ step, titleId, title, lead, children }: PanelCardProps) {
  return (
    <section
      aria-labelledby={titleId}
      className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs text-muted-foreground"
        >
          {step}
        </span>
        <div className="flex flex-col gap-1">
          <h2 id={titleId} className="text-lg font-medium">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{lead}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
