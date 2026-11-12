export const activityCopy = {
  title: "Activity",
  about: "About activity",
  aboutBody:
    "Every MonGuard scan and GasLens review you run is saved in this browser. Open one to see its results again without using an AI request.",
  aboutStorage:
    "Runs stay in this browser unless you sync them with your wallet. Clearing this browser's site data removes the copy here.",
  filterLabel: "Filter by tool",
  all: "All",
  open: "Open",
  delete: "Delete",
  deleteRun: "Delete this run",
  emptyTitle: "No activity yet",
  emptyBody: "Run a MonGuard scan or a GasLens review and it will show up here.",
  emptyFiltered: "No runs from this tool yet.",
  openWorkspace: "Open the workspace",
  unavailable:
    "Activity is not available in this browser. It may be blocking site storage, for example in a private window.",
  deleteFailed: "Could not delete that run",
  openFailed: "Could not open that run",
  syncedOnly: "From your synced history",
  clearFailed: "Could not clear your activity",
  tryAgain: "Try again in a moment.",
  clear: "Clear activity",
  clearTitle: "Clear all activity?",
  clearBody: "This removes every saved run from this browser. It cannot be undone.",
  clearSyncedBody:
    "This removes every saved run from this browser and from your synced history. It cannot be undone.",
  cancel: "Cancel",
  confirmClear: "Clear everything",
  cleared: "Activity cleared",
  syncLabel: "Wallet sync",
  syncOffTitle: "Keep your activity on any device",
  syncNoWalletBody:
    "Connect a wallet with the button at the top right, then sync your activity to it. Signing is free and sends no transaction.",
  syncOffBody:
    "Sign one message to store your activity under this wallet. Your contracts and results are then kept on the MonadStudio server, and removed 180 days after your last sync or when you clear them here.",
  syncButton: "Sync with this wallet",
  syncConfirm: "Confirm in your wallet",
  syncOnBody:
    "New runs are saved in this browser and in your synced history. Open this page with the same wallet on another device to see them there.",
  syncOtherWallet: "The connected wallet is not the one you synced with.",
  stopSync: "Stop syncing",
  stopSyncNote: "Stopping keeps the synced copy. Clear activity first if you want it gone.",
  syncPendingTitle: "Syncing your activity",
  syncPendingBody: "Sign the message in your wallet. It is free and sends no transaction.",
  syncDoneTitle: "Activity synced",
  syncCancelled: "Sync cancelled",
  syncFailedTitle: "Sync failed",
  syncStopped: "Sync stopped on this browser",
} as const;

export function runCount(count: number) {
  return count === 1 ? "1 run" : `${count} runs`;
}

export function syncedWith(address: string) {
  return `Synced with ${shortAddress(address)}`;
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function syncDoneBody(uploaded: number) {
  return uploaded === 0
    ? "Runs from your other devices now show here."
    : `${runCount(uploaded)} from this browser uploaded.`;
}
