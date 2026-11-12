"use client";

import { LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { ToolActions } from "@/components/ui/tool-actions";
import { aiCopy } from "@/lib/copy";
import { monguardCopy } from "../copy";
import { useMonguard } from "../hooks/use-monguard";
import { ReportPanel } from "./report-panel";
import { SourceView } from "./source-view";

function scanLabel(status: string, hasReport: boolean) {
  if (status === "pending") return monguardCopy.scanning;
  return hasReport ? monguardCopy.rescan : monguardCopy.scan;
}

export function MonguardTool() {
  const monguard = useMonguard();
  const isPending = monguard.status === "pending";

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageTitle title={monguardCopy.title} aboutLabel={monguardCopy.about}>
        <p>{monguardCopy.lead}</p>
        <p className="text-muted-foreground">{monguardCopy.checks}</p>
      </PageTitle>
      {monguard.isEmpty ? (
        <div className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-medium">{monguardCopy.emptyTitle}</h2>
            <p className="text-muted-foreground">{monguardCopy.emptyBody}</p>
          </div>
          <Button asChild>
            <Link href="/studio">{monguardCopy.openWorkspace}</Link>
          </Button>
        </div>
      ) : (
        <>
          <SourceView
            fileName={monguard.fileName}
            source={monguard.source}
            highlightedLines={monguard.highlightedLines}
          />
          <ToolActions
            note={aiCopy.note}
            tooLarge={
              monguard.isTooLarge
                ? { message: monguardCopy.tooLarge, editLabel: monguardCopy.editInWorkspace }
                : undefined
            }
          >
            <Button size="lg" onClick={monguard.run} disabled={isPending}>
              {isPending ? (
                <LoaderCircle aria-hidden className="animate-spin" />
              ) : (
                <ShieldCheck aria-hidden />
              )}
              {scanLabel(monguard.status, monguard.report !== undefined)}
            </Button>
          </ToolActions>
          <ReportPanel
            status={monguard.status}
            report={monguard.report}
            error={monguard.error}
            isStale={monguard.isStale}
            activeId={monguard.activeId}
            onToggle={monguard.toggle}
            onScan={monguard.run}
          />
        </>
      )}
    </div>
  );
}
