import "server-only";
import { numberLines, stripCodeFences } from "@/lib/code-text";
import { completeStructured } from "@/lib/server/groq";
import { errorFixReplySchema } from "../lib/schema";
import type { CompileResult, ErrorFix } from "../types";
import { compileSolidity } from "./compile";

const SYSTEM_PROMPT = `You fix Solidity compile errors for MonadForge. The contract is compiled on its own with solc 0.8.38, for Monad testnet, an EVM compatible chain.

Return the whole file with every listed compiler error fixed so it compiles.

Rules:
- Change only what the errors need. Keep every other line exactly as it is, and keep the contract's purpose, functions, events, access control and storage layout.
- The file cannot import anything. If an error is a missing import, write the needed interface or code inside the file.
- If the pragma excludes 0.8.38, widen it to include 0.8.38.
- fixedSource: the complete file as plain Solidity, without Markdown fences and without the line numbers. No comments describing the edits.
- changes: one entry per change, with the line number in the original contract it fixes and one plain sentence on what changed and why. No Markdown.`;

function errorList(compile: Extract<CompileResult, { status: "failed" }>) {
  return compile.errors
    .map((error) => `${error.line ? `Line ${error.line}: ` : ""}${error.kind}: ${error.message}`)
    .join("\n");
}

export async function fixCompileErrors({
  fileName,
  source,
}: {
  fileName: string;
  source: string;
}): Promise<ErrorFix> {
  const current = compileSolidity({ fileName, source });
  if (current.status === "compiled") return { fixedSource: source, changes: [], compile: current };

  const reply = await completeStructured({
    name: "forge_fix_errors",
    system: SYSTEM_PROMPT,
    user: `Compiler errors:\n${errorList(current)}\n\nContract, each line starting with its number and a bar that is not part of the source:\n\n${numberLines(source)}`,
    schema: errorFixReplySchema,
    maxOutputTokens: 40_000,
  });
  const fixedSource = stripCodeFences(reply.fixedSource) || source;
  if (fixedSource.trim() === source.trim()) {
    return { fixedSource: source, changes: [], compile: current };
  }
  const lineCount = source.split("\n").length;
  return {
    fixedSource,
    changes: reply.changes
      .map((change) => ({
        line: Math.min(Math.max(1, Math.round(change.line)), lineCount),
        note: change.note.replaceAll("`", "").trim(),
      }))
      .filter((change) => change.note.length > 0),
    compile: compileSolidity({ fileName, source: fixedSource }),
  };
}
