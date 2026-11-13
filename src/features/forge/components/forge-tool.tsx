"use client";

import { IntroDialog } from "@/components/ui/intro-dialog";
import { PageTitle } from "@/components/ui/page-title";
import { historyCopy } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { forgeCopy } from "../copy";
import { useForge } from "../hooks/use-forge";
import { CompilePanel } from "./compile-panel";
import { CompileResults } from "./compile-results";
import { DeployPanel } from "./deploy-panel";
import { DeploymentCard } from "./deployment-card";
import { GeneratePanel } from "./generate-panel";
import { GeneratedResults } from "./generated-results";
import { CompiledNextStep, WrittenNextStep } from "./next-step";
import { VerifyPanel } from "./verify-panel";

interface ForgeToolProps {
  runId?: string;
  autoRun?: boolean;
}

export function ForgeTool({ runId, autoRun }: ForgeToolProps) {
  const forge = useForge(runId, autoRun);
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
      <div
        role="tablist"
        aria-label={forgeCopy.tabs.label}
        className="flex w-fit rounded-lg border p-1"
      >
        {(["build", "verify"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`forge-tab-${tab}`}
            aria-selected={forge.tab === tab}
            aria-controls={`forge-panel-${tab}`}
            onClick={() => forge.setTab(tab)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              forge.tab === tab
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {forgeCopy.tabs[tab]}
          </button>
        ))}
      </div>
      {forge.tab === "build" ? (
        <div role="tabpanel" id="forge-panel-build" aria-labelledby="forge-tab-build">
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
        </div>
      ) : (
        <div role="tabpanel" id="forge-panel-verify" aria-labelledby="forge-tab-verify">
          <VerifyPanel
            form={forge.verifySource}
            fileName={forge.fileName}
            source={forge.source}
            outline={forge.outline}
            isTooLarge={forge.isTooLarge}
          />
        </div>
      )}
      {generated ? (
        <GeneratedResults
          contract={generated}
          open={forge.openResults === "generated"}
          onOpenChange={(open) => forge.showResults(open ? "generated" : undefined)}
          focusedLine={forge.focusedLine}
          onFocusLine={forge.setFocusedLine}
          footer={
            <WrittenNextStep
              isInWorkspace={forge.isGeneratedInWorkspace}
              onUse={() => forge.loadGenerated(generated)}
              onCompile={() => forge.compileGenerated(generated)}
              onSend={(tool) => forge.sendGenerated(tool, generated)}
            />
          }
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
          suggestedFix={forge.compileView === "fixes" ? forge.suggestedFix : undefined}
          deployment={
            <>
              {forge.deployment ? (
                <DeploymentCard
                  deployment={forge.deployment}
                  verification={forge.verification}
                  isVerifying={forge.isVerifying}
                  verificationFailed={forge.verificationFailed}
                  onVerifyAgain={forge.verifyAgain}
                  onCheck={forge.checkVerification}
                />
              ) : null}
              <DeployPanel form={forge.deployForm} />
            </>
          }
          onBackToResult={forge.showCompileResult}
          footer={
            <CompiledNextStep
              isCompiled={compiled.result.status === "compiled"}
              view={forge.compileView}
              hasFix={forge.suggestedFix !== undefined && forge.suggestedFix.changes.length > 0}
              isSuggesting={forge.isSuggestingFixes}
              onSuggest={forge.suggestFixes}
              onShowFix={forge.showSuggestedFix}
              onAcceptFix={forge.acceptSuggestedFix}
              onSend={forge.sendCompiled}
              deployName={forge.deployForm.contract?.name}
              deployedAddress={forge.deployment?.address}
              isDeploying={forge.isDeploying}
              onDeploy={forge.deploy}
            />
          }
        />
      ) : null}
    </div>
  );
}
