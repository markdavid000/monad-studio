import "server-only";
import { numberLines } from "@/lib/code-text";
import { completeStructured } from "@/lib/server/groq";
import { UpstreamError } from "@/lib/server/upstream-error";
import { generateReplySchema, toGenerated } from "../lib/schema";
import type { CompileResult, GeneratedContract } from "../types";
import { compileSolidity } from "./compile";

const SYSTEM_PROMPT = `You are MonadForge, a Solidity developer writing contracts for Monad testnet, an EVM compatible chain.

MON is Monad's native currency, exactly like ETH on Ethereum: it is sent with a transaction as msg.value, held in a contract's balance, and paid out with a low level call. MON is never an ERC20 token. When the user mentions MON, deposits, payments or funds, use payable functions and msg.value, with no token interface.

Write one complete, compilable Solidity file that does what the user describes.

Rules:
- Start with // SPDX-License-Identifier: MIT and pragma solidity ^0.8.24;
- One file, no imports. The file is compiled on its own, so write any ownership, reentrancy or token logic it needs inside it.
- Name the main contract after what it does, in PascalCase. Put it last in the file.
- Use custom errors and revert with them. Emit an event for every state change a user would want to track.
- Give critical functions access control, validate inputs, and follow checks, effects, interactions for every external call or value transfer.
- Use external only for functions never called from inside the contract; a function that receive() or another function calls must be public or internal. Use calldata for read only array and string parameters.
- Write an ERC20 or ERC721 only when the user asks for a token or an NFT.
- Never use block.prevrandao, block.timestamp or blockhash as a source of randomness. If the user asks for randomness, say in notes that it needs an oracle and leave the function out.
- Short NatSpec on public and external functions is fine. No other comments.
- If the request is unsafe, illegal or not a smart contract, write the closest safe contract and say what you left out in notes.
- source: the whole file as plain Solidity, without Markdown fences.
- contractName: the main contract's name.
- summary: two or three plain sentences on what the contract does and who can call what.
- notes: short plain sentences on assumptions you made, constructor arguments the deployer must choose, and anything the user should check before deploying. No Markdown.`;

const REPAIR_PROMPT = `You fix Solidity compile errors in a contract MonadForge wrote for Monad testnet.

Return the same contract with every listed error fixed and nothing else changed: same purpose, same functions, same access control. Keep the same rules: one file, no imports, MON is the native currency paid with msg.value. Return contractName, summary, source and notes in the same shape, with source as the whole file without Markdown fences.`;

function errorList(compile: Extract<CompileResult, { status: "failed" }>) {
  return compile.errors
    .map((error) => `${error.line ? `Line ${error.line}: ` : ""}${error.kind}: ${error.message}`)
    .join("\n");
}

async function writeContract(prompt: string) {
  const reply = await completeStructured({
    name: "forge_generate",
    system: SYSTEM_PROMPT,
    user: `Write a Solidity contract for this description:\n\n${prompt}`,
    schema: generateReplySchema,
    maxOutputTokens: 16_000,
  });
  const generated = toGenerated(reply);
  return {
    ...generated,
    compile: compileSolidity({ fileName: generated.fileName, source: generated.source }),
  };
}

async function repairContract(prompt: string, draft: GeneratedContract) {
  if (draft.compile.status !== "failed") return draft;
  try {
    const reply = await completeStructured({
      name: "forge_repair",
      system: REPAIR_PROMPT,
      user: `The user asked for: ${prompt}\n\nCompiler errors:\n${errorList(draft.compile)}\n\nContract, each line starting with its number and a bar that is not part of the source:\n\n${numberLines(draft.source)}`,
      schema: generateReplySchema,
      maxOutputTokens: 16_000,
      retryBudgetMs: 25_000,
    });
    const repaired = toGenerated(reply);
    return {
      ...repaired,
      compile: compileSolidity({ fileName: repaired.fileName, source: repaired.source }),
    };
  } catch (error) {
    if (!(error instanceof UpstreamError)) throw error;
    console.warn("MonadForge repair pass failed, returning the first draft", error);
    return draft;
  }
}

export async function generateContract({ prompt }: { prompt: string }): Promise<GeneratedContract> {
  return repairContract(prompt, await writeContract(prompt));
}
