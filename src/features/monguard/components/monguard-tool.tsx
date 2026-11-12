"use client";

import { LoaderCircle, PanelRightOpen, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IntroDialog } from "@/components/ui/intro-dialog";
import { PageTitle } from "@/components/ui/page-title";
import { ResultsSheet } from "@/components/ui/results-sheet";
import { ToolActions } from "@/components/ui/tool-actions";
import { aiCopy, historyCopy } from "@/lib/copy";
import { monguardCopy } from "../copy";
import { useMonguard } from "../hooks/use-monguard";
import { ReportPanel } from "./report-panel";
import { SourceView } from "./source-view";

function scanLabel(isPending: boolean, hasReport: boolean) {
  if (isPending) return monguardCopy.scanning;
  return hasReport ? monguardCopy.rescan : monguardCopy.scan;
}

interface MonguardToolProps {
  runId?: string;
}

export function MonguardTool({ runId }: MonguardToolProps) {
  const monguard = useMonguard(runId);
  const { report } = monguard;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <IntroDialog screen="monguard" content={monguardCopy.intro} />
      <PageTitle title={monguardCopy.title} aboutLabel={monguardCopy.about}>
        <p>{monguardCopy.lead}</p>
        <p className="text-muted-foreground">{monguardCopy.checks}</p>
      </PageTitle>
      {monguard.isEmpty ? (
        <EmptyState
          title={monguardCopy.emptyTitle}
          body={monguardCopy.emptyBody}
          action={
            <Button asChild>
              <Link href="/studio">{monguardCopy.openWorkspace}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <SourceView fileName={monguard.fileName} source={monguard.source} highlightedLines={[]} />
          <ToolActions
            note={aiCopy.note}
            tooLarge={
              monguard.isTooLarge
                ? { message: monguardCopy.tooLarge, editLabel: monguardCopy.editInWorkspace }
                : undefined
            }
          >
            <Button size="lg" onClick={monguard.run} disabled={monguard.isPending}>
              {monguard.isPending ? (
                <LoaderCircle aria-hidden className="animate-spin" />
              ) : (
                <ShieldCheck aria-hidden />
              )}
              {scanLabel(monguard.isPending, report !== undefined)}
            </Button>
            {report && !monguard.isResultsOpen ? (
              <Button size="lg" variant="outline" onClick={() => monguard.setResultsOpen(true)}>
                <PanelRightOpen aria-hidden />
                {monguardCopy.showResults}
              </Button>
            ) : null}
          </ToolActions>
          {monguard.isMissing ? (
            <p role="status" className="text-sm text-muted-foreground">
              {historyCopy.missing}
            </p>
          ) : null}
        </>
      )}
      {report ? (
        <ResultsSheet
          open={monguard.isResultsOpen}
          onOpenChange={monguard.setResultsOpen}
          title={monguardCopy.resultsTitle}
          description={report.contractName}
          closeLabel={aiCopy.closeResults}
        >
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <div className="min-w-0 lg:sticky lg:top-0">
              <SourceView
                fileName={monguard.fileName}
                source={monguard.scannedSource}
                highlightedLines={monguard.highlightedLines}
              />
            </div>
            <ReportPanel
              report={report}
              isStale={monguard.isStale}
              activeId={monguard.activeId}
              onToggle={monguard.toggle}
            />
          </div>
        </ResultsSheet>
      ) : null}
    </div>
  );
}
