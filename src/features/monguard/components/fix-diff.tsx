import { DiffCode } from "@/components/ui/diff-code";
import { monguardCopy } from "../copy";

interface FixDiffProps {
  fileName: string;
  source: string;
  fixedSource: string;
}

export function FixDiff({ fileName, source, fixedSource }: FixDiffProps) {
  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="border-b px-4 py-2.5">
        <span className="truncate font-mono text-sm">{fileName || monguardCopy.untitled}</span>
      </div>
      <DiffCode label={monguardCopy.fixes.diffLabel} before={source} after={fixedSource} />
    </section>
  );
}
