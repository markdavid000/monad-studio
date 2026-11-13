import { explorerUrl } from "@/config/site";

export function addressUrl(address: string) {
  return `${explorerUrl}/address/${address}`;
}

export function transactionUrl(hash: string) {
  return `${explorerUrl}/tx/${hash}`;
}

export function shortHex(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
