import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  Critical: "text-severity-critical border-severity-critical/40 bg-severity-critical/10",
  High: "text-severity-high border-severity-high/40 bg-severity-high/10",
  Medium: "text-severity-medium border-severity-medium/40 bg-severity-medium/10",
  Low: "text-severity-low border-severity-low/40 bg-severity-low/10",
};

interface SeverityPillProps {
  level: string;
}

export function SeverityPill({ level }: SeverityPillProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 font-mono text-[11px]",
        TONES[level]
      )}
    >
      {level}
    </span>
  );
}
