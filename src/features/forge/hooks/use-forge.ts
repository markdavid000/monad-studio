import { useState } from "react";
import { useContractDraft } from "@/hooks/use-contract-draft";
import { showAiErrorToast } from "@/lib/ai-toast";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { toast } from "@/lib/toast";
import { compiledTitle, errorsTitle, forgeCopy } from "../copy";
import { PROMPT_MAX_LENGTH, PROMPT_MIN_LENGTH, toFileName } from "../lib/schema";
import type { CompileResult, GeneratedContract } from "../types";
import { useCompile } from "./use-compile";
import { useGenerate } from "./use-generate";

type ResultsKind = "generated" | "compiled";

const GENERATE_TOAST = "forge-generate";
const COMPILE_TOAST = "forge-compile";

function showCompiledToast(result: CompileResult) {
  if (result.status === "failed") {
    toast.error(forgeCopy.compile.failedTitle, {
      id: COMPILE_TOAST,
      description: errorsTitle(result.errors.length),
    });
    return;
  }
  toast.success(compiledTitle(result.contracts.length), { id: COMPILE_TOAST });
}

export function useForge() {
  const draft = useContractDraft();
  const generation = useGenerate();
  const compilation = useCompile();
  const [prompt, setPrompt] = useState("");
  const [focusedLine, setFocusedLine] = useState<number>();
  const [openResults, setOpenResults] = useState<ResultsKind>();

  function showResults(kind: ResultsKind | undefined) {
    setFocusedLine(undefined);
    setOpenResults(kind);
  }

  const trimmed = prompt.trim();

  function generate() {
    showResults(undefined);
    toast.loading(forgeCopy.generate.pendingTitle, {
      id: GENERATE_TOAST,
      description: forgeCopy.generate.pendingBody,
    });
    generation.generate(trimmed, {
      onSuccess: (contract) => {
        toast.success(forgeCopy.generate.doneTitle, {
          id: GENERATE_TOAST,
          description: contract.contractName,
        });
        showResults("generated");
      },
      onError: (error) => {
        showAiErrorToast(error, {
          id: GENERATE_TOAST,
          title: forgeCopy.generate.failedTitle,
          onRetry: generate,
        });
      },
    });
  }

  function loadGenerated(contract: GeneratedContract) {
    draft.load(contract.fileName, contract.source);
    compilation.reset();
    showResults(undefined);
    toast.success(forgeCopy.generate.usedTitle, { description: contract.fileName });
  }

  function compile() {
    showResults(undefined);
    compilation.compile(
      { fileName: toFileName(draft.name.replace(/\.sol$/i, "")), source: draft.source },
      {
        onSuccess: (result) => {
          showCompiledToast(result);
          showResults("compiled");
        },
        onError: (error) => {
          showAiErrorToast(error, {
            id: COMPILE_TOAST,
            title: forgeCopy.compile.failedTitle,
            onRetry: compile,
          });
        },
      }
    );
  }

  return {
    prompt,
    setPrompt,
    canGenerate:
      trimmed.length >= PROMPT_MIN_LENGTH &&
      trimmed.length <= PROMPT_MAX_LENGTH &&
      generation.status !== "pending",
    isGenerating: generation.status === "pending",
    generated: generation.contract,
    generate,
    loadGenerated,
    fileName: draft.name,
    source: draft.source,
    isEmpty: draft.source.trim().length === 0,
    isTooLarge: byteSize(draft.source) > SOURCE_LIMIT_BYTES,
    isCompiling: compilation.status === "pending",
    result: compilation.result,
    compiledSource: compilation.compiledSource ?? draft.source,
    compiledFileName: compilation.compiledFileName ?? draft.name,
    isStale: compilation.result !== undefined && compilation.compiledSource !== draft.source,
    compile,
    focusedLine,
    setFocusedLine,
    openResults,
    showResults,
  };
}
