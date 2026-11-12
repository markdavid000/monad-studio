import { useSyncExternalStore } from "react";

const PREFIX = "monad-studio:seen:";
const CHANGE_EVENT = "monad-studio:seen-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function hasSeen(screen: string) {
  try {
    return window.localStorage.getItem(PREFIX + screen) !== null;
  } catch (error) {
    console.error(error);
    return true;
  }
}

export function useFirstVisit(screen: string) {
  const isFirstVisit = useSyncExternalStore(
    subscribe,
    () => !hasSeen(screen),
    () => false
  );

  return {
    isFirstVisit,
    markSeen: () => {
      try {
        window.localStorage.setItem(PREFIX + screen, new Date().toISOString());
      } catch (error) {
        console.error(error);
      }
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
  };
}
