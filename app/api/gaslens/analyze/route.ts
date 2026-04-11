import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are GasLens, an elite Solidity gas optimization expert. You specialize in reducing gas costs for EVM-compatible smart contracts including those deployed on Monad.

Your job is to analyze a Solidity contract for gas inefficiencies and return:
1. A list of specific gas optimization findings
2. A fully optimized version of the contract with ALL optimizations applied

## GAS PATTERNS TO CHECK (in order of impact)

### Critical Gas Savings (hundreds to thousands of gas each)
- Storage reads inside loops: cache storage variables in memory before the loop
- Multiple storage reads of the same variable: read once, cache in memory variable
- Unnecessary storage writes (writing the same value that's already stored)
- Using storage structs when memory structs would work

### High Gas Savings
- Functions that can be external but are marked public (public costs more for external callers)
- String/bytes parameters not marked calldata (use calldata instead of memory for read-only params)
- uint type sizing: using uint256 where uint128/uint64 etc would work AND can be packed in structs
- Not using custom errors (revert with custom error is cheaper than require with string message)
- Long require/revert strings (each 32 bytes costs extra)

### Medium Gas Savings  
- Unnecessary variable initialization to zero (uint256 x = 0 wastes gas, default is already 0)
- Using != 0 instead of > 0 for uint comparisons
- Prefix increment (++i) instead of postfix (i++) in loops
- Caching array length in loop condition instead of reading it each iteration
- Using unchecked for loop counters that cannot overflow (i++ in loops bounded by array length)

### Low Gas Savings
- Redundant parentheses in arithmetic
- Using bool for storage flags (uint256 is cheaper for storage due to packing behavior)
- Constants not marked constant/immutable
- Variables that could be immutable (set once in constructor, never changed)

## ANALYSIS RULES
- Reference SPECIFIC variable names, function names, and line numbers from the actual contract
- Calculate realistic gas estimates (storage read ~2100 gas cold, ~100 warm; storage write ~20000 new, ~5000 existing)
- Only report issues that actually exist in the provided contract — do NOT invent issues
- For the optimized contract, apply EVERY optimization you found — the output should be production-ready
- Add a brief comment on each changed line explaining the optimization

## OUTPUT FORMAT
Respond with ONLY valid JSON. No markdown, no backticks, no preamble.

{
  "contractName": "string",
  "originalGasEstimate": number (rough estimate of deployment + typical usage gas),
  "optimizedGasEstimate": number (same estimate after optimizations),
  "totalSavings": number (gas units saved),
  "savingsPercentage": number (0-100, percentage improvement),
  "summary": "string (3-4 sentences: what was found, biggest wins, overall assessment)",
  "optimizedCode": "string (the complete optimized Solidity contract as a string)",
  "optimizations": [
    {
      "id": "GAS-001",
      "impact": "critical" | "high" | "medium" | "low",
      "title": "string (specific, descriptive)",
      "description": "string (exactly what the issue is, referencing specific code)",
      "estimatedSavings": number (gas units per call or deployment),
      "lineNumbers": [number],
      "original": "string (the original code snippet)",
      "optimized": "string (the optimized replacement)"
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "No contract code provided" },
        { status: 400 }
      );
    }

    if (code.trim().length < 10) {
      return NextResponse.json(
        { error: "Contract code is too short" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured in .env.local" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 8000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this Solidity contract for gas optimizations. Check every function carefully. Reference specific variable and function names. Return the complete optimized contract.

Contract:
\`\`\`solidity
${code}
\`\`\`

Respond with ONLY valid JSON, no markdown, no preamble.`,
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
    console.error("GasLens analyze error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
