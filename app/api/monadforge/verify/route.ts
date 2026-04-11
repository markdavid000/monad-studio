import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

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

export async function POST(req: NextRequest) {
  try {
    const {
      contractAddress,
      totalTxs,
      parallelCount,
      sequentialCount,
      parallelRatio,
      conflictExamples,
    } = await req.json();

    if (!contractAddress) {
      return NextResponse.json(
        { error: "contractAddress required" },
        { status: 400 }
      );
    }

    let aiSuggestions: string[] = [];
    let summary = "";

    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && totalTxs > 0) {
      try {
        const groq = new Groq({ apiKey: groqKey });
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
Total txs: ${totalTxs}, Parallel: ${parallelCount} (${Math.round(
                parallelRatio * 100
              )}%), Sequential: ${sequentialCount}
Conflict examples: ${JSON.stringify(conflictExamples || [])}
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
      summary =
        totalTxs === 0
          ? "No transactions found in the scanned block range."
          : pct >= 80
          ? `${pct}% parallel — excellent. This contract is well-optimized for Monad's parallel execution.`
          : pct >= 50
          ? `${pct}% parallel — moderate. Some storage conflicts detected. There is room to improve throughput.`
          : `Only ${pct}% parallel — high conflict rate. Shared storage contention is limiting Monad's performance.`;
    }

    return NextResponse.json({ aiSuggestions, summary });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
