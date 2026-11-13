"use client";

import { PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamplePicker } from "@/components/ui/example-picker";
import { PageTitle } from "@/components/ui/page-title";
import { ToolActions } from "@/components/ui/tool-actions";
import { exampleContracts } from "@/config/examples";
import { gaslensCopy, gaslensDemoCopy } from "../copy";
import { useGaslensDemo } from "../hooks/use-gaslens-demo";
import { CodePanel } from "./code-panel";
import { GasResults } from "./gas-results";

export function GaslensDemo() {
  const demo = useGaslensDemo();
  const { example, report } = demo;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageTitle title={gaslensCopy.title} aboutLabel={gaslensCopy.about}>
        <p>{gaslensDemoCopy.lead}</p>
        <p className="text-muted-foreground">{gaslensCopy.checks}</p>
      </PageTitle>
      <ExamplePicker
        label={gaslensDemoCopy.pick}
        examples={exampleContracts}
        activeName={example?.name ?? ""}
        onPick={demo.pick}
      />
      {example ? (
        <CodePanel
          fileName={example.name}
          source={example.source}
          diff={[]}
          optimizedSource={undefined}
          mode="source"
          hasChanges={false}
          highlightedKeys={[]}
          flaggedKeys={[]}
          onModeChange={demo.view.setMode}
          canEdit={false}
        />
      ) : null}
      {report && example ? (
        <>
          <ToolActions note={gaslensDemoCopy.note}>
            <Button size="lg" onClick={demo.open}>
              <PanelRightOpen aria-hidden />
              {gaslensDemoCopy.run}
            </Button>
          </ToolActions>
          <GasResults
            report={report}
            open={demo.isResultsOpen}
            onOpenChange={demo.setResultsOpen}
            fileName={example.name}
            source={example.source}
            isStale={false}
            canEdit={false}
            view={demo.view}
          />
        </>
      ) : null}
    </div>
  );
}
