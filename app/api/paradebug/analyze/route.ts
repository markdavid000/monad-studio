import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const MONAD_RPC =
  process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC || "https://testnet-rpc.monad.xyz";

function hexToNumber(hex: string): number {
  return parseInt(hex, 16);
}

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(MONAD_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(12000),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

export interface TxAnalysis {
  hash: string;
  from: string;
  to: string;
  blockNumber: number;
  blockTimestamp: number;
  txIndex: number;
  gasUsed: number;
  executionType: "parallel" | "sequential";
  conflictReason: string | null;
  functionSelector: string | null;
  startTime: number;
  duration: number;
}

export interface ParaDebugResult {
  contractAddress: string;
  blocks: {
    blockNumber: number;
    timestamp: number;
    txCount: number;
    transactions: TxAnalysis[];
  }[];
  totalTxs: number;
  parallelCount: number;
  sequentialCount: number;
  parallelRatio: number;
  aiSuggestions: string[];
  summary: string;
  scannedBlocks: number;
}

function analyzeBlockTransactions(
  txs: TxAnalysis[],
  contractAddress: string
): TxAnalysis[] {
  const addr = contractAddress.toLowerCase();
  const selectorGroups: Record<string, TxAnalysis[]> = {};

  for (const tx of txs) {
    if ((tx.to || "").toLowerCase() !== addr) continue;
    const sel = tx.functionSelector || "fallback";
    if (!selectorGroups[sel]) selectorGroups[sel] = [];
    selectorGroups[sel].push(tx);
  }

  const conflictingHashes = new Set<string>();
  for (const [sel, group] of Object.entries(selectorGroups)) {
    if (group.length > 1) {
      group.slice(1).forEach((tx) => {
        conflictingHashes.add(tx.hash);
        tx.conflictReason = `Multiple calls to ${
          sel === "fallback" ? "fallback" : `0x${sel}`
        } in same block — likely shared storage conflict`;
      });
    }
  }

  const blockTxCount = txs.length;
  return txs.map((tx, i) => ({
    ...tx,
    executionType: conflictingHashes.has(tx.hash)
      ? ("sequential" as const)
      : ("parallel" as const),
    startTime: blockTxCount > 1 ? i / blockTxCount : 0,
    duration: blockTxCount > 1 ? 1 / blockTxCount : 1,
  }));
}

export async function POST(req: NextRequest) {
  try {
    const { contractAddress } = await req.json();

    if (!contractAddress || typeof contractAddress !== "string") {
      return NextResponse.json(
        { error: "contractAddress required" },
        { status: 400 }
      );
    }

    const addr = contractAddress.toLowerCase();

    // Get latest block
    const latestHex: string = await rpc("eth_blockNumber", []);
    const latestBlock = hexToNumber(latestHex);

    // Scan last 50 blocks directly — small enough to be fast, big enough to find activity
    // For very active contracts this will always find data
    const SCAN_RANGE = 50;
    const startBlock = Math.max(0, latestBlock - SCAN_RANGE);

    console.log(
      `[ParaDebug] Scanning blocks ${startBlock} to ${latestBlock} for ${addr}`
    );

    const blockResults: ParaDebugResult["blocks"] = [];
    let totalParallel = 0;
    let totalSequential = 0;
    let blocksWithActivity = 0;

    // Scan blocks in parallel batches of 10
    const blockNums = Array.from(
      { length: latestBlock - startBlock + 1 },
      (_, i) => startBlock + i
    ).reverse(); // newest first

    // Process in batches of 10 concurrently
    const BATCH_SIZE = 10;
    for (let i = 0; i < blockNums.length; i += BATCH_SIZE) {
      const batch = blockNums.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async (blockNum) => {
          try {
            const block = await rpc("eth_getBlockByNumber", [
              "0x" + blockNum.toString(16),
              true, // full transactions
            ]);

            if (!block?.transactions?.length) return;

            // Filter for our contract
            const relevantTxs = (
              block.transactions as Array<{
                hash: string;
                from: string;
                to: string | null;
                input: string;
                gas: string;
                transactionIndex: string;
              }>
            ).filter(
              (tx) =>
                (tx.to || "").toLowerCase() === addr ||
                (tx.from || "").toLowerCase() === addr
            );

            if (relevantTxs.length === 0) return;

            // Fetch receipts for gas used (in parallel, limit to 20 per block)
            const txsToProcess = relevantTxs.slice(0, 20);
            const txAnalyses: TxAnalysis[] = await Promise.all(
              txsToProcess.map(async (tx) => {
                let gasUsed = 0;
                try {
                  const receipt = await rpc("eth_getTransactionReceipt", [
                    tx.hash,
                  ]);
                  if (receipt) gasUsed = hexToNumber(receipt.gasUsed || "0x0");
                } catch {
                  /* skip */
                }

                return {
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to || "",
                  blockNumber: blockNum,
                  blockTimestamp: hexToNumber(block.timestamp) * 1000,
                  txIndex: hexToNumber(tx.transactionIndex || "0x0"),
                  gasUsed,
                  executionType: "parallel" as const,
                  conflictReason: null,
                  functionSelector:
                    tx.input?.length >= 10 && tx.input !== "0x"
                      ? tx.input.slice(2, 10)
                      : null,
                  startTime: 0,
                  duration: 1,
                };
              })
            );

            txAnalyses.sort((a, b) => a.txIndex - b.txIndex);
            const analyzed = analyzeBlockTransactions(
              txAnalyses,
              contractAddress
            );

            const parallel = analyzed.filter(
              (t) => t.executionType === "parallel"
            ).length;
            const sequential = analyzed.filter(
              (t) => t.executionType === "sequential"
            ).length;

            totalParallel += parallel;
            totalSequential += sequential;
            blocksWithActivity++;

            blockResults.push({
              blockNumber: blockNum,
              timestamp: hexToNumber(block.timestamp) * 1000,
              txCount: analyzed.length,
              transactions: analyzed,
            });
          } catch (err) {
            console.warn(`[ParaDebug] Failed block ${blockNum}:`, err);
          }
        })
      );
    }

    // Sort newest first
    blockResults.sort((a, b) => b.blockNumber - a.blockNumber);

    const totalTxs = totalParallel + totalSequential;
    const parallelRatio = totalTxs > 0 ? totalParallel / totalTxs : 1;

    console.log(
      `[ParaDebug] Found ${totalTxs} txs in ${blocksWithActivity} active blocks. Parallel: ${totalParallel}, Sequential: ${totalSequential}`
    );

    // AI analysis
    let aiSuggestions: string[] = [];
    let summary = "";

    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && totalTxs > 0) {
      try {
        const groq = new Groq({ apiKey: groqKey });

        const conflictExamples = blockResults
          .flatMap((b) =>
            b.transactions.filter((t) => t.executionType === "sequential")
          )
          .slice(0, 5)
          .map((t) => ({
            block: t.blockNumber,
            selector: t.functionSelector,
            reason: t.conflictReason,
          }));

        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
          max_tokens: 1000,
          messages: [
            {
              role: "system",
              content: `You are ParaDebug, an expert in Monad blockchain parallel execution optimization.
Respond with ONLY valid JSON:
{
  "summary": "2-3 sentences about execution pattern and efficiency",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`,
            },
            {
              role: "user",
              content: `Contract: ${contractAddress}
Total txs: ${totalTxs}, Parallel: ${totalParallel} (${Math.round(
                parallelRatio * 100
              )}%), Sequential: ${totalSequential}
Active blocks: ${blocksWithActivity} out of ${SCAN_RANGE} scanned
Conflict examples: ${JSON.stringify(conflictExamples)}
Give concrete Solidity suggestions to improve parallel execution. ONLY valid JSON.`,
            },
          ],
        });

        const parsed = JSON.parse(
          (completion.choices[0]?.message?.content ?? "")
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim()
        );
        aiSuggestions = parsed.suggestions || [];
        summary = parsed.summary || "";
      } catch {
        /* fall through */
      }
    }

    if (!summary) {
      const pct = Math.round(parallelRatio * 100);
      if (totalTxs === 0) {
        summary = `No transactions found in the last ${SCAN_RANGE} blocks for this contract.`;
      } else if (pct >= 80) {
        summary = `${pct}% parallel — excellent. This contract is well-optimized for Monad's parallel execution model.`;
      } else if (pct >= 50) {
        summary = `${pct}% parallel — moderate. Some storage conflicts detected. There is room to improve throughput.`;
      } else {
        summary = `Only ${pct}% parallel — high conflict rate. Shared storage contention is limiting Monad's performance benefits.`;
      }
    }

    return NextResponse.json({
      contractAddress,
      blocks: blockResults,
      totalTxs,
      parallelCount: totalParallel,
      sequentialCount: totalSequential,
      parallelRatio,
      aiSuggestions,
      summary,
      scannedBlocks: SCAN_RANGE,
    } as ParaDebugResult);
  } catch (error) {
    console.error("ParaDebug error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
