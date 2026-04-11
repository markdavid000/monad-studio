import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are SentinelMon, an AI security monitor for smart contracts on Monad blockchain.

You analyze batches of recent transactions to a smart contract and detect anomalies or suspicious patterns.

## WHAT TO LOOK FOR

### Critical Anomalies (immediate alerts)
- Large ETH/MON drain: value of outgoing transactions unusually large compared to typical activity
- Rapid successive withdrawals: multiple withdrawals in a short time window
- Failed transactions spike: sudden increase in failed transactions (possible attack probing)
- Unusual function calls: calls to sensitive functions (selfdestruct, upgrade, transferOwnership)

### High Anomalies
- Gas usage spike: transaction using significantly more gas than typical for this contract
- New large depositor: single address depositing unusually large amount
- Unusual caller: new address calling admin/owner functions

### Medium Anomalies
- Increased activity: transaction volume much higher than baseline
- Value concentration: single address receiving most of the value flow

### Low / Info
- New interaction: first time a new address interacts with the contract
- Dormant contract waking up: contract had no activity then suddenly has a burst

## OUTPUT FORMAT
Respond with ONLY valid JSON. No markdown, no backticks.

{
  "anomalies": [
    {
      "id": "string (e.g. ALERT-001)",
      "severity": "critical" | "high" | "medium" | "low" | "info",
      "type": "drain" | "spike" | "unusual_call" | "anomaly" | "info",
      "title": "string (short descriptive title)",
      "message": "string (plain English description of what was detected)",
      "relatedTxHash": "string | null (the most relevant tx hash if applicable)"
    }
  ],
  "summary": "string (1-2 sentences: overall assessment of this batch of transactions)"
}

If no anomalies are detected, return an empty anomalies array and a clean summary.
Only flag real patterns — avoid false positives for normal activity.`;

export async function POST(req: NextRequest) {
  try {
    const { transactions, contractAddress } = await req.json();

    if (
      !transactions ||
      !Array.isArray(transactions) ||
      transactions.length === 0
    ) {
      return NextResponse.json({
        anomalies: [],
        summary: "No transactions to analyze.",
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        anomalies: [],
        summary: "AI analysis not configured.",
      });
    }

    const groq = new Groq({ apiKey });

    // Build a compact summary of transactions for the AI
    const txSummary = transactions.map((tx) => ({
      hash: tx.hash.slice(0, 10) + "...",
      from: tx.from.slice(0, 8) + "...",
      to: tx.to ? tx.to.slice(0, 8) + "..." : "contract creation",
      value: tx.value + " MON",
      gasUsed: tx.gasUsed,
      status: tx.status,
      direction: tx.direction,
      hasData: tx.input && tx.input !== "0x",
    }));

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 2000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze these ${
            transactions.length
          } recent transactions to contract ${contractAddress} for anomalies:

${JSON.stringify(txSummary, null, 2)}

Respond with ONLY valid JSON.`,
        },
      ],
    });

    const responseText = completion.choices[0]?.message?.content ?? "";
    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const result = JSON.parse(cleaned);
    return NextResponse.json(result);
  } catch (error) {
    console.error("SentinelMon analyze error:", error);
    // Don't fail hard — just return no anomalies
    return NextResponse.json({
      anomalies: [],
      summary: "Analysis unavailable for this batch.",
    });
  }
}
