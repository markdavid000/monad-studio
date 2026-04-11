import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const solc = require("solc");

const MONAD_RPC = "https://testnet-rpc.monad.xyz";

async function getOnchainBytecode(address: string): Promise<string> {
  const res = await fetch(MONAD_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getCode",
      params: [address, "latest"],
    }),
  });
  const data = await res.json();
  return data.result || "0x";
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

export async function POST(req: NextRequest) {
  try {
    const { contractAddress, sourceCode, contractName } = await req.json();

    const sanitized = sanitizeCode(sourceCode);
    const solcVersion: string = solc.version();

    const input = JSON.stringify({
      language: "Solidity",
      sources: { "contract.sol": { content: sanitized } },
      settings: {
        optimizer: { enabled: true, runs: 200 },
        metadata: { bytecodeHash: "none", useLiteralContent: true },
        outputSelection: {
          "*": { "*": ["evm.bytecode", "evm.deployedBytecode"] },
        },
      },
    });

    const output = JSON.parse(solc.compile(input));
    const errors = (output.errors || []).filter(
      (e: { severity: string }) => e.severity === "error"
    );
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0].formattedMessage });
    }

    const contracts = output.contracts?.["contract.sol"];
    const contract =
      contracts?.[contractName] ?? contracts?.[Object.keys(contracts || {})[0]];

    const recompiledDeployed =
      "0x" + (contract?.evm?.deployedBytecode?.object || "");

    const onchainBytecode = await getOnchainBytecode(contractAddress);

    // Strip metadata suffix (last 53 bytes = 106 hex chars) for partial match
    const onchainStripped = onchainBytecode.slice(0, -106);
    const recompiledStripped = recompiledDeployed.slice(0, -106);

    return NextResponse.json({
      solcVersion,
      contractName: Object.keys(contracts || {})[0],
      onchainLength: onchainBytecode.length,
      recompiledLength: recompiledDeployed.length,
      exactMatch: onchainBytecode === recompiledDeployed,
      strippedMatch:
        onchainStripped === recompiledStripped && onchainStripped.length > 10,
      onchainFirst100: onchainBytecode.slice(0, 100),
      recompiledFirst100: recompiledDeployed.slice(0, 100),
      onchainLast60: onchainBytecode.slice(-60),
      recompiledLast60: recompiledDeployed.slice(-60),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
