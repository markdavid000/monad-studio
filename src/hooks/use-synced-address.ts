import { useSyncExternalStore } from "react";
import { getAddress, isAddress, type Address } from "viem";

const STORAGE_KEY = "monad-studio:synced-wallet";
const CHANGE_EVENT = "monad-studio:synced-wallet-change";

function read() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch (error) {
    console.error(error);
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

export function setSyncedAddress(address: Address | null) {
  try {
    if (address) window.localStorage.setItem(STORAGE_KEY, address);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error(error);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useSyncedAddress(): Address | null {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  return isAddress(raw) ? getAddress(raw) : null;
}
