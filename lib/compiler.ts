// Compiles Solidity using the solc compiler loaded from CDN
// Returns ABI + bytecode ready for deployment

export interface CompileResult {
  abi: object[];
  bytecode: string;
  contractName: string;
}

export interface CompileError {
  message: string;
  severity: "error" | "warning";
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    solc: any;
  }
}

async function loadSolc(): Promise<unknown> {
  if (typeof window === "undefined")
    throw new Error("Can only compile in browser");

  if (window.solc) return window.solc;

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/solc/0.8.20/solc.min.js";
    script.onload = () => {
      if (window.solc) resolve(window.solc);
      else reject(new Error("solc failed to load"));
    };
    script.onerror = () => reject(new Error("Failed to load solc from CDN"));
    document.head.appendChild(script);
  });
}

export async function compileContract(
  sourceCode: string,
  contractName: string
): Promise<{ result: CompileResult | null; errors: CompileError[] }> {
  // Extract pragma version from source
  const pragmaMatch = sourceCode.match(/pragma solidity\s+([^;]+);/);
  const _pragma = pragmaMatch ? pragmaMatch[1] : "^0.8.20";

  try {
    const solc = await loadSolc();

    const input = JSON.stringify({
      language: "Solidity",
      sources: {
        "contract.sol": { content: sourceCode },
      },
      settings: {
        outputSelection: {
          "*": { "*": ["abi", "evm.bytecode"] },
        },
        optimizer: { enabled: true, runs: 200 },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const output = JSON.parse((solc as any).compile(input));

    const errors: CompileError[] = (output.errors || []).map(
      (e: { severity: string; formattedMessage: string }) => ({
        severity: e.severity as "error" | "warning",
        message: e.formattedMessage,
      })
    );

    const hasErrors = errors.some((e) => e.severity === "error");
    if (hasErrors) {
      return { result: null, errors };
    }

    // Find the contract in output
    const contracts = output.contracts?.["contract.sol"];
    if (!contracts) {
      return {
        result: null,
        errors: [
          { severity: "error", message: "No contracts found in output" },
        ],
      };
    }

    // Try exact name match first, then first available
    const targetName =
      Object.keys(contracts).find((n) => n === contractName) ??
      Object.keys(contracts)[0];

    if (!targetName) {
      return {
        result: null,
        errors: [
          {
            severity: "error",
            message: "No contract found in compiled output",
          },
        ],
      };
    }

    const contract = contracts[targetName];
    const bytecode = contract.evm?.bytecode?.object;

    if (!bytecode) {
      return {
        result: null,
        errors: [{ severity: "error", message: "Bytecode not generated" }],
      };
    }

    return {
      result: {
        abi: contract.abi,
        bytecode: "0x" + bytecode,
        contractName: targetName,
      },
      errors: errors.filter((e) => e.severity === "warning"),
    };
  } catch (err) {
    return {
      result: null,
      errors: [
        {
          severity: "error",
          message: err instanceof Error ? err.message : "Compilation failed",
        },
      ],
    };
  }
}
