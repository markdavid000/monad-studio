export const siteCopy = {
  name: "MonadStudio",
  description:
    "Scan, optimise, deploy and watch Solidity contracts on Monad testnet, from one browser tab.",
} as const;

export const toolCopy = {
  monguard: {
    name: "MonGuard",
    summary: "Security review",
    output:
      "A list of likely vulnerabilities with severity, the lines involved and a suggested fix.",
  },
  gaslens: {
    name: "GasLens",
    summary: "Gas review",
    output: "Gas findings with estimated savings and a rewritten contract shown as a diff.",
  },
  forge: {
    name: "MonadForge",
    summary: "Generate and deploy",
    output: "A contract written from your description, compiled and deployed from your wallet.",
  },
  sentinel: {
    name: "SentinelMon",
    summary: "Contract activity",
    output:
      "Recent calls to a deployed contract, refreshed every few seconds, with flagged patterns.",
  },
  paradebug: {
    name: "ParaDebug",
    summary: "Block contention",
    output: "Functions of a contract called more than once in the same block, block by block.",
  },
} as const;
