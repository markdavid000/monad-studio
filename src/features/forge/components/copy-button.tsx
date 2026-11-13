import { Check, Copy } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";

interface CopyButtonProps {
  text: string;
  label: string;
  copiedLabel: string;
}

export function CopyButton({ text, label, copiedLabel }: CopyButtonProps) {
  const { isCopied, copy } = useCopy();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      {isCopied ? (
        <Check aria-hidden className="size-3.5" />
      ) : (
        <Copy aria-hidden className="size-3.5" />
      )}
      {isCopied ? copiedLabel : label}
    </button>
  );
}
