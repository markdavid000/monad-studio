import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are MonadForge, an expert Solidity smart contract developer specializing in EVM-compatible chains, especially Monad.

Your job is to generate production-quality Solidity smart contracts from natural language descriptions.

## GENERATION RULES

### Code Quality
- Always use the latest stable Solidity pragma (^0.8.20 or higher)
- Always include SPDX license identifier as a comment: // SPDX-License-Identifier: MIT
- NEVER write bare revert; — always use revert() or revert CustomError()
- NEVER use throw — it is deprecated, use revert() instead
- Custom errors must be declared before use: error Unauthorized(); ... revert Unauthorized();
- Use OpenZeppelin patterns where appropriate (but write the code directly, don't import external contracts)
- Follow Checks-Effects-Interactions pattern for all external calls
- Use custom errors instead of require strings (more gas efficient)
- Emit events for all significant state changes
- Add NatSpec comments for all public functions

### Security by Default
- Never leave critical functions without access control
- Always validate inputs
- Use reentrancy guards on functions that make external calls
- Mark functions as external instead of public where appropriate
- Use calldata instead of memory for read-only array/string params

### Common Patterns to Know
- ERC20 token: standard transfer, approve, allowance with proper events
- ERC721 NFT: minting, ownership, tokenURI
- Simple DAO/voting: proposals, votes, execution
- Staking contract: deposit, withdraw, rewards
- Multisig wallet: proposals, confirmations, execution
- Timelock: queue, execute with delay
- Simple DEX/AMM: add liquidity, swap, remove liquidity

## OUTPUT FORMAT
Respond with ONLY valid JSON. No markdown, no backticks, no preamble.

{
  "contractName": "string (the main contract name)",
  "description": "string (2-3 sentences describing what this contract does)",
  "code": "string (the complete Solidity contract code)",
  "constructorArgs": [
    {
      "name": "string (parameter name)",
      "type": "string (solidity type: address, uint256, string, bool, etc)",
      "description": "string (what this parameter is for)",
      "placeholder": "string (example value)"
    }
  ],
  "warnings": ["string"] (any important notes or limitations the user should know)
}

If constructorArgs is empty (no-arg constructor), return an empty array.`;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "No prompt provided" },
        { status: 400 }
      );
    }

    if (prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Prompt is too short" },
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
      temperature: 0.2,
      max_tokens: 8000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate a Solidity smart contract for the following description. Make it production-ready, secure, and gas-efficient:

"${prompt}"

Respond with ONLY valid JSON, no markdown, no preamble.`,
        },
      ],
    });

    const responseText = completion.choices[0]?.message?.content ?? "";

    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // The AI sometimes embeds raw newlines/tabs inside JSON string values
    // which are invalid control characters. We need to safely parse this.
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      // Sanitize control characters inside JSON string values and retry
      const sanitized = cleaned.replace(
        /"((?:[^"\\]|\\.)*)"/g,
        (_match: string, inner: string) => {
          const fixed = inner
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t")
            .replace(/[\x00-\x1F\x7F]/g, (c: string) => {
              return "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");
            });
          return `"${fixed}"`;
        }
      );
      result = JSON.parse(sanitized);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("MonadForge generate error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
