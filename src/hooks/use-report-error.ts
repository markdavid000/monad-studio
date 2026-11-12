import { useEffect } from "react";

export function useReportError(error: unknown) {
  useEffect(() => {
    console.error(error);
  }, [error]);
}
