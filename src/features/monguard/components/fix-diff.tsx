import { CodeView, type CodeLine } from "@/components/ui/code-view";
import { diffLineKey, diffLines } from "@/lib/diff";
import { monguardCopy } from "../copy";

interface FixDiffProps {
  fileName: string;
  source: string;
  fixedSource: string;
}

export function FixDiff({ fileName, source, fixedSource }: FixDiffProps) {
  const lines: CodeLine[] = diffLines(source, fixedSource).map((line) => ({
    key: diffLineKey(line),
    number: line.newNumber ?? line.oldNumber,
    text: line.text,
    kind: line.kind === "same" ? undefined : line.kind,
  }));
  const firstChange = lines.find((line) => line.kind)?.key;

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="border-b px-4 py-2.5">
        <span className="truncate font-mono text-sm">{fileName || monguardCopy.untitled}</span>
      </div>
      <CodeView label={monguardCopy.fixes.diffLabel} lines={lines} scrollTo={firstChange} />
    </section>
  );
}
