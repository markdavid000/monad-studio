import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, body, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border bg-card px-6 py-14 text-center",
        className
      )}
    >
      <div className="flex max-w-md flex-col gap-1.5">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-muted-foreground">{body}</p>
      </div>
      {action}
    </div>
  );
}
