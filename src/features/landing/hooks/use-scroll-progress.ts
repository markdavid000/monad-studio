import { useEffect, useRef, useState } from "react";

export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    function measure() {
      frame = 0;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const value = travel > 0 ? -rect.top / travel : rect.top < 0 ? 1 : 0;
      setProgress(Math.min(1, Math.max(0, value)));
    }
    function schedule() {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  return { ref, progress };
}
