import { Fuel, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toolBySlug } from "@/config/tools";
import type { HistoryRun, HistoryTool } from "@/lib/history";
import { activityCopy } from "../copy";

const ICONS = { monguard: ShieldCheck, gaslens: Fuel } satisfies Record<HistoryTool, unknown>;

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

interface RunItemProps {
  run: HistoryRun;
  onOpen: () => void;
  onDelete: () => void;
}

export function RunItem({ run, onOpen, onDelete }: RunItemProps) {
  const Icon = ICONS[run.tool];

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border bg-card px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
        <Icon aria-hidden className="size-4 text-muted-foreground" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="truncate font-mono text-sm">{run.contractName}</span>
          <span className="text-xs text-muted-foreground">{toolBySlug[run.tool].name}</span>
        </p>
        <p className="text-sm text-muted-foreground">{run.summary}</p>
      </div>
      <time
        dateTime={new Date(run.createdAt).toISOString()}
        className="font-mono text-xs text-muted-foreground"
      >
        {dateFormat.format(run.createdAt)}
      </time>
      <div className="flex items-center gap-1">
        <Button size="sm" onClick={onOpen}>
          {activityCopy.open}
        </Button>
        <Button size="sm" variant="ghost" aria-label={activityCopy.deleteRun} onClick={onDelete}>
          <Trash2 aria-hidden />
        </Button>
      </div>
    </li>
  );
}
