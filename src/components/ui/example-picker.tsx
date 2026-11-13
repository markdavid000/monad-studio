import { cn } from "@/lib/utils";

interface ExampleOption {
  id: string;
  name: string;
  summary: string;
}

interface ExamplePickerProps<T extends ExampleOption> {
  label: string;
  examples: readonly T[];
  activeName: string;
  onPick: (example: T) => void;
}

export function ExamplePicker<T extends ExampleOption>({
  label,
  examples,
  activeName,
  onPick,
}: ExamplePickerProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {examples.map((example) => (
          <button
            key={example.id}
            type="button"
            aria-pressed={example.name === activeName}
            onClick={() => onPick(example)}
            className={cn(
              "flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors",
              example.name === activeName
                ? "border-eyebrow/60 bg-eyebrow/10"
                : "hover:border-foreground/25 hover:bg-muted/40"
            )}
          >
            <span className="font-mono text-sm">{example.name}</span>
            <span className="text-xs text-muted-foreground">{example.summary}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
