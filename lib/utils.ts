import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function getToolColor(tool: string): string {
  const colors: Record<string, string> = {
    monguard: "text-danger",
    gaslens: "text-warning",
    monadforge: "text-monad-400",
    sentinelmon: "text-cyan-400",
    paradebug: "text-success",
  };
  return colors[tool] ?? "text-ink-muted";
}

export function getToolBgColor(tool: string): string {
  const colors: Record<string, string> = {
    monguard: "bg-danger/10 border-danger/20",
    gaslens: "bg-warning/10 border-warning/20",
    monadforge: "bg-monad-400/10 border-monad-400/20",
    sentinelmon: "bg-cyan-400/10 border-cyan-400/20",
    paradebug: "bg-success/10 border-success/20",
  };
  return colors[tool] ?? "bg-surface-3 border-border";
}
