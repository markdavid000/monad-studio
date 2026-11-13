import "server-only";
import solc from "solc";
import { z } from "zod";
import { abiItemSchema } from "../lib/schema";
import type { CompileResult, Diagnostic } from "../types";

const EVM_VERSION = "prague";
const OPTIMIZER_RUNS = 200;

const solcErrorSchema = z.object({
  severity: z.string(),
  type: z.string(),
  message: z.string(),
  sourceLocation: z.object({ file: z.string(), start: z.number() }).optional(),
});

const solcContractSchema = z.object({
  abi: z.array(abiItemSchema),
  evm: z.object({
    bytecode: z.object({ object: z.string() }),
    deployedBytecode: z.object({ object: z.string() }),
  }),
});

const solcOutputSchema = z.object({
  errors: z.array(solcErrorSchema).optional(),
  contracts: z.record(z.string(), z.record(z.string(), solcContractSchema)).optional(),
});

type SolcError = z.infer<typeof solcErrorSchema>;

function compilerVersion() {
  const full = String(solc.version());
  return /\d+\.\d+\.\d+\+commit\.[0-9a-f]+/.exec(full)?.[0] ?? full;
}

function standardJsonInput(fileName: string, source: string) {
  return JSON.stringify({
    language: "Solidity",
    sources: { [fileName]: { content: source } },
    settings: {
      optimizer: { enabled: true, runs: OPTIMIZER_RUNS },
      evmVersion: EVM_VERSION,
      outputSelection: {
        "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] },
      },
    },
  });
}

function lineAt(sourceBytes: Uint8Array, offset: number) {
  let line = 1;
  for (let index = 0; index < Math.min(offset, sourceBytes.length); index += 1) {
    if (sourceBytes[index] === 10) line += 1;
  }
  return line;
}

function toDiagnostic(error: SolcError, fileName: string, sourceBytes: Uint8Array): Diagnostic {
  const location = error.sourceLocation;
  return {
    severity: error.severity === "error" ? "error" : "warning",
    kind: error.type,
    message: error.message,
    line:
      location && location.file === fileName && location.start >= 0
        ? lineAt(sourceBytes, location.start)
        : undefined,
  };
}

export function compileSolidity({
  fileName,
  source,
}: {
  fileName: string;
  source: string;
}): CompileResult {
  const input = standardJsonInput(fileName, source);
  const output = solcOutputSchema.parse(JSON.parse(String(solc.compile(input))));
  const sourceBytes = new TextEncoder().encode(source);
  const diagnostics = (output.errors ?? [])
    .filter((error) => error.severity === "error" || error.severity === "warning")
    .map((error) => toDiagnostic(error, fileName, sourceBytes));
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");
  const warnings = diagnostics.filter((diagnostic) => diagnostic.severity === "warning");
  const version = compilerVersion();

  if (errors.length > 0) {
    return { status: "failed", compilerVersion: version, errors, warnings };
  }

  const contracts = Object.entries(output.contracts?.[fileName] ?? {})
    .filter(([, contract]) => contract.evm.bytecode.object.length > 0)
    .map(([name, contract]) => ({
      name,
      abi: contract.abi,
      bytecode: `0x${contract.evm.bytecode.object}`,
      deployedSize: contract.evm.deployedBytecode.object.length / 2,
    }));

  return {
    status: "compiled",
    compilerVersion: version,
    standardJsonInput: input,
    contracts,
    warnings,
  };
}
