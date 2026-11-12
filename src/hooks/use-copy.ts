import { useEffect, useState } from "react";

const RESET_MS = 2000;

export function useCopy() {
  const [copiedAt, setCopiedAt] = useState<number | null>(null);

  useEffect(() => {
    if (copiedAt === null) return;
    const timer = window.setTimeout(() => setCopiedAt(null), RESET_MS);
    return () => window.clearTimeout(timer);
  }, [copiedAt]);

  return {
    isCopied: copiedAt !== null,
    copy: (text: string) => {
      navigator.clipboard.writeText(text).then(
        () => setCopiedAt(Date.now()),
        (error: unknown) => console.error(error)
      );
    },
  };
}
