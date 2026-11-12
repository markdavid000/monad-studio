"use client";

import { Fuel, LoaderCircle, PanelRightOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IntroDialog } from "@/components/ui/intro-dialog";
import { PageTitle } from "@/components/ui/page-title";
import { ResultsSheet } from "@/components/ui/results-sheet";
import { ToolActions } from "@/components/ui/tool-actions";
import { aiCopy, historyCopy } from "@/lib/copy";
import { gaslensCopy } from "../copy";
import { useGaslens } from "../hooks/use-gaslens";
import { CodePanel } from "./code-panel";
import { ResultPanel } from "./result-panel";

function runLabel(isPending: boolean, hasReport: boolean) {
  if (isPending) return gaslensCopy.analysing;
  return hasReport ? gaslensCopy.rerun : gaslensCopy.analyse;
}

interface GaslensToolProps {
  runId?: string;
}

export function GaslensTool({ runId }: GaslensToolProps) {
  const gaslens = useGaslens(runId);
  const { report } = gaslens;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <IntroDialog screen="gaslens" content={gaslensCopy.intro} />
      <PageTitle title={gaslensCopy.title} aboutLabel={gaslensCopy.about}>
        <p>{gaslensCopy.lead}</p>
        <p className="text-muted-foreground">{gaslensCopy.checks}</p>
      </PageTitle>
      {gaslens.isEmpty ? (
        <EmptyState
          title={gaslensCopy.emptyTitle}
          body={gaslensCopy.emptyBody}
          action={
            <Button asChild>
              <Link href="/studio">{gaslensCopy.openWorkspace}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <CodePanel
            fileName={gaslens.fileName}
            source={gaslens.draftSource}
            diff={[]}
            optimizedSource={undefined}
            mode="source"
            hasChanges={false}
            highlightedKeys={[]}
            flaggedKeys={[]}
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
            <Button size="lg" onClick={gaslens.run} disabled={gaslens.isPending}>
              {gaslens.isPending ? (
                <LoaderCircle aria-hidden className="animate-spin" />
              ) : (
                <Fuel aria-hidden />
              )}
              {runLabel(gaslens.isPending, report !== undefined)}
            </Button>
            {report && !gaslens.isResultsOpen ? (
              <Button size="lg" variant="outline" onClick={() => gaslens.setResultsOpen(true)}>
                <PanelRightOpen aria-hidden />
                {gaslensCopy.showResults}
              </Button>
            ) : null}
          </ToolActions>
          {gaslens.isMissing ? (
            <p role="status" className="text-sm text-muted-foreground">
              {historyCopy.missing}
            </p>
          ) : null}
        </>
      )}
      {report ? (
        <ResultsSheet
          open={gaslens.isResultsOpen}
          onOpenChange={gaslens.setResultsOpen}
          title={gaslensCopy.resultsTitle}
          description={report.contractName}
          closeLabel={aiCopy.closeResults}
        >
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <div className="min-w-0 lg:sticky lg:top-0">
              <CodePanel
                fileName={gaslens.fileName}
                source={gaslens.source}
                diff={gaslens.diff}
                optimizedSource={report.optimizedSource}
                mode={gaslens.mode}
                hasChanges={gaslens.hasChanges}
                highlightedKeys={gaslens.highlightedKeys}
                flaggedKeys={gaslens.flaggedKeys}
                onModeChange={gaslens.setMode}
              />
            </div>
            <ResultPanel
              report={report}
              isStale={gaslens.isStale}
              activeId={gaslens.activeId}
              onToggle={gaslens.toggle}
            />
          </div>
        </ResultsSheet>
      ) : null}
    </div>
  );
}
