import { useEffect, useRef, useState, type PointerEvent } from "react";

export function useHoverPopover(closeDelayMs = 150) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const hoverProps = {
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      window.clearTimeout(timer.current);
      setOpen(true);
    },
    onPointerLeave: (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setOpen(false), closeDelayMs);
    },
  };

  return { open, onOpenChange: setOpen, hoverProps };
}
