"use client";

import { Fuel, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { ToolActions } from "@/components/ui/tool-actions";
import { aiCopy } from "@/lib/copy";
import { gaslensCopy } from "../copy";
import { useGaslens } from "../hooks/use-gaslens";
import { CodePanel } from "./code-panel";
import { ResultPanel } from "./result-panel";

function runLabel(status: string, hasReport: boolean) {
  if (status === "pending") return gaslensCopy.analysing;
  return hasReport ? gaslensCopy.rerun : gaslensCopy.analyse;
}

export function GaslensTool() {
  const gaslens = useGaslens();
  const isPending = gaslens.status === "pending";

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageTitle title={gaslensCopy.title} aboutLabel={gaslensCopy.about}>
        <p>{gaslensCopy.lead}</p>
        <p className="text-muted-foreground">{gaslensCopy.checks}</p>
      </PageTitle>
      {gaslens.isEmpty ? (
        <div className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-medium">{gaslensCopy.emptyTitle}</h2>
            <p className="text-muted-foreground">{gaslensCopy.emptyBody}</p>
          </div>
          <Button asChild>
            <Link href="/studio">{gaslensCopy.openWorkspace}</Link>
          </Button>
        </div>
      ) : (
        <>
          <CodePanel
            fileName={gaslens.fileName}
            source={gaslens.source}
            diff={gaslens.diff}
            optimizedSource={gaslens.report?.optimizedSource}
            mode={gaslens.mode}
            hasChanges={gaslens.hasChanges}
            highlightedKeys={gaslens.highlightedKeys}
            flaggedKeys={gaslens.flaggedKeys}
            onModeChange={gaslens.setMode}
          />
          <ToolActions
            note={aiCopy.note}
            tooLarge={
              gaslens.isTooLarge
                ? { message: gaslensCopy.tooLarge, editLabel: gaslensCopy.editInWorkspace }
                : undefined
            }
          >
            <Button size="lg" onClick={gaslens.run} disabled={isPending}>
              {isPending ? (
                <LoaderCircle aria-hidden className="animate-spin" />
              ) : (
                <Fuel aria-hidden />
              )}
              {runLabel(gaslens.status, gaslens.report !== undefined)}
            </Button>
          </ToolActions>
          <ResultPanel
            status={gaslens.status}
            report={gaslens.report}
            error={gaslens.error}
            isStale={gaslens.isStale}
            activeId={gaslens.activeId}
            onToggle={gaslens.toggle}
            onRun={gaslens.run}
          />
        </>
      )}
    </div>
  );
}
