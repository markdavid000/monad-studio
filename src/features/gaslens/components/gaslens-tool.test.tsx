import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toaster } from "@/components/ui/toaster";
import { aiCopy, historyCopy, retryIn } from "@/lib/copy";
import { clearRuns, listRuns, saveRun } from "@/lib/history";
import { toast } from "@/lib/toast";
import { gaslensCopy } from "../copy";
import type { GasReport } from "../types";
import { GaslensTool } from "./gaslens-tool";

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" }),
}));

const SOURCE = [
  "contract Pool {",
  "  address public owner;",
  "  function fee() public view returns (uint256) {",
  "    return 1;",
  "  }",
  "}",
].join("\n");

const OPTIMIZED = SOURCE.replace("address public owner;", "address public immutable owner;");

const report: GasReport = {
  contractName: "Pool",
  summary: "Owner can be immutable.",
  optimizedSource: OPTIMIZED,
  optimizations: [
    {
      id: "GL-01",
      impact: "high",
      title: "Make owner immutable",
      description: "Every read of owner is a cold storage read.",
      estimatedGas: 2100,
      per: "call",
      lines: [2],
    },
    {
      id: "GL-02",
      impact: "low",
      title: "Make fee external",
      description: "fee is never called internally.",
      estimatedGas: 20,
      per: "call",
      lines: [3],
    },
  ],
  check: { status: "clear", risks: [] },
};

const flagged: GasReport = {
  ...report,
  check: {
    status: "flagged",
    risks: [
      {
        id: "CK-01",
        functionName: "owner",
        description: "The getter now returns a value fixed at deployment.",
        lines: [2],
      },
    ],
  },
};

const fetchMock = vi.fn<typeof fetch>();

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
}

function saveDraft(source: string, name = "Pool.sol") {
  window.localStorage.setItem("monad-studio:draft", JSON.stringify({ name, source }));
  window.dispatchEvent(new Event("monad-studio:draft-change"));
}

function readDraft() {
  return JSON.parse(window.localStorage.getItem("monad-studio:draft") ?? "{}");
}

function newClient() {
  return new QueryClient({ defaultOptions: { mutations: { retry: false } } });
}

function renderTool(runId?: string, client = newClient()) {
  return render(
    <QueryClientProvider client={client}>
      <GaslensTool runId={runId} />
      <Toaster closeLabel={aiCopy.closeNotification} regionLabel={aiCopy.notifications} />
    </QueryClientProvider>
  );
}

async function analyse(body: GasReport = report) {
  fetchMock.mockImplementation(async () => json({ data: body }));
  renderTool();
  fireEvent.click(screen.getByRole("button", { name: gaslensCopy.analyse }));
  await results();
}

async function findText(text: string) {
  return (await screen.findAllByText(text))[0];
}

function results() {
  return screen.findByRole("dialog", { name: gaslensCopy.resultsTitle });
}

async function closeResults() {
  fireEvent.click(screen.getByRole("button", { name: aiCopy.closeResults }));
  await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
}

function linesOfKind(kind: "add" | "remove") {
  return Array.from(document.querySelectorAll(`[data-kind="${kind}"]`)).map((node) =>
    node.querySelector("code")?.textContent?.slice(1)
  );
}

beforeEach(async () => {
  await clearRuns();
  for (const item of toast.items()) toast.dismiss(item.id);
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.localStorage.setItem("monad-studio:seen:gaslens", "seen");
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn(async () => undefined) },
    configurable: true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GaslensTool", () => {
  it("keeps the last review and its button after leaving the page and coming back", async () => {
    saveDraft(SOURCE);
    fetchMock.mockImplementation(async () => json({ data: report }));
    const client = newClient();
    const first = renderTool(undefined, client);
    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.analyse }));
    await results();
    await vi.waitFor(async () => expect(await listRuns()).toHaveLength(1));
    first.unmount();

    renderTool(undefined, client);
    fireEvent.click(await screen.findByRole("button", { name: gaslensCopy.showResults }));
    expect(within(await results()).getByText(report.summary)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("explains the screen once on the first visit", async () => {
    window.localStorage.removeItem("monad-studio:seen:gaslens");
    const view = renderTool();
    const intro = await screen.findByRole("dialog", { name: gaslensCopy.intro.title });
    expect(intro).toHaveTextContent(gaslensCopy.intro.points[0].title);
    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.intro.done }));
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    view.unmount();
    renderTool();
    expect(screen.queryByRole("dialog", { name: gaslensCopy.intro.title })).toBeNull();
  });

  it("saves each finished run to the activity", async () => {
    saveDraft(SOURCE);
    fetchMock.mockImplementation(async () => json({ data: report }));
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.analyse }));
    await screen.findByRole("dialog", { name: gaslensCopy.resultsTitle });
    await vi.waitFor(async () => expect(await listRuns()).toHaveLength(1));
    const [saved] = await listRuns();
    expect(saved).toMatchObject({ tool: "gaslens", source: SOURCE, summary: "2 findings" });
  });

  it("reopens a saved run without calling the AI", async () => {
    saveDraft(SOURCE);
    const saved = await saveRun({
      tool: "gaslens",
      fileName: "Saved.sol",
      contractName: report.contractName,
      summary: "2 findings",
      source: SOURCE,
      report: report,
    });
    renderTool(saved.id);
    const dialog = await screen.findByRole("dialog", { name: gaslensCopy.resultsTitle });
    expect(within(dialog).getByText(report.summary)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("says when a saved run is gone", async () => {
    saveDraft(SOURCE);
    renderTool("missing-run");
    expect(await screen.findByText(historyCopy.missing)).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("points to the workspace when there is no contract", () => {
    renderTool();
    expect(screen.getByText(gaslensCopy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a loading state, then the diff, the findings and their estimates", async () => {
    saveDraft(SOURCE);
    let resolve: (response: Response) => void = () => undefined;
    fetchMock.mockReturnValue(new Promise((done) => (resolve = done)));
    renderTool();
    expect(screen.getByText(aiCopy.note)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.analyse }));
    expect(await findText(gaslensCopy.pendingTitle)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: gaslensCopy.analysing })).toBeDisabled();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/gaslens/analyze");

    await act(async () => resolve(json({ data: report })));
    await results();
    expect(await findText(gaslensCopy.doneTitle)).toBeInTheDocument();
    expect(screen.getAllByText("2 findings").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: gaslensCopy.viewChanges })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByText("1 added, 1 removed")).toBeInTheDocument();
    expect(linesOfKind("remove")).toEqual(["  address public owner;"]);
    expect(linesOfKind("add")).toEqual(["  address public immutable owner;"]);
    expect(screen.getByText("About 2,100 gas per call")).toBeInTheDocument();
    expect(screen.getByText(gaslensCopy.estimateNote)).toBeInTheDocument();
    expect(screen.getByText(gaslensCopy.reviewNote)).toBeInTheDocument();
  });

  it("explains the tool in a popover by the title and shows no result card before a review", async () => {
    saveDraft(SOURCE);
    renderTool();
    expect(screen.queryByText(gaslensCopy.lead)).toBeNull();
    expect(screen.queryByRole("region", { name: gaslensCopy.findingsLabel })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.about }));
    expect(await screen.findByText(gaslensCopy.lead)).toBeInTheDocument();
  });

  it("offers a new review and the results again once the layer is closed", async () => {
    saveDraft(SOURCE);
    await analyse();
    await closeResults();
    expect(screen.getByRole("button", { name: gaslensCopy.rerun })).toBeEnabled();
    expect(screen.queryByRole("button", { name: gaslensCopy.analyse })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.showResults }));
    expect(within(await results()).getByText(report.summary)).toBeInTheDocument();
  });

  it("warns in the toast when the check flagged a change", async () => {
    saveDraft(SOURCE);
    await analyse(flagged);
    expect(await findText("2 findings. 1 change may alter behaviour.")).toBeInTheDocument();
  });

  it("switches between the changes and the original source", async () => {
    saveDraft(SOURCE);
    await analyse();
    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.viewSource }));
    expect(linesOfKind("add")).toEqual([]);
    expect(screen.getByRole("region", { name: gaslensCopy.viewSource })).toHaveTextContent(
      "function fee()"
    );
  });

  it("highlights the lines of the open finding", async () => {
    saveDraft(SOURCE);
    await analyse();
    const highlighted = () =>
      Array.from(document.querySelectorAll("[data-highlighted]")).map((node) =>
        node.getAttribute("data-line")
      );
    expect(highlighted()).toEqual(["o2"]);
    fireEvent.click(screen.getByRole("button", { name: /Make fee external/ }));
    expect(highlighted()).toEqual(["o3"]);
  });

  it("copies the optimised contract", async () => {
    saveDraft(SOURCE);
    await analyse();
    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.copyOptimised }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(OPTIMIZED);
    expect(await screen.findByText(gaslensCopy.copied)).toBeInTheDocument();
  });

  it("never replaces the workspace contract itself", async () => {
    saveDraft(SOURCE);
    await analyse();
    expect(screen.queryByRole("button", { name: /use in workspace/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.copyOptimised }));
    expect(readDraft()).toEqual({ name: "Pool.sol", source: SOURCE });
  });

  it("says when the behaviour check found nothing", async () => {
    saveDraft(SOURCE);
    await analyse();
    const check = screen.getByRole("region", { name: gaslensCopy.check.label });
    expect(check).toHaveTextContent(gaslensCopy.check.clearTitle);
    expect(document.querySelectorAll("[data-flagged]")).toHaveLength(0);
  });

  it("lists flagged changes, marks their lines in the diff and focuses the first", async () => {
    saveDraft(SOURCE);
    await analyse(flagged);
    const check = screen.getByRole("region", { name: gaslensCopy.check.label });
    expect(check).toHaveTextContent("1 change may alter behaviour");
    expect(check).toHaveTextContent("Line 2 of the rewrite");
    const risk = screen.getByRole("button", { name: /getter now returns/ });
    expect(risk).toHaveAttribute("aria-pressed", "true");
    const flaggedLines = Array.from(document.querySelectorAll("[data-flagged]"));
    expect(flaggedLines.map((node) => node.getAttribute("data-line"))).toEqual(["n2"]);
    expect(flaggedLines[0]).toHaveAttribute("data-highlighted");

    fireEvent.click(screen.getByRole("button", { name: /Make owner immutable/ }));
    expect(risk).toHaveAttribute("aria-pressed", "false");
    expect(document.querySelector('[role="dialog"] [data-line="o2"]')).toHaveAttribute(
      "data-highlighted"
    );
    expect(document.querySelectorAll("[data-flagged]")).toHaveLength(1);
  });

  it("brings back the diff when a flagged change is chosen in source view", async () => {
    saveDraft(SOURCE);
    await analyse(flagged);
    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.viewSource }));
    expect(screen.getByRole("region", { name: gaslensCopy.viewSource })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /getter now returns/ }));
    expect(screen.getByRole("region", { name: gaslensCopy.viewChanges })).toBeInTheDocument();
  });

  it("warns when the behaviour check did not run", async () => {
    saveDraft(SOURCE);
    await analyse({ ...report, check: { status: "unavailable", risks: [] } });
    expect(screen.getByRole("region", { name: gaslensCopy.check.label })).toHaveTextContent(
      gaslensCopy.check.unavailableTitle
    );
  });

  it("flags the review as out of date when the contract is edited", async () => {
    saveDraft(SOURCE);
    await analyse();
    act(() => saveDraft(`${SOURCE}\nuint256 edited;`));
    expect(within(await results()).getByText(gaslensCopy.stale)).toBeInTheDocument();
  });

  it("says when there is nothing to optimise and hides the diff", async () => {
    saveDraft(SOURCE);
    await analyse({ ...report, summary: "Tight.", optimizedSource: SOURCE, optimizations: [] });
    expect(screen.getByText(gaslensCopy.noFindingsTitle)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: gaslensCopy.viewChanges })).toBeNull();
    expect(screen.queryByRole("region", { name: gaslensCopy.check.label })).toBeNull();
  });

  it("explains a failed review and retries", async () => {
    saveDraft(SOURCE);
    fetchMock.mockResolvedValueOnce(
      json({ error: { code: "upstream_unavailable", message: "down" } }, { status: 502 })
    );
    fetchMock.mockResolvedValueOnce(json({ data: report }));
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.analyse }));
    expect(await findText(gaslensCopy.failedTitle)).toBeInTheDocument();
    expect(await findText(aiCopy.errors.upstream_unavailable)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: aiCopy.retry }));
    expect(within(await results()).getByText(report.summary)).toBeInTheDocument();
  });

  it("says the AI service is busy and offers a retry", async () => {
    saveDraft(SOURCE);
    fetchMock.mockResolvedValueOnce(
      json({ error: { code: "upstream_busy", message: "busy" } }, { status: 502 })
    );
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.analyse }));
    expect(await findText(aiCopy.errors.upstream_busy)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: aiCopy.retry })).toBeInTheDocument();
  });

  it("shares the AI limit message with the other tools", async () => {
    saveDraft(SOURCE);
    fetchMock.mockResolvedValue(
      json(
        { error: { code: "rate_limited", message: "Too many requests." } },
        { status: 429, headers: { "Retry-After": "90" } }
      )
    );
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.analyse }));
    expect(await findText(`${aiCopy.errors.rate_limited} ${retryIn(90)}`)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: aiCopy.retry })).toBeNull();
  });

  it("refuses a contract over 60 KB", () => {
    saveDraft("a".repeat(61 * 1024));
    renderTool();
    expect(screen.getByRole("alert")).toHaveTextContent(gaslensCopy.tooLarge);
  });
});
