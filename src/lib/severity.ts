export const SEVERITIES = ["critical", "high", "medium", "low", "info"] as const;

export type Severity = (typeof SEVERITIES)[number];

const PENALTY: Record<Severity, number> = { critical: 25, high: 15, medium: 8, low: 3, info: 1 };

export function securityScore(severities: readonly Severity[]) {
  const penalty = severities.reduce((total, severity) => total + PENALTY[severity], 0);
  return Math.max(0, 100 - penalty);
}

export function compareSeverity(a: Severity, b: Severity) {
  return SEVERITIES.indexOf(a) - SEVERITIES.indexOf(b);
}
