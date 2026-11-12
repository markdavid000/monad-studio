export const studioCopy = {
  title: "Workspace",
  lead: "Paste a contract or start from an example. It stays in this browser and follows you into every tool.",
  examplesLabel: "Start from an example",
  untitled: "Untitled.sol",
  editorLabel: "Solidity source",
  placeholder: "// Paste your Solidity contract here",
  sizeOf: "of 60 KB",
  tooLarge: "Over the 60 KB limit. Trim the contract before scanning.",
  clear: "Clear",
  line: "line",
  lines: "lines",
  saved: "Saved in this browser",
  empty: "Nothing saved yet",
  actionsLabel: "Next step",
  comingNext: "Coming next",
  actionNote:
    "Each action opens the matching tool with this contract. MonadForge arrives in a later update.",
  actions: {
    scan: { label: "Scan for bugs", tool: "MonGuard" },
    optimise: { label: "Optimise gas", tool: "GasLens" },
    deploy: { label: "Deploy", tool: "MonadForge" },
  },
  network: {
    title: "Network",
    name: "Monad testnet",
    chain: "Chain ID",
    chainId: "10143",
    block: "Latest block",
    loading: "Reading the chain",
    error: "Cannot reach the RPC right now",
    live: "Live",
  },
  wallet: {
    title: "Wallet",
    connected: "Connected",
    disconnected: "Not connected",
    note: "Only needed when you deploy. Use the button at the top right.",
  },
} as const;

export function actionStatus(tool: string) {
  return `${tool} · ${studioCopy.comingNext}`;
}
