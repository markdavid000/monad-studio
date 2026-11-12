import { useEffect, useRef, useState } from "react";

function travelOf(node: HTMLElement) {
  return Math.max(1, node.getBoundingClientRect().height - window.innerHeight);
}

export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    function measure() {
      frame = 0;
      const node = ref.current;
      if (!node) return;
      const value = -node.getBoundingClientRect().top / travelOf(node);
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

  function scrollToFraction(fraction: number) {
    const node = ref.current;
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + fraction * travelOf(node), behavior: "smooth" });
  }

  return { ref, progress, scrollToFraction };
}
