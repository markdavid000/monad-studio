import type { ReactNode } from "react";

interface NextStepBarProps {
  label: string;
  status: string;
  note?: string;
  children: ReactNode;
}

export function NextStepBar({ label, status, note, children }: NextStepBarProps) {
  return (
    <div
      role="group"
      data-next-step
      aria-label={label}
      className="flex flex-col gap-3 border-t bg-card px-5 py-3 sm:px-8 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex min-w-0 flex-col">
        <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <span className="text-sm font-medium">{status}</span>
        {note ? <span className="text-xs text-muted-foreground">{note}</span> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
