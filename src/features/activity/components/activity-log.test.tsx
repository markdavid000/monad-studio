import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Toaster } from "@/components/ui/toaster";
import { aiCopy } from "@/lib/copy";
import { clearRuns, listRuns, saveRun } from "@/lib/history";
import { toast } from "@/lib/toast";
import { activityCopy } from "../copy";
import { ActivityLog } from "./activity-log";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

function renderLog() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <ActivityLog />
      <Toaster closeLabel={aiCopy.closeNotification} regionLabel={aiCopy.notifications} />
    </QueryClientProvider>
  );
}

async function seed() {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-12T09:00:00Z"));
  const scan = await saveRun({
    tool: "monguard",
    fileName: "Bank.sol",
    contractName: "Bank",
    summary: "Score 47, 5 findings",
    source: "contract Bank {}",
    report: {},
  });
  vi.setSystemTime(new Date("2026-11-12T10:00:00Z"));
  const review = await saveRun({
    tool: "gaslens",
    fileName: "GasHeavy.sol",
    contractName: "GasHeavy",
    summary: "13 findings, 1 flagged",
    source: "contract GasHeavy {}",
    report: {},
  });
  vi.useRealTimers();
  return { scan, review };
}

function rows() {
  return screen.getAllByRole("listitem").map((row) => row.textContent);
}

beforeEach(async () => {
  for (const item of toast.items()) toast.dismiss(item.id);
  window.localStorage.clear();
  push.mockReset();
  await clearRuns();
});

describe("ActivityLog", () => {
  it("says there is no activity yet and links to the workspace", async () => {
    renderLog();
    expect(await screen.findByText(activityCopy.emptyTitle)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: activityCopy.openWorkspace })).toHaveAttribute(
      "href",
      "/studio"
    );
  });

  it("explains where activity is kept", async () => {
    renderLog();
    fireEvent.click(screen.getByRole("button", { name: activityCopy.about }));
    expect(await screen.findByText(activityCopy.aboutStorage)).toBeInTheDocument();
  });

  it("lists runs newest first with their tool and summary, and filters by tool", async () => {
    await seed();
    renderLog();
    expect(await screen.findByText("GasHeavy")).toBeInTheDocument();
    expect(rows()[0]).toContain("13 findings, 1 flagged");
    expect(rows()[1]).toContain("Score 47, 5 findings");

    fireEvent.click(screen.getByRole("button", { name: /^MonGuard/ }));
    expect(screen.queryByText("GasHeavy")).toBeNull();
    expect(screen.getByText("Bank")).toBeInTheDocument();
  });

  it("opens a run: loads its contract into the workspace and goes to the tool", async () => {
    const { scan } = await seed();
    renderLog();
    const row = (await screen.findByText("Bank")).closest("li");
    fireEvent.click(within(row as HTMLElement).getByRole("button", { name: activityCopy.open }));
    expect(JSON.parse(window.localStorage.getItem("monad-studio:draft") ?? "{}")).toEqual({
      name: "Bank.sol",
      source: "contract Bank {}",
    });
    expect(push).toHaveBeenCalledWith(`/studio/monguard?run=${scan.id}`);
  });

  it("deletes one run", async () => {
    await seed();
    renderLog();
    const row = (await screen.findByText("Bank")).closest("li");
    fireEvent.click(
      within(row as HTMLElement).getByRole("button", { name: activityCopy.deleteRun })
    );
    await vi.waitFor(() => expect(screen.queryByText("Bank")).toBeNull());
    expect((await listRuns()).map((run) => run.contractName)).toEqual(["GasHeavy"]);
  });

  it("clears everything after confirming", async () => {
    await seed();
    renderLog();
    fireEvent.click(await screen.findByRole("button", { name: activityCopy.clear }));
    const dialog = await screen.findByRole("dialog", { name: activityCopy.clearTitle });
    fireEvent.click(within(dialog).getByRole("button", { name: activityCopy.confirmClear }));
    expect(await screen.findByText(activityCopy.emptyTitle)).toBeInTheDocument();
    expect(await listRuns()).toEqual([]);
  });
});
