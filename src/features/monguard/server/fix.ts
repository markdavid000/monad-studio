import "server-only";
import { numberLines } from "@/lib/code-text";
import { completeStructured } from "@/lib/server/groq";
import { fixReplySchema, toFixResult } from "../lib/schema";
import type { FixInput, FixResult } from "../types";

const SYSTEM_PROMPT = `You are MonGuard applying security fixes to a Solidity contract deployed to Monad, an EVM compatible chain.

You get the contract and a list of findings, each with an id, a title, a fix and suggested fix code for the affected lines. Return the whole contract with exactly those fixes applied.

Rules:
- Apply only the listed fixes. Do not fix, rename, reformat or reorder anything else, and keep every other line exactly as it is.
- Keep the interface: every external and public function, event, error and public state variable keeps its name and signature, unless the fix itself requires a change.
- The suggested fix code is guidance for the affected lines, not a patch. Merge it into the contract so the whole file compiles.
- If two fixes conflict, or a fix cannot be applied without changing what the contract is for, leave it out and list it in skipped with a short reason.
- fixedSource: the complete contract as plain Solidity, without Markdown fences and without the line numbers. No comments describing the edits.
- applied: one entry per fix you applied, with its id and one plain sentence on what changed.
- skipped: one entry per fix you left out, with its id and one plain sentence on why.`;

function findingList(input: FixInput) {
  return input.findings
    .map(
      (finding) =>
        `${finding.id}: ${finding.title}\nLines: ${finding.lines.join(", ") || "none"}\nFix: ${finding.fix}\nSuggested code:\n${finding.fixCode || "(none)"}`
    )
    .join("\n\n");
}

export async function fixContract(input: FixInput): Promise<FixResult> {
  const reply = await completeStructured({
    name: "monguard_fix",
    system: SYSTEM_PROMPT,
    user: `Findings to fix:\n\n${findingList(input)}\n\nContract, each line starting with its number and a bar that is not part of the source:\n\n${numberLines(input.source)}`,
    schema: fixReplySchema,
    maxOutputTokens: 40_000,
    retryBudgetMs: 30_000,
  });
  return toFixResult(
    reply,
    input.source,
    input.findings.map((finding) => finding.id)
  );
}
