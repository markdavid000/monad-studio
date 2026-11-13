import { diffLineKey, diffLines } from "@/lib/diff";
import { CodeView, type CodeLine } from "./code-view";

interface DiffCodeProps {
  label: string;
  before: string;
  after: string;
}

export function DiffCode({ label, before, after }: DiffCodeProps) {
  const lines: CodeLine[] = diffLines(before, after).map((line) => ({
    key: diffLineKey(line),
    number: line.newNumber ?? line.oldNumber,
    text: line.text,
    kind: line.kind === "same" ? undefined : line.kind,
  }));

  return <CodeView label={label} lines={lines} scrollTo={lines.find((line) => line.kind)?.key} />;
}
