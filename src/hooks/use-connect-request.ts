import { useSyncExternalStore } from "react";
import { CONNECT_PARAM, NEXT_PARAM, safeStudioPath } from "@/lib/studio-entry";

const CHANGE_EVENT = "monad-studio:connect-request-change";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readSearch() {
  return window.location.search;
}

export function useConnectRequest() {
  const search = useSyncExternalStore(subscribe, readSearch, () => "");
  const params = new URLSearchParams(search);

  return {
    isRequested: params.get(CONNECT_PARAM) === "1",
    next: safeStudioPath(params.get(NEXT_PARAM)),
    clear: () => {
      const url = new URL(window.location.href);
      url.searchParams.delete(CONNECT_PARAM);
      url.searchParams.delete(NEXT_PARAM);
      window.history.replaceState(window.history.state, "", url);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
  };
}
