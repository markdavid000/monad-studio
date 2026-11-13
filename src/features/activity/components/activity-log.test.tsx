import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toaster } from "@/components/ui/toaster";
import { aiCopy, historyCopy } from "@/lib/copy";
import { clearRuns, listRuns, saveRun } from "@/lib/history";
import { toast } from "@/lib/toast";
import { activityCopy } from "../copy";
import { ActivityLog } from "./activity-log";

const push = vi.fn();
const wallet = vi.hoisted(() => ({
  address: undefined as `0x${string}` | undefined,
  signMessageAsync: vi.fn(async () => "0xsigned"),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("wagmi", () => ({
  useAccount: () => ({ address: wallet.address }),
  useSignMessage: () => ({ signMessageAsync: wallet.signMessageAsync }),
}));

const ALICE = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as const;
const BOB = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" as const;
const fetchMock = vi.fn<typeof fetch>();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function calls() {
  return fetchMock.mock.calls.map(([url, init]) => `${init?.method ?? "GET"} ${String(url)}`);
}

const remoteRun = {
  id: "00000000-0000-4000-8000-000000000099",
  tool: "gaslens" as const,
  createdAt: Date.parse("2026-11-12T11:00:00Z"),
  fileName: "Other.sol",
  contractName: "OtherDevice",
  summary: "4 findings",
};

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
  window.localStorage.setItem("monad-studio:seen:activity", "seen");
  push.mockReset();
  wallet.address = undefined;
  wallet.signMessageAsync.mockReset();
  wallet.signMessageAsync.mockResolvedValue("0xsigned");
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  await clearRuns();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ActivityLog", () => {
  it("explains the screen once on the first visit", async () => {
    window.localStorage.removeItem("monad-studio:seen:activity");
    const view = renderLog();
    const intro = await screen.findByRole("dialog", { name: activityCopy.intro.title });
    expect(intro).toHaveTextContent(activityCopy.intro.points[0].title);
    fireEvent.click(screen.getByRole("button", { name: activityCopy.intro.done }));
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    view.unmount();
    renderLog();
    expect(screen.queryByRole("dialog", { name: activityCopy.intro.title })).toBeNull();
  });

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
    await vi.waitFor(() => expect(push).toHaveBeenCalled());
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

  describe("wallet sync", () => {
    it("asks for a wallet before offering to sync", async () => {
      renderLog();
      expect(await screen.findByText(activityCopy.syncNoWalletBody)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: activityCopy.syncButton })).toBeNull();
    });

    it("turns on sync and uploads the runs from this browser without another signature", async () => {
      await seed();
      wallet.address = ALICE;
      fetchMock.mockImplementation(async (url, init) => {
        const key = `${init?.method ?? "GET"} ${String(url)}`;
        if (key === "POST /api/history") return json({ data: { saved: 2 } });
        if (key === "GET /api/history") return json({ data: { runs: [] } });
        return json({ error: { code: "not_found", message: key } }, 404);
      });
      renderLog();
      fireEvent.click(await screen.findByRole("button", { name: activityCopy.syncButton }));

      expect((await screen.findAllByText(activityCopy.syncDoneTitle))[0]).toBeInTheDocument();
      expect(screen.getByText("Synced with 0x7099...79C8")).toBeInTheDocument();
      expect(wallet.signMessageAsync).not.toHaveBeenCalled();
      expect(calls()).not.toContain("GET /api/auth/nonce");
      const uploaded = fetchMock.mock.calls.find(
        ([url, init]) => url === "/api/history" && init?.method === "POST"
      );
      expect(JSON.parse(String(uploaded?.[1]?.body)).runs).toHaveLength(2);
      expect(window.localStorage.getItem("monad-studio:synced-wallets")).toBe(
        JSON.stringify([ALICE])
      );
    });

    it("shows runs from other devices and opens them by downloading the full run", async () => {
      await seed();
      wallet.address = ALICE;
      window.localStorage.setItem("monad-studio:synced-wallets", JSON.stringify([ALICE]));
      fetchMock.mockImplementation(async (url) => {
        if (url === "/api/history") return json({ data: { runs: [remoteRun] } });
        return json({
          data: { run: { ...remoteRun, source: "contract OtherDevice {}", report: { ok: true } } },
        });
      });
      renderLog();
      const row = (await screen.findByText("OtherDevice")).closest("li") as HTMLElement;
      expect(within(row).getByText(activityCopy.syncedOnly)).toBeInTheDocument();
      expect(rows()[0]).toContain("OtherDevice");

      fireEvent.click(within(row).getByRole("button", { name: activityCopy.open }));
      await vi.waitFor(() =>
        expect(push).toHaveBeenCalledWith(`/studio/gaslens?run=${remoteRun.id}`)
      );
      expect(calls()).toContain(`GET /api/history/${remoteRun.id}`);
      expect((await listRuns()).map((run) => run.id)).toContain(remoteRun.id);
      expect(JSON.parse(window.localStorage.getItem("monad-studio:draft") ?? "{}").source).toBe(
        "contract OtherDevice {}"
      );
    });

    it("deletes a run from the synced history too", async () => {
      const { scan } = await seed();
      wallet.address = ALICE;
      window.localStorage.setItem("monad-studio:synced-wallets", JSON.stringify([ALICE]));
      fetchMock.mockImplementation(async (url) =>
        url === "/api/history" ? json({ data: { runs: [] } }) : json({ data: { deleted: true } })
      );
      renderLog();
      const row = (await screen.findByText("Bank")).closest("li") as HTMLElement;
      fireEvent.click(within(row).getByRole("button", { name: activityCopy.deleteRun }));
      await vi.waitFor(() => expect(calls()).toContain(`DELETE /api/history/${scan.id}`));
    });

    it("keeps the sync choice when the session has ended", async () => {
      wallet.address = ALICE;
      window.localStorage.setItem("monad-studio:synced-wallets", JSON.stringify([ALICE]));
      fetchMock.mockResolvedValue(
        json({ error: { code: "unauthorized", message: "Sign in first." } }, 401)
      );
      renderLog();
      expect((await screen.findAllByText(historyCopy.syncEndedTitle))[0]).toBeInTheDocument();
      expect(window.localStorage.getItem("monad-studio:synced-wallets")).toBe(
        JSON.stringify([ALICE])
      );
    });

    it("stays synced when the same wallet disconnects and connects again", async () => {
      wallet.address = ALICE;
      window.localStorage.setItem("monad-studio:synced-wallets", JSON.stringify([ALICE]));
      fetchMock.mockImplementation(async () => json({ data: { runs: [] } }));
      const view = renderLog();
      expect(await screen.findByText("Synced with 0x7099...79C8")).toBeInTheDocument();

      wallet.address = undefined;
      view.rerender(
        <QueryClientProvider client={new QueryClient()}>
          <ActivityLog />
        </QueryClientProvider>
      );
      expect(await screen.findByText(activityCopy.syncNoWalletBody)).toBeInTheDocument();

      wallet.address = ALICE;
      view.rerender(
        <QueryClientProvider client={new QueryClient()}>
          <ActivityLog />
        </QueryClientProvider>
      );
      expect(await screen.findByText("Synced with 0x7099...79C8")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: activityCopy.syncButton })).toBeNull();
    });

    it("offers sync to another wallet without using the first wallet's choice", async () => {
      await seed();
      wallet.address = BOB;
      window.localStorage.setItem("monad-studio:synced-wallets", JSON.stringify([ALICE]));
      renderLog();
      expect(
        await screen.findByRole("button", { name: activityCopy.syncButton })
      ).toBeInTheDocument();
      expect(calls()).not.toContain("GET /api/history");
    });

    it("stops syncing on request without signing out", async () => {
      wallet.address = ALICE;
      window.localStorage.setItem("monad-studio:synced-wallets", JSON.stringify([ALICE]));
      fetchMock.mockImplementation(async () => json({ data: { runs: [] } }));
      renderLog();
      fireEvent.click(await screen.findByRole("button", { name: activityCopy.stopSync }));
      await vi.waitFor(() =>
        expect(window.localStorage.getItem("monad-studio:synced-wallets")).toBe("[]")
      );
      expect(calls()).not.toContain("DELETE /api/auth/session");
    });
  });
});
