import { useSyncExternalStore } from "react";
import { getAddress, isAddress, type Address } from "viem";
import { useAccount } from "wagmi";

const STORAGE_KEY = "monad-studio:synced-wallets";
const CHANGE_EVENT = "monad-studio:synced-wallets-change";

function read() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch (error) {
    console.error(error);
    return "[]";
  }
}

function parse(raw: string): Address[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value
      .filter((item): item is string => typeof item === "string" && isAddress(item))
      .map((item) => getAddress(item));
  } catch (error) {
    console.error(error);
    return [];
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

function write(addresses: readonly Address[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  } catch (error) {
    console.error(error);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function addSyncedAddress(address: Address) {
  const current = parse(read());
  const normalized = getAddress(address);
  if (!current.includes(normalized)) write([...current, normalized]);
}

export function removeSyncedAddress(address: Address) {
  const normalized = getAddress(address);
  write(parse(read()).filter((item) => item !== normalized));
}

export function useSyncedAddress(): Address | null {
  const { address } = useAccount();
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  if (!address) return null;
  const normalized = getAddress(address);
  return parse(raw).includes(normalized) ? normalized : null;
}
