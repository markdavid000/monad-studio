export const activityCopy = {
  title: "Activity",
  about: "About activity",
  aboutBody:
    "Every MonGuard scan and GasLens review you run is saved in this browser. Open one to see its results again without using an AI request.",
  aboutStorage:
    "Nothing is sent to a server. Clearing this browser's site data removes your activity, and it does not follow you to another browser.",
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
  clearFailed: "Could not clear your activity",
  tryAgain: "Try again in a moment.",
  clear: "Clear activity",
  clearTitle: "Clear all activity?",
  clearBody: "This removes every saved run from this browser. It cannot be undone.",
  cancel: "Cancel",
  confirmClear: "Clear everything",
  cleared: "Activity cleared",
} as const;

export function runCount(count: number) {
  return count === 1 ? "1 run" : `${count} runs`;
}
