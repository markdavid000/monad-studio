"use client";

import { IntroDialog } from "@/components/ui/intro-dialog";
import { PageTitle } from "@/components/ui/page-title";
import { historyCopy } from "@/lib/copy";
import { forgeCopy } from "../copy";
import { useForge } from "../hooks/use-forge";
import { CompilePanel } from "./compile-panel";
import { CompileResults } from "./compile-results";
import { GeneratePanel } from "./generate-panel";
import { GeneratedResults } from "./generated-results";

interface ForgeToolProps {
  runId?: string;
}

export function ForgeTool({ runId }: ForgeToolProps) {
  const forge = useForge(runId);
  const { compiled, generated } = forge;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <IntroDialog screen="forge" content={forgeCopy.intro} />
      <PageTitle title={forgeCopy.title} aboutLabel={forgeCopy.about}>
        <p>{forgeCopy.lead}</p>
        <p className="text-muted-foreground">{forgeCopy.settings}</p>
      </PageTitle>
      {forge.isMissing ? (
        <p role="status" className="text-sm text-muted-foreground">
          {historyCopy.missing}
        </p>
      ) : null}
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <GeneratePanel
          prompt={forge.prompt}
          onPromptChange={forge.setPrompt}
          canGenerate={forge.canGenerate}
          isGenerating={forge.isGenerating}
          generated={generated}
          onGenerate={forge.generate}
          onShowResult={() => forge.showResults("generated")}
        />
        <CompilePanel
          fileName={forge.fileName}
          source={forge.source}
          outline={forge.outline}
          isEmpty={forge.isEmpty}
          isTooLarge={forge.isTooLarge}
          isCompiling={forge.isCompiling}
          lastResult={compiled?.result}
          isStale={forge.isStale}
          onCompile={forge.compile}
          onShowResult={() => forge.showResults("compiled")}
        />
      </div>
      {generated ? (
        <GeneratedResults
          contract={generated}
          open={forge.openResults === "generated"}
          onOpenChange={(open) => forge.showResults(open ? "generated" : undefined)}
          focusedLine={forge.focusedLine}
          onFocusLine={forge.setFocusedLine}
          onUse={forge.loadGenerated}
        />
      ) : null}
      {compiled ? (
        <CompileResults
          result={compiled.result}
          open={forge.openResults === "compiled"}
          onOpenChange={(open) => forge.showResults(open ? "compiled" : undefined)}
          fileName={compiled.fileName}
          source={compiled.source}
          isStale={forge.isStale}
          focusedLine={forge.focusedLine}
          onFocusLine={forge.setFocusedLine}
        />
      ) : null}
    </div>
  );
}
