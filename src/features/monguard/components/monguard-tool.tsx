"use client";

import { Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { aiCopy } from "@/lib/copy";
import { monguardCopy } from "../copy";
import { useMonguard } from "../hooks/use-monguard";
import { ReportPanel } from "./report-panel";
import { SourceView } from "./source-view";

export function MonguardTool() {
  const monguard = useMonguard();

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium tracking-[-0.02em]">{monguardCopy.title}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{monguardCopy.lead}</p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info aria-hidden className="size-4 shrink-0" />
          {aiCopy.note}
        </p>
      </div>
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
        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-2">
          <SourceView
            fileName={monguard.fileName}
            source={monguard.source}
            highlightedLines={monguard.highlightedLines}
          />
          <ReportPanel
            status={monguard.status}
            report={monguard.report}
            error={monguard.error}
            isTooLarge={monguard.isTooLarge}
            isStale={monguard.isStale}
            activeId={monguard.activeId}
            onToggle={monguard.toggle}
            onScan={monguard.run}
          />
        </div>
      )}
    </div>
  );
}
