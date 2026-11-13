import { formatKilobytes } from "@/lib/byte-size";
import { compilerLabel, errorsTitle, forgeCopy, sizeLabel } from "../copy";
import { constructorOf, functionsOf, signature } from "../lib/abi";
import type { CompiledContract, CompileResult } from "../types";
import { CopyButton } from "./copy-button";
import { DiagnosticList } from "./diagnostic-list";

interface CompileOutputProps {
  result: CompileResult;
  isStale: boolean;
  onFocusLine: (line: number) => void;
}

const copy = forgeCopy.compile;

function ContractCard({ contract }: { contract: CompiledContract }) {
  const constructor = constructorOf(contract.abi);
  const functions = functionsOf(contract.abi);

  return (
    <article className="flex flex-col gap-4 rounded-xl border bg-card px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h4 className="font-mono text-sm">{contract.name}</h4>
          <span className="text-xs text-muted-foreground">
            {sizeLabel(formatKilobytes(contract.deployedSize))}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <CopyButton
            text={JSON.stringify(contract.abi, null, 2)}
            label={copy.copyAbi}
            copiedLabel={copy.copied}
          />
          <CopyButton
            text={contract.bytecode}
            label={copy.copyBytecode}
            copiedLabel={copy.copied}
          />
        </div>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
        <dt className="text-muted-foreground">{copy.constructor}</dt>
        <dd className="min-w-0 font-mono text-xs break-all">
          {constructor && (constructor.inputs ?? []).length > 0
            ? signature({ ...constructor, name: "constructor" })
            : copy.noConstructor}
        </dd>
        <dt className="text-muted-foreground">{copy.functions}</dt>
        <dd className="min-w-0">
          {functions.length > 0 ? (
            <ul className="flex flex-col gap-1 font-mono text-xs">
              {functions.map((item) => (
                <li key={signature(item)} className="flex flex-wrap gap-2 break-all">
                  <span>{signature(item)}</span>
                  {item.stateMutability ? (
                    <span className="text-muted-foreground">{item.stateMutability}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-xs">{copy.noFunctions}</span>
          )}
        </dd>
      </dl>
    </article>
  );
}

export function CompileOutput({ result, isStale, onFocusLine }: CompileOutputProps) {
  return (
    <div className="flex flex-col gap-5" aria-live="polite">
      {isStale ? (
        <p
          role="status"
          className="rounded-lg border border-severity-medium/40 bg-severity-medium/10 px-3 py-2 text-sm"
        >
          {copy.stale}
        </p>
      ) : null}
      <p className="font-mono text-xs text-muted-foreground">
        {compilerLabel(result.compilerVersion)}
      </p>
      {result.status === "failed" ? (
        <DiagnosticList
          label={`${copy.errorsLabel} · ${errorsTitle(result.errors.length)}`}
          items={result.errors}
          onFocusLine={onFocusLine}
        />
      ) : result.contracts.length === 0 ? (
        <p className="text-sm">{copy.nothingToDeploy}</p>
      ) : (
        <div className="flex flex-col gap-2">
          <h3 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            {copy.contractsLabel}
          </h3>
          <div className="flex flex-col gap-3">
            {result.contracts.map((contract) => (
              <ContractCard key={contract.name} contract={contract} />
            ))}
          </div>
        </div>
      )}
      {result.warnings.length > 0 ? (
        <DiagnosticList
          label={copy.warningsLabel}
          items={result.warnings}
          onFocusLine={onFocusLine}
        />
      ) : null}
    </div>
  );
}
