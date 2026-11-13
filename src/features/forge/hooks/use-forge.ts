import { useState } from "react";
import { useAcceptContract } from "@/hooks/use-accept-contract";
import { useAutoRun } from "@/hooks/use-auto-run";
import { useContractDraft } from "@/hooks/use-contract-draft";
import { useSavedRun } from "@/hooks/use-history";
import { useLastRunId } from "@/hooks/use-last-run";
import { useSendContract, type JourneyTool } from "@/hooks/use-send-contract";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { forgeCopy } from "../copy";
import { forgeRunSchema, PROMPT_MAX_LENGTH, PROMPT_MIN_LENGTH, toFileName } from "../lib/schema";
import { outlineOf } from "../lib/outline";
import type { ForgeRun, GeneratedContract } from "../types";
import { COMPILE_SLOT, useCompile } from "./use-compile";
import { DEPLOY_SLOT, useDeploy } from "./use-deploy";
import { useDeployForm } from "./use-deploy-form";
import { useSubmitVerification, useVerification } from "./use-verification";
import { useFixErrors } from "./use-fix-errors";
import { GENERATE_SLOT, useGenerate } from "./use-generate";

type ResultsKind = "generated" | "compiled";

interface SavedCompile {
  result: Extract<ForgeRun, { kind: "compile" }>["result"];
  fileName: string;
  source: string;
}

function asGenerated(run: ForgeRun | undefined) {
  return run?.kind === "generate" ? run.contract : undefined;
}

function asCompiled(
  run: ForgeRun | undefined,
  source: string | undefined
): SavedCompile | undefined {
  if (!run || run.kind === "generate" || source === undefined) return undefined;
  return { result: run.result, fileName: run.fileName, source };
}

function asDeployed(run: ForgeRun | undefined, source: string | undefined) {
  if (run?.kind !== "deploy" || source === undefined) return undefined;
  return { deployment: run.deployment, source };
}

function kindOf(run: ForgeRun | undefined): ResultsKind | undefined {
  if (!run) return undefined;
  return run.kind === "generate" ? "generated" : "compiled";
}

export function useForge(runId?: string, autoRun = false) {
  const draft = useContractDraft();
  const [prompt, setPrompt] = useState("");
  const [focusedLine, setFocusedLine] = useState<number>();
  const [openResults, setOpenResults] = useState<ResultsKind | "run" | undefined>(
    runId === undefined ? undefined : "run"
  );

  function showResults(kind: ResultsKind | undefined) {
    setFocusedLine(undefined);
    setOpenResults(kind);
  }

  const accept = useAcceptContract();
  const [isShowingCompileResult, setShowingCompileResult] = useState(false);
  const send = useSendContract();
  const generation = useGenerate(() => showResults("generated"));
  const compilation = useCompile(() => showResults("compiled"));
  const opened = useSavedRun("forge", runId, forgeRunSchema);
  const lastWritten = useSavedRun("forge", useLastRunId(GENERATE_SLOT), forgeRunSchema);
  const lastCompiled = useSavedRun("forge", useLastRunId(COMPILE_SLOT), forgeRunSchema);
  const lastDeployed = useSavedRun("forge", useLastRunId(DEPLOY_SLOT), forgeRunSchema);

  const generated =
    generation.contract ?? asGenerated(opened.report) ?? asGenerated(lastWritten.report);

  const freshCompile =
    compilation.result && compilation.compiledSource !== undefined
      ? {
          result: compilation.result,
          fileName: compilation.compiledFileName ?? draft.name,
          source: compilation.compiledSource,
        }
      : undefined;
  const compiled =
    freshCompile ??
    asCompiled(opened.report, opened.source) ??
    asCompiled(lastCompiled.report, lastCompiled.source);

  const submitVerification = useSubmitVerification();
  const deployer = useDeploy((deployment, request) => {
    submitVerification.mutate({
      address: deployment.address,
      creationTxHash: deployment.txHash,
      standardJsonInput: request.result.standardJsonInput,
      compilerVersion: request.result.compilerVersion,
      contractIdentifier: `${request.fileName}:${deployment.contractName}`,
    });
  });
  const freshDeploy =
    deployer.deployment && deployer.request
      ? { deployment: deployer.deployment, source: deployer.request.source }
      : undefined;
  const deployed = [
    freshDeploy,
    asDeployed(opened.report, opened.source),
    asDeployed(lastDeployed.report, lastDeployed.source),
  ].find((item) => item !== undefined && compiled !== undefined && item.source === compiled.source);
  const deployment = deployed?.deployment;
  const verification = useVerification(deployment?.address, submitVerification.isPending);
  const compiledResult = compiled?.result.status === "compiled" ? compiled.result : undefined;
  const deployForm = useDeployForm(compiledResult?.contracts ?? []);

  const errorFix = useFixErrors(() => {
    setShowingCompileResult(false);
    showResults("compiled");
  });
  const suggestedFix =
    errorFix.fix && compiled && errorFix.request?.source === compiled.source
      ? errorFix.fix
      : undefined;
  const compileView: "result" | "fixes" =
    suggestedFix && suggestedFix.changes.length > 0 && !isShowingCompileResult ? "fixes" : "result";

  const trimmed = prompt.trim();

  function generate() {
    showResults(undefined);
    generation.generate(trimmed);
  }

  function loadGenerated(contract: GeneratedContract) {
    accept(forgeCopy.generate.usedTitle, contract.fileName, contract.source);
    showResults(undefined);
  }

  function compileSource(name: string, source: string) {
    showResults(undefined);
    compilation.compile({ fileName: toFileName(name.replace(/\.sol$/i, "")), source });
  }

  function compile() {
    compileSource(draft.name, draft.source);
  }

  function putInWorkspace(contract: GeneratedContract) {
    if (draft.source !== contract.source) draft.load(contract.fileName, contract.source);
  }

  function compileGenerated(contract: GeneratedContract) {
    putInWorkspace(contract);
    compileSource(contract.fileName, contract.source);
  }

  function sendGenerated(tool: JourneyTool, contract: GeneratedContract) {
    send(tool, contract.source, contract.fileName);
  }

  useAutoRun(autoRun && draft.source.trim().length > 0, compile);

  function deploy() {
    const ready = deployForm.request();
    if (!ready || !compiled || !compiledResult) return;
    deployer.deploy({
      fileName: compiled.fileName,
      source: compiled.source,
      result: compiledResult,
      contractName: ready.contract.name,
      bytecode: ready.contract.bytecode,
      inputs: ready.inputs,
      args: ready.args,
      value: ready.value,
    });
  }

  function verifyAgain() {
    if (!deployment || !compiled || !compiledResult) return;
    submitVerification.mutate({
      address: deployment.address,
      creationTxHash: deployment.txHash,
      standardJsonInput: compiledResult.standardJsonInput,
      compilerVersion: compiledResult.compilerVersion,
      contractIdentifier: `${compiled.fileName}:${deployment.contractName}`,
    });
  }

  return {
    prompt,
    setPrompt,
    canGenerate:
      trimmed.length >= PROMPT_MIN_LENGTH &&
      trimmed.length <= PROMPT_MAX_LENGTH &&
      !generation.isRunning,
    isGenerating: generation.isRunning,
    generated,
    generate,
    loadGenerated,
    compileGenerated,
    sendGenerated,
    isGeneratedInWorkspace: generated !== undefined && draft.source === generated.source,
    suggestedFix,
    compileView,
    isSuggestingFixes: errorFix.isRunning,
    suggestFixes: () => {
      if (compiled?.result.status === "failed") {
        errorFix.suggest({ fileName: compiled.fileName, source: compiled.source });
      }
    },
    showCompileResult: () => setShowingCompileResult(true),
    showSuggestedFix: () => setShowingCompileResult(false),
    acceptSuggestedFix: () => {
      if (!compiled || !suggestedFix) return;
      accept(forgeCopy.compile.fixes.acceptedTitle, compiled.fileName, suggestedFix.fixedSource);
      compileSource(compiled.fileName, suggestedFix.fixedSource);
    },
    deployForm,
    deploy,
    isDeploying: deployer.isRunning,
    deployment,
    verification: verification.data,
    isVerifying: submitVerification.isPending || verification.isFetching,
    verificationFailed: submitVerification.isError || verification.isError,
    verifyAgain,
    checkVerification: () => verification.refetch(),
    sendCompiled: (tool: JourneyTool) => {
      if (compiled) send(tool, compiled.source);
    },
    fileName: draft.name,
    source: draft.source,
    outline: outlineOf(draft.source),
    isEmpty: draft.source.trim().length === 0,
    isTooLarge: byteSize(draft.source) > SOURCE_LIMIT_BYTES,
    isCompiling: compilation.isRunning,
    compiled,
    isStale: compiled !== undefined && compiled.source !== draft.source,
    isMissing: runId !== undefined && opened.isMissing,
    compile,
    focusedLine,
    setFocusedLine,
    openResults: openResults === "run" ? kindOf(opened.report) : openResults,
    showResults,
  };
}
