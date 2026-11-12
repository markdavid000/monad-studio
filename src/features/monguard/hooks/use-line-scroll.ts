import { useEffect, useRef } from "react";

export function useLineScroll(line: number | undefined) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || line === undefined) return;
    const target = container.querySelector<HTMLElement>(`[data-line="${line}"]`);
    if (!target) return;
    const top = target.offsetTop;
    const isVisible =
      top >= container.scrollTop &&
      top + target.offsetHeight <= container.scrollTop + container.clientHeight;
    if (isVisible) return;
    container.scrollTo({
      top: Math.max(0, top - container.clientHeight / 3),
      behavior: "smooth",
    });
  }, [line]);

  return containerRef;
}
