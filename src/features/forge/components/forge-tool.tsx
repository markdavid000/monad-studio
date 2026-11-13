"use client";

import { IntroDialog } from "@/components/ui/intro-dialog";
import { PageTitle } from "@/components/ui/page-title";
import { forgeCopy } from "../copy";
import { useForge } from "../hooks/use-forge";
import { CompilePanel } from "./compile-panel";
import { CompileResults } from "./compile-results";
import { GeneratePanel } from "./generate-panel";
import { GeneratedResults } from "./generated-results";

export function ForgeTool() {
  const forge = useForge();

  return (
    <div className="flex min-w-0 flex-col gap-10">
      <IntroDialog screen="forge" content={forgeCopy.intro} />
      <PageTitle title={forgeCopy.title} aboutLabel={forgeCopy.about}>
        <p>{forgeCopy.lead}</p>
        <p className="text-muted-foreground">{forgeCopy.settings}</p>
      </PageTitle>
      <GeneratePanel
        prompt={forge.prompt}
        onPromptChange={forge.setPrompt}
        canGenerate={forge.canGenerate}
        isGenerating={forge.isGenerating}
        hasResult={forge.generated !== undefined && forge.openResults !== "generated"}
        onGenerate={forge.generate}
        onShowResult={() => forge.showResults("generated")}
      />
      <CompilePanel
        fileName={forge.fileName}
        source={forge.source}
        isEmpty={forge.isEmpty}
        isTooLarge={forge.isTooLarge}
        isCompiling={forge.isCompiling}
        hasResult={forge.result !== undefined}
        onCompile={forge.compile}
        onShowResult={() => forge.showResults("compiled")}
      />
      {forge.generated ? (
        <GeneratedResults
          contract={forge.generated}
          open={forge.openResults === "generated"}
          onOpenChange={(open) => forge.showResults(open ? "generated" : undefined)}
          focusedLine={forge.focusedLine}
          onFocusLine={forge.setFocusedLine}
          onUse={forge.loadGenerated}
        />
      ) : null}
      {forge.result ? (
        <CompileResults
          result={forge.result}
          open={forge.openResults === "compiled"}
          onOpenChange={(open) => forge.showResults(open ? "compiled" : undefined)}
          fileName={forge.compiledFileName}
          source={forge.compiledSource}
          isStale={forge.isStale}
          focusedLine={forge.focusedLine}
          onFocusLine={forge.setFocusedLine}
        />
      ) : null}
    </div>
  );
}
