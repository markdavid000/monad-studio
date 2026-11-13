import "server-only";
import { numberLines } from "@/lib/code-text";
import { completeStructured } from "@/lib/server/groq";
import { UpstreamError } from "@/lib/server/upstream-error";
import { checkReplySchema, toRewriteCheck } from "../lib/schema";
import type { RewriteCheck } from "../types";

const SYSTEM_PROMPT = `You are a Solidity reviewer checking a gas optimised rewrite against the original contract. The rewrite must behave exactly like the original. Your job is to find every function in the rewrite whose behaviour can differ.

Compare the contracts function by function. A function differs when any input, caller or contract state can produce different state changes, return values, events, reverts or external calls. Only one change is allowed: a revert string replaced by a custom error.

Look hard for:
- Aliasing: a storage or mapping value cached in a local variable, then the same storage written through another key that can be equal (a recipient that is the sender, two indexes that match), then the stale local written back.
- Removed or weakened checks, modifiers and access control.
- Public state variables or functions that lost their getter, changed visibility or changed signature.
- unchecked blocks that can overflow or underflow for some input.
- State changes moved across an external call.
- Storage layout changes, constants or immutables with a different value, changed loop bounds or off by one errors.
- Events with different arguments, or emitted at a different point.

Rules:
- Report only real behaviour differences you can describe with a concrete input. Do not report gas changes that keep behaviour, formatting or renamed locals.
- An empty list is the right answer when the rewrite behaves the same.
- functionName: the function, modifier or variable in the rewrite.
- description: one or two plain sentences naming the input that behaves differently and what goes wrong. No Markdown.
- lines: line numbers in the rewrite, shown at the start of each of its lines.`;

export async function checkRewrite(original: string, rewritten: string): Promise<RewriteCheck> {
  try {
    const reply = await completeStructured({
      name: "gaslens_rewrite_check",
      system: SYSTEM_PROMPT,
      user: `Original contract:\n\n${numberLines(original)}\n\nRewrite to check (report these line numbers):\n\n${numberLines(rewritten)}`,
      schema: checkReplySchema,
      maxOutputTokens: 8_192,
      retryBudgetMs: 40_000,
    });
    return toRewriteCheck(reply, rewritten);
  } catch (error) {
    if (!(error instanceof UpstreamError)) throw error;
    console.warn("GasLens rewrite check failed", error);
    return { status: "unavailable", risks: [] };
  }
}
