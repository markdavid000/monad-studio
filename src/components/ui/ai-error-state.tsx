import { RotateCcw } from "lucide-react";
import { ApiError } from "@/lib/api-error";
import { aiCopy, retryIn } from "@/lib/copy";
import { Button } from "./button";

interface AiErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export function AiErrorState({ error, onRetry }: AiErrorStateProps) {
  const code = error instanceof ApiError ? error.code : "internal";
  const retryAfter = error instanceof ApiError ? error.retryAfterSeconds : undefined;

  return (
    <div className="flex flex-1 flex-col items-start justify-center gap-4">
      <div role="alert" className="flex flex-col gap-1">
        <p className="font-medium">{aiCopy.errors[code]}</p>
        {code === "rate_limited" && retryAfter ? (
          <p className="text-sm text-muted-foreground">{retryIn(retryAfter)}</p>
        ) : null}
      </div>
      {code === "rate_limited" ? null : (
        <Button variant="outline" onClick={onRetry}>
          <RotateCcw aria-hidden />
          {aiCopy.retry}
        </Button>
      )}
    </div>
  );
}
