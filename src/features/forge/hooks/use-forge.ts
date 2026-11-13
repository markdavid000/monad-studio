import { useState } from "react";
import { useContractDraft } from "@/hooks/use-contract-draft";
import { useSavedRun } from "@/hooks/use-history";
import { useLastRunId } from "@/hooks/use-last-run";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { toast } from "@/lib/toast";
import { forgeCopy } from "../copy";
import { forgeRunSchema, PROMPT_MAX_LENGTH, PROMPT_MIN_LENGTH, toFileName } from "../lib/schema";
import { outlineOf } from "../lib/outline";
import type { ForgeRun, GeneratedContract } from "../types";
import { COMPILE_SLOT, useCompile } from "./use-compile";
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
  if (run?.kind !== "compile" || source === undefined) return undefined;
  return { result: run.result, fileName: run.fileName, source };
}

function kindOf(run: ForgeRun | undefined): ResultsKind | undefined {
  if (!run) return undefined;
  return run.kind === "generate" ? "generated" : "compiled";
}

export function useForge(runId?: string) {
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

  const generation = useGenerate(() => showResults("generated"));
  const compilation = useCompile(() => showResults("compiled"));
  const opened = useSavedRun("forge", runId, forgeRunSchema);
  const lastWritten = useSavedRun("forge", useLastRunId(GENERATE_SLOT), forgeRunSchema);
  const lastCompiled = useSavedRun("forge", useLastRunId(COMPILE_SLOT), forgeRunSchema);

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

  const trimmed = prompt.trim();

  function generate() {
    showResults(undefined);
    generation.generate(trimmed);
  }

  function loadGenerated(contract: GeneratedContract) {
    draft.load(contract.fileName, contract.source);
    showResults(undefined);
    toast.success(forgeCopy.generate.usedTitle, { description: contract.fileName });
  }

  function compile() {
    showResults(undefined);
    compilation.compile({
      fileName: toFileName(draft.name.replace(/\.sol$/i, "")),
      source: draft.source,
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
