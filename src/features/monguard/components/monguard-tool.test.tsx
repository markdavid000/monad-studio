import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toaster } from "@/components/ui/toaster";
import { aiCopy, retryIn } from "@/lib/copy";
import { toast } from "@/lib/toast";
import { monguardCopy } from "../copy";
import type { ScanReport } from "../types";
import { MonguardTool } from "./monguard-tool";

const SOURCE = ["contract Bank {", "  function withdraw() public {", "  }", "}"].join("\n");

const report: ScanReport = {
  contractName: "Bank",
  summary: "Withdraw can be reentered.",
  score: 75,
  findings: [
    {
      id: "MG-01",
      severity: "critical",
      title: "Reentrancy in withdraw",
      description: "Balance is cleared after the call.",
      impact: "An attacker drains the contract.",
      fix: "balances[msg.sender] = 0;",
      fixCode: "",
      lines: [2],
    },
    {
      id: "MG-02",
      severity: "low",
      title: "Missing event",
      description: "No event on withdraw.",
      impact: "Indexers miss withdrawals.",
      fix: "emit Withdraw(msg.sender);",
      fixCode: "",
      lines: [3],
    },
  ],
};

const fetchMock = vi.fn<typeof fetch>();

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
}

function saveDraft(source: string, name = "Bank.sol") {
  window.localStorage.setItem("monad-studio:draft", JSON.stringify({ name, source }));
  window.dispatchEvent(new Event("monad-studio:draft-change"));
}

function renderTool() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MonguardTool />
      <Toaster closeLabel={aiCopy.closeNotification} regionLabel={aiCopy.notifications} />
    </QueryClientProvider>
  );
}

function scanButton() {
  return screen.getByRole("button", { name: monguardCopy.scan });
}

async function findText(text: string) {
  return (await screen.findAllByText(text))[0];
}

function results() {
  return screen.findByRole("dialog", { name: monguardCopy.resultsTitle });
}

function closeResults() {
  fireEvent.click(screen.getByRole("button", { name: aiCopy.closeResults }));
}

function highlightedLines() {
  return Array.from(document.querySelectorAll("[data-highlighted]")).map((node) =>
    node.getAttribute("data-line")
  );
}

beforeEach(() => {
  for (const item of toast.items()) toast.dismiss(item.id);
  window.localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("MonguardTool", () => {
  it("points to the workspace when there is no contract", () => {
    renderTool();
    expect(screen.getByText(monguardCopy.emptyTitle)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: monguardCopy.openWorkspace })).toHaveAttribute(
      "href",
      "/studio"
    );
  });

  it("shows the workspace contract with line numbers and labels the result as AI analysis", () => {
    saveDraft(SOURCE);
    renderTool();
    expect(screen.getByText("Bank.sol")).toBeInTheDocument();
    expect(screen.getByText("function withdraw() public {", { exact: false })).toBeInTheDocument();
    expect(screen.getByText(aiCopy.note)).toBeInTheDocument();
    expect(scanButton()).toBeEnabled();
  });

  it("explains the tool in a popover by the title and shows no result card before a scan", async () => {
    saveDraft(SOURCE);
    renderTool();
    expect(screen.queryByText(monguardCopy.lead)).toBeNull();
    expect(screen.queryByRole("region", { name: monguardCopy.findingsLabel })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: monguardCopy.about }));
    expect(await screen.findByText(monguardCopy.lead)).toBeInTheDocument();
  });

  it("disables the scan button while scanning, then opens the results over the page", async () => {
    saveDraft(SOURCE);
    let resolve: (response: Response) => void = () => undefined;
    fetchMock.mockReturnValue(new Promise((done) => (resolve = done)));
    renderTool();
    fireEvent.click(scanButton());
    expect(await screen.findByRole("button", { name: monguardCopy.scanning })).toBeDisabled();
    expect(await findText(monguardCopy.pendingTitle)).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/monguard/scan");
    expect(JSON.parse(String(init?.body))).toEqual({ source: SOURCE });

    await act(async () => resolve(json({ data: report })));
    const dialog = await results();
    expect(await findText(monguardCopy.doneTitle)).toBeInTheDocument();
    expect(within(dialog).getByText("75")).toBeInTheDocument();
    expect(within(dialog).getByText(report.summary)).toBeInTheDocument();
    expect(within(dialog).getByText("2 findings")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /Reentrancy in withdraw/ })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(within(dialog).getByText(report.findings[0].impact)).toBeInTheDocument();
    expect(highlightedLines()).toEqual(["2"]);
  });

  it("brings the results back with a button after they are closed", async () => {
    saveDraft(SOURCE);
    fetchMock.mockImplementation(async () => json({ data: report }));
    renderTool();
    expect(screen.queryByRole("button", { name: monguardCopy.showResults })).toBeNull();
    fireEvent.click(scanButton());
    await results();
    closeResults();
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByRole("button", { name: monguardCopy.rescan })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: monguardCopy.showResults }));
    expect(within(await results()).getByText(report.summary)).toBeInTheDocument();
  });

  it("opens another finding and highlights its lines", async () => {
    saveDraft(SOURCE);
    fetchMock.mockImplementation(async () => json({ data: report }));
    renderTool();
    fireEvent.click(scanButton());

    fireEvent.click(await screen.findByRole("button", { name: /Missing event/ }));
    expect(screen.getByRole("button", { name: /Missing event/ })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByRole("button", { name: /Reentrancy/ })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(highlightedLines()).toEqual(["3"]);

    fireEvent.click(screen.getByRole("button", { name: /Missing event/ }));
    expect(highlightedLines()).toEqual([]);
  });

  it("says when nothing was found", async () => {
    saveDraft(SOURCE);
    fetchMock.mockResolvedValue(json({ data: { ...report, score: 100, findings: [] } }));
    renderTool();
    fireEvent.click(scanButton());
    const dialog = await results();
    expect(within(dialog).getByText(monguardCopy.noFindingsTitle)).toBeInTheDocument();
    expect(within(dialog).getByText("0 findings")).toBeInTheDocument();
  });

  it("flags a result as out of date when the contract changes", async () => {
    saveDraft(SOURCE);
    fetchMock.mockImplementation(async () => json({ data: report }));
    renderTool();
    fireEvent.click(scanButton());
    await results();
    closeResults();
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    act(() => saveDraft(`${SOURCE}\nuint256 edited;`));
    fireEvent.click(screen.getByRole("button", { name: monguardCopy.showResults }));
    expect(within(await results()).getByText(monguardCopy.stale)).toBeInTheDocument();
    closeResults();
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: monguardCopy.rescan }));
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body)).source).toContain(
      "uint256 edited;"
    );
  });

  it("explains an invalid AI reply in a toast and lets the user retry", async () => {
    saveDraft(SOURCE);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    fetchMock.mockResolvedValueOnce(
      json({ error: { code: "invalid_reply", message: "bad" } }, { status: 502 })
    );
    fetchMock.mockResolvedValueOnce(json({ data: report }));
    renderTool();
    fireEvent.click(scanButton());

    expect(await findText(monguardCopy.failedTitle)).toBeInTheDocument();
    expect(await findText(aiCopy.errors.invalid_reply)).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: aiCopy.retry }));
    expect(within(await results()).getByText(report.summary)).toBeInTheDocument();
  });

  it("says when the scan limit is reached and when to come back", async () => {
    saveDraft(SOURCE);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    fetchMock.mockResolvedValue(
      json(
        { error: { code: "rate_limited", message: "Too many requests." } },
        { status: 429, headers: { "Retry-After": "300" } }
      )
    );
    renderTool();
    fireEvent.click(scanButton());

    expect(await findText(`${aiCopy.errors.rate_limited} ${retryIn(300)}`)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: aiCopy.retry })).toBeNull();
  });

  it("treats a reply in the wrong shape as an invalid reply", async () => {
    saveDraft(SOURCE);
    fetchMock.mockResolvedValue(json({ data: { score: "high" } }));
    renderTool();
    fireEvent.click(scanButton());
    expect(await findText(aiCopy.errors.invalid_reply)).toBeInTheDocument();
  });

  it("refuses to scan a contract over 60 KB", () => {
    saveDraft("a".repeat(61 * 1024));
    renderTool();
    expect(screen.getByRole("alert")).toHaveTextContent(monguardCopy.tooLarge);
    expect(screen.queryByRole("button", { name: monguardCopy.scan })).toBeNull();
  });
});
