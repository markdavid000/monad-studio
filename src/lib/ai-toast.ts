import { ApiError } from "./api-error";
import { aiCopy, retryIn } from "./copy";
import { toast } from "./toast";

interface AiErrorToast {
  id: string;
  title: string;
  onRetry: () => void;
}

export function showAiErrorToast(error: Error, { id, title, onRetry }: AiErrorToast) {
  const code = error instanceof ApiError ? error.code : "internal";
  const retryAfter = error instanceof ApiError ? error.retryAfterSeconds : undefined;
  const isLimited = code === "rate_limited";
  toast.error(title, {
    id,
    description:
      isLimited && retryAfter
        ? `${aiCopy.errors[code]} ${retryIn(retryAfter)}`
        : aiCopy.errors[code],
    action: isLimited ? undefined : { label: aiCopy.retry, onClick: onRetry },
  });
}
