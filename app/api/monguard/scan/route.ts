import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are MonGuard, an experienced elite smart contract security auditor with deep expertise in Solidity, EVM internals, and DeFi exploit patterns. You have audited hundreds of contracts and found vulnerabilities that other tools missed.

Your job is to perform a DEEP, THOROUGH security analysis of Solidity contracts. You must reason carefully about each function, its interactions with other functions, and how an attacker could exploit them.

## CRITICAL ANALYSIS REQUIREMENTS

Before reporting, you MUST reason through each of these areas explicitly:

### 1. Arithmetic Safety
- Identify ALL uses of \`unchecked\` blocks — these disable Solidity 0.8+ overflow protection
- For every unchecked operation, trace what values could be passed by a user
- Ask: can a user-controlled parameter cause overflow or underflow in an unchecked block?
- Ask: does an overflow in one place cause underflow in another place that depends on it?
- Example: if \`fee = unchecked(a + b)\` overflows to near 0, then \`unchecked(msg.value - fee)\` could underflow to a massive number

### 2. Reentrancy
- Find every external call: \`.call()\`, \`.transfer()\`, \`.send()\`, interface calls
- For EACH external call, check: is ALL relevant state updated BEFORE this call?
- The Checks-Effects-Interactions pattern requires state changes BEFORE external calls
- Even if one function looks safe, check if another function skips the state update

### 3. Access Control Consistency
- Map out every privileged function and what it checks
- Does \`transferOwnership\` exist? If so, do ALL owner-only functions use the same owner variable?
- Are there functions that use alternative access checks (e.g. checking a mapping value) that become stale after ownership transfer?
- Can a previous owner retain access after transferring ownership?

### 4. User-Controlled Parameters
- Identify every parameter passed by the caller
- Trace each parameter through all calculations
- Ask: what happens at extreme values (0, type(uint256).max, very large numbers)?
- Are user-controlled values added to contract-level values inside unchecked blocks?

### 5. Fee and Financial Logic
- Can fees be set to values that break calculations (e.g. feeBps > BASIS_POINTS)?
- Can fee calculations result in fees larger than the amount being processed?
- Can a user manipulate fee parameters to pay zero fees or receive more than deposited?

### 6. State Consistency
- After all functions execute, is the contract state always valid?
- Can mappings reach impossible states?
- Are there sentinel values (like type(uint256).max) used for special purposes that could be reached by normal operations?

### 7. Standard Checks
- Missing events on state changes
- Centralization risks (owner can rug)
- Front-running opportunities
- Gas griefing

## SCORING
- Start at 100
- Critical vulnerability (funds at direct risk): -25 each
- High vulnerability (significant risk, indirect fund loss possible): -15 each
- Medium vulnerability (notable issue, limited impact): -8 each
- Low vulnerability (best practice violation): -3 each
- Info (informational, no direct risk): -1 each
- Minimum score: 0

## OUTPUT FORMAT
You MUST respond with ONLY valid JSON. No preamble, no explanation outside JSON, no markdown backticks.

{
  "contractName": "string (infer from contract keyword)",
  "score": number,
  "summary": "string (3-4 sentences: overall posture, worst finding, recommendation)",
  "vulnerabilities": [
    {
      "id": "VULN-001",
      "severity": "critical" | "high" | "medium" | "low" | "info",
      "title": "string (specific, descriptive title)",
      "description": "string (precise technical description with specific variable/function names from the code)",
      "explanation": "string (plain English: why is this dangerous, what can an attacker do, what is the impact)",
      "suggestedFix": "string (concrete fix with code example where possible)",
      "lineNumbers": [number] (line numbers of the vulnerable code, empty array if not determinable)
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
          content: `Perform a deep security audit of this Solidity smart contract. Carefully trace all arithmetic operations (especially unchecked blocks), all external calls, all access control checks, and all user-controlled parameters before responding.

Contract to audit:
\`\`\`solidity
${code}
\`\`\`

Remember: respond with ONLY valid JSON, no markdown, no preamble.`,
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
    console.error("MonGuard scan error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Scan failed. Please try again." },
      { status: 500 }
    );
  }
}
