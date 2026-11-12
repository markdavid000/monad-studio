import { useSyncExternalStore } from "react";

const STORAGE_KEY = "monad-studio:draft";
const CHANGE_EVENT = "monad-studio:draft-change";

interface Draft {
  name: string;
  source: string;
}

const EMPTY: Draft = { name: "", source: "" };

let hasReportedStorageError = false;

function read() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch (error) {
    if (!hasReportedStorageError) {
      hasReportedStorageError = true;
      console.error(error);
    }
    return "";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function parse(raw: string): Draft {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      "name" in value &&
      "source" in value &&
      typeof value.name === "string" &&
      typeof value.source === "string"
    ) {
      return { name: value.name, source: value.source };
    }
  } catch (error) {
    console.error(error);
    return EMPTY;
  }
  return EMPTY;
}

export function useContractDraft() {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  const draft = parse(raw);

  function save(next: Draft) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error(error);
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return {
    name: draft.name,
    source: draft.source,
    setSource: (source: string) => save({ name: draft.name, source }),
    load: (name: string, source: string) => save({ name, source }),
    clear: () => save(EMPTY),
  };
}
