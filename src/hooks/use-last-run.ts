import { useSyncExternalStore } from "react";

const PREFIX = "monad-studio:last-run:";
const CHANGE_EVENT = "monad-studio:last-run-change";

function read(slot: string) {
  try {
    return window.sessionStorage.getItem(PREFIX + slot) ?? "";
  } catch (error) {
    console.error(error);
    return "";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

export function rememberLastRun(slot: string, id: string) {
  try {
    window.sessionStorage.setItem(PREFIX + slot, id);
  } catch (error) {
    console.error(error);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useLastRunId(slot: string) {
  const id = useSyncExternalStore(
    subscribe,
    () => read(slot),
    () => ""
  );
  return id || undefined;
}
