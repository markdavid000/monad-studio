"use client";

import { IntroDialog } from "@/components/ui/intro-dialog";
import { PageTitle } from "@/components/ui/page-title";
import { forgeCopy } from "../copy";
import { useForge } from "../hooks/use-forge";
import { CompilePanel } from "./compile-panel";
import { GeneratePanel } from "./generate-panel";

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
        generated={forge.generated}
        onGenerate={forge.generate}
        onUse={forge.loadGenerated}
      />
      <CompilePanel
        fileName={forge.fileName}
        source={forge.source}
        isEmpty={forge.isEmpty}
        isTooLarge={forge.isTooLarge}
        isCompiling={forge.isCompiling}
        isStale={forge.isStale}
        result={forge.result}
        focusedLine={forge.focusedLine}
        onFocusLine={forge.setFocusedLine}
        onCompile={forge.compile}
      />
    </div>
  );
}
