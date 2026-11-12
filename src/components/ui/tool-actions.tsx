import { Pencil } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface ToolActionsProps {
  note: string;
  tooLarge?: { message: string; editLabel: string };
  children: ReactNode;
}

export function ToolActions({ note, tooLarge, children }: ToolActionsProps) {
  if (tooLarge) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <p role="alert" className="text-sm">
          {tooLarge.message}
        </p>
        <Link
          href="/studio"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Pencil aria-hidden className="size-3.5" />
          {tooLarge.editLabel}
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      {children}
      <p className="text-sm text-muted-foreground">{note}</p>
    </div>
  );
}
