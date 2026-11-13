"use client";

import { Fuel, LoaderCircle, PanelRightOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IntroDialog } from "@/components/ui/intro-dialog";
import { PageTitle } from "@/components/ui/page-title";
import { ToolActions } from "@/components/ui/tool-actions";
import { aiCopy, historyCopy } from "@/lib/copy";
import { gaslensCopy } from "../copy";
import { useGaslens } from "../hooks/use-gaslens";
import { CodePanel } from "./code-panel";
import { GasResults } from "./gas-results";
import { NextStep } from "./next-step";

function runLabel(isPending: boolean, hasReport: boolean) {
  if (isPending) return gaslensCopy.analysing;
  return hasReport ? gaslensCopy.rerun : gaslensCopy.analyse;
}

interface GaslensToolProps {
  runId?: string;
  autoRun?: boolean;
}

export function GaslensTool({ runId, autoRun }: GaslensToolProps) {
  const gaslens = useGaslens(runId, autoRun);
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
            onModeChange={gaslens.view.setMode}
            canEdit
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
        <GasResults
          report={report}
          open={gaslens.isResultsOpen}
          onOpenChange={gaslens.setResultsOpen}
          fileName={gaslens.fileName}
          source={gaslens.source}
          isStale={gaslens.isStale}
          canEdit
          view={gaslens.view}
          footer={
            <NextStep
              hasChanges={gaslens.view.hasChanges}
              check={report.check}
              isAccepted={gaslens.isAccepted}
              canAccept={gaslens.canAccept}
              onAccept={gaslens.acceptRewrite}
              onSend={gaslens.sendTo}
            />
          }
        />
      ) : null}
    </div>
  );
}
