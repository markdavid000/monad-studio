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
  syncNoWalletBody: "Reconnect your wallet with the button at the top right to sync your activity.",
  syncOffBody:
    "Store your activity under this wallet so it shows up wherever you connect it. Your contracts and results are then kept on the MonadStudio server, and removed 180 days after your last sync or when you clear them here.",
  syncButton: "Sync with this wallet",
  syncOtherWallet: "The connected wallet is not the one you synced with.",
  stopSync: "Stop syncing",
  stopSyncNote: "Stopping keeps the synced copy. Clear activity first if you want it gone.",
  syncPendingTitle: "Syncing your activity",
  syncDoneTitle: "Activity synced",
  syncFailedTitle: "Sync failed",
  syncStopped: "Sync stopped on this browser",
  filteredTitle: "Nothing from this tool yet",
  filteredBody: "Runs from the other tools are under All.",
  intro: {
    title: "Your activity",
    body: "Every MonGuard scan and GasLens review you run is listed here, newest first.",
    points: [
      {
        title: "Open a past run",
        body: "Open puts the contract back in the workspace and shows its results again, without using an AI request.",
      },
      {
        title: "Sync with your wallet",
        body: "Turn on sync to keep your activity on any device where you connect the same wallet.",
      },
      {
        title: "Delete what you do not need",
        body: "Remove one run or clear everything. Synced copies are removed too.",
      },
    ],
    done: "Got it",
  },
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
