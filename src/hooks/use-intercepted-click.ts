import { useEffect, useState } from "react";

export function useInterceptedClick(selector: string) {
  const [isTriggered, setTriggered] = useState(false);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      if (!(event.target instanceof Element) || !event.target.closest(selector)) return;
      event.preventDefault();
      event.stopPropagation();
      setTriggered(true);
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [selector]);

  return { isTriggered, reset: () => setTriggered(false) };
}
