"use client";

import { PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamplePicker } from "@/components/ui/example-picker";
import { PageTitle } from "@/components/ui/page-title";
import { ToolActions } from "@/components/ui/tool-actions";
import { exampleContracts } from "@/config/examples";
import { monguardCopy, monguardDemoCopy } from "../copy";
import { useMonguardDemo } from "../hooks/use-monguard-demo";
import { ScanResults } from "./scan-results";
import { SourceView } from "./source-view";

export function MonguardDemo() {
  const demo = useMonguardDemo();
  const { example, report } = demo;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageTitle title={monguardCopy.title} aboutLabel={monguardCopy.about}>
        <p>{monguardDemoCopy.lead}</p>
        <p className="text-muted-foreground">{monguardCopy.checks}</p>
      </PageTitle>
      <ExamplePicker
        label={monguardDemoCopy.pick}
        examples={exampleContracts}
        activeName={example?.name ?? ""}
        onPick={demo.pick}
      />
      {example ? (
        <SourceView
          fileName={example.name}
          source={example.source}
          highlightedLines={[]}
          canEdit={false}
        />
      ) : null}
      {report && example ? (
        <>
          <ToolActions note={monguardDemoCopy.note}>
            <Button size="lg" onClick={demo.open}>
              <PanelRightOpen aria-hidden />
              {monguardDemoCopy.run}
            </Button>
          </ToolActions>
          <ScanResults
            report={report}
            open={demo.isResultsOpen}
            onOpenChange={demo.setResultsOpen}
            fileName={example.name}
            source={example.source}
            highlightedLines={demo.highlightedLines}
            isStale={false}
            canEdit={false}
            activeId={demo.activeId}
            onToggle={demo.toggle}
          />
        </>
      ) : null}
    </div>
  );
}
