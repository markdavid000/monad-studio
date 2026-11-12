export const studioCopy = {
  title: "Workspace",
  about: "About the workspace",
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
  intro: {
    title: "Welcome to the workspace",
    body: "This is where your contract lives. Every tool in the studio reads the contract you put here.",
    points: [
      {
        title: "Paste a contract or pick an example",
        body: "Paste Solidity into the editor or load one of the examples. It is saved in this browser as you type.",
      },
      {
        title: "Run a tool on it",
        body: "The actions under the editor open MonGuard for security and GasLens for gas, already loaded with this contract.",
      },
      {
        title: "Find your runs later",
        body: "Every scan and review is kept on the Activity page, and can follow your wallet to other devices.",
      },
    ],
    done: "Start",
  },
} as const;

export function actionStatus(tool: string) {
  return `${tool} · ${studioCopy.comingNext}`;
}
