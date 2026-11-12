import { useEffect, useState } from "react";

export function useCycle(count: number, intervalMs: number) {
  const [state, setState] = useState({ index: 0, ticks: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setState((previous) => ({ index: (previous.index + 1) % count, ticks: previous.ticks + 1 }));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [count, intervalMs]);

  return { index: state.index, hasCycled: state.ticks > 0 };
}
