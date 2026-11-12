"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IntroDialog } from "@/components/ui/intro-dialog";
import { PageTitle } from "@/components/ui/page-title";
import { toolBySlug } from "@/config/tools";
import { HISTORY_TOOLS } from "@/lib/history";
import { cn } from "@/lib/utils";
import { activityCopy, runCount } from "../copy";
import { useActivity, type ActivityFilter } from "../hooks/use-activity";
import { RunItem } from "./run-item";
import { SyncPanel } from "./sync-panel";

const FILTERS: readonly ActivityFilter[] = ["all", ...HISTORY_TOOLS];

function filterLabel(filter: ActivityFilter) {
  return filter === "all" ? activityCopy.all : toolBySlug[filter].name;
}

export function ActivityLog() {
  const activity = useActivity();

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <IntroDialog screen="activity" content={activityCopy.intro} />
      <PageTitle title={activityCopy.title} aboutLabel={activityCopy.about}>
        <p>{activityCopy.aboutBody}</p>
        <p className="text-muted-foreground">{activityCopy.aboutStorage}</p>
      </PageTitle>
      <SyncPanel />
      {activity.status === "pending" ? (
        <ul aria-hidden className="flex flex-col gap-2">
          {[0, 1, 2].map((row) => (
            <li key={row} className="h-16 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </ul>
      ) : null}
      {activity.status === "error" ? (
        <p role="alert" className="rounded-xl border bg-card p-6 text-muted-foreground">
          {activityCopy.unavailable}
        </p>
      ) : null}
      {activity.status === "success" && activity.total === 0 ? (
        <EmptyState
          title={activityCopy.emptyTitle}
          body={activityCopy.emptyBody}
          action={
            <Button asChild>
              <Link href="/studio">{activityCopy.openWorkspace}</Link>
            </Button>
          }
        />
      ) : null}
      {activity.status === "success" && activity.total > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="group"
              aria-label={activityCopy.filterLabel}
              className="flex rounded-lg border p-0.5"
            >
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={activity.filter === filter}
                  onClick={() => activity.setFilter(filter)}
                  className={cn(
                    "rounded-md px-3 py-1 text-sm transition-colors",
                    activity.filter === filter
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {filterLabel(filter)}
                  <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                    {filter === "all" ? activity.total : activity.countFor(filter)}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{runCount(activity.total)}</p>
          </div>
          {activity.items.length === 0 ? (
            <EmptyState title={activityCopy.filteredTitle} body={activityCopy.filteredBody} />
          ) : (
            <ul className="flex flex-col gap-2">
              {activity.items.map((run) => (
                <RunItem
                  key={run.id}
                  run={run}
                  isOpening={activity.openingId === run.id}
                  onOpen={() => activity.open(run)}
                  onDelete={() => activity.remove(run.id)}
                />
              ))}
            </ul>
          )}
          <Dialog.Root open={activity.isConfirmingClear} onOpenChange={activity.setConfirmingClear}>
            <Dialog.Trigger asChild>
              <Button variant="outline" className="self-start">
                <Trash2 aria-hidden />
                {activityCopy.clear}
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="sheet-overlay fixed inset-0 z-50 bg-black/50" />
              <Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl border bg-background p-6 shadow-2xl">
                <Dialog.Title className="text-lg font-medium">
                  {activityCopy.clearTitle}
                </Dialog.Title>
                <Dialog.Description className="text-muted-foreground">
                  {activity.isSynced ? activityCopy.clearSyncedBody : activityCopy.clearBody}
                </Dialog.Description>
                <div className="flex justify-end gap-2">
                  <Dialog.Close asChild>
                    <Button variant="outline">{activityCopy.cancel}</Button>
                  </Dialog.Close>
                  <Button
                    variant="destructive"
                    disabled={activity.isClearing}
                    onClick={activity.clearAll}
                  >
                    {activityCopy.confirmClear}
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </>
      ) : null}
    </div>
  );
}
