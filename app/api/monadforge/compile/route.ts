import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const solc = require("solc");

interface SolcOutput {
  errors?: Array<{ severity: string; formattedMessage: string }>;
  contracts?: Record<
    string,
    Record<
      string,
      {
        abi: object[];
        evm: { bytecode: { object: string } };
      }
    >
  >;
}

function sanitizeCode(code: string): string {
  return code
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("SPDX-License-Identifier")) return "// " + trimmed;
      if (/\brevert\s*;/.test(line) && !/\brevert\s*\(/.test(line)) {
        return line.replace(/\brevert\s*;/, "revert();");
      }
      return line;
    })
    .join("\n");
}

// Extracts just the version+commit part from solc.version()
// e.g. "0.8.20+commit.a1b79de6.Emscripten.clang" → "0.8.20+commit.a1b79de6"
function getCompilerVersion(): string {
  try {
    const full: string = solc.version();
    const match = full.match(/(\d+\.\d+\.\d+\+commit\.[a-f0-9]+)/);
    return match ? match[1] : full;
  } catch {
    return "0.8.34+commit.80d5c536";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { code, contractName } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "No contract code provided" },
        { status: 400 }
      );
    }

    const sanitized = sanitizeCode(code);
    const compilerVersion = getCompilerVersion();

    console.log("[Compile] Using solc version:", compilerVersion);

    const input = JSON.stringify({
      language: "Solidity",
      sources: {
        "contract.sol": { content: sanitized },
      },
      settings: {
        optimizer: { enabled: true, runs: 200 },
        metadata: {
          bytecodeHash: "none",
          useLiteralContent: true,
        },
        outputSelection: {
          "*": { "*": ["abi", "evm.bytecode"] },
        },
      },
    });

    const output: SolcOutput = JSON.parse(solc.compile(input));

    const errors = (output.errors || []).map((e) => ({
      severity: e.severity,
      message: e.formattedMessage,
    }));

    const hasErrors = errors.some((e) => e.severity === "error");
    if (hasErrors) {
      return NextResponse.json(
        {
          error:
            errors.find((e) => e.severity === "error")?.message ||
            "Compilation failed",
        },
        { status: 400 }
      );
    }

    const contracts = output.contracts?.["contract.sol"];
    if (!contracts) {
      return NextResponse.json(
        { error: "No contracts found in output" },
        { status: 400 }
      );
    }

    const targetName =
      Object.keys(contracts).find((n) => n === contractName) ??
      Object.keys(contracts)[0];

    const contract = contracts[targetName];
    const bytecode = contract?.evm?.bytecode?.object;

    if (!bytecode) {
      return NextResponse.json(
        { error: "Bytecode not generated" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      abi: contract.abi,
      bytecode: "0x" + bytecode,
      contractName: targetName,
      compilerVersion, // ← return actual version so verification can use it
      warnings: errors
        .filter((e) => e.severity === "warning")
        .map((e) => e.message),
    });
  } catch (error) {
    console.error("Compile error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Compilation failed" },
      { status: 500 }
    );
  }
}
