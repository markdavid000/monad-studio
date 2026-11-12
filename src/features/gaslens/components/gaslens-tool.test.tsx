import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { aiCopy, retryIn } from "@/lib/copy";
import { gaslensCopy } from "../copy";
import type { GasReport } from "../types";
import { GaslensTool } from "./gaslens-tool";

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

function renderTool() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <GaslensTool />
    </QueryClientProvider>
  );
}

async function analyse(body: GasReport = report) {
  fetchMock.mockImplementation(async () => json({ data: body }));
  renderTool();
  fireEvent.click(screen.getByRole("button", { name: gaslensCopy.analyse }));
  await screen.findByText(body.summary);
}

function linesOfKind(kind: "add" | "remove") {
  return Array.from(document.querySelectorAll(`[data-kind="${kind}"]`)).map((node) =>
    node.querySelector("code")?.textContent?.slice(1)
  );
}

beforeEach(() => {
  window.localStorage.clear();
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
    expect(await screen.findByText(gaslensCopy.pendingTitle)).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/gaslens/analyze");

    await act(async () => resolve(json({ data: report })));
    expect(await screen.findByText("2 findings")).toBeInTheDocument();
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

  it("puts the optimised contract in the workspace and says so", async () => {
    saveDraft(SOURCE);
    await analyse();
    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.useOptimised }));
    expect(readDraft()).toEqual({ name: "Pool.sol", source: OPTIMIZED });
    expect(screen.getByText(gaslensCopy.applied)).toBeInTheDocument();
    expect(screen.queryByText(gaslensCopy.stale)).toBeNull();
    expect(screen.queryByRole("button", { name: gaslensCopy.useOptimised })).toBeNull();
  });

  it("flags the review as out of date when the contract is edited", async () => {
    saveDraft(SOURCE);
    await analyse();
    act(() => saveDraft(`${SOURCE}\nuint256 edited;`));
    expect(screen.getByText(gaslensCopy.stale)).toBeInTheDocument();
  });

  it("says when there is nothing to optimise and hides the diff", async () => {
    saveDraft(SOURCE);
    await analyse({ ...report, summary: "Tight.", optimizedSource: SOURCE, optimizations: [] });
    expect(screen.getByText(gaslensCopy.noFindingsTitle)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: gaslensCopy.viewChanges })).toBeNull();
    expect(screen.queryByRole("button", { name: gaslensCopy.useOptimised })).toBeNull();
  });

  it("explains a failed review and retries", async () => {
    saveDraft(SOURCE);
    fetchMock.mockResolvedValueOnce(
      json({ error: { code: "upstream_unavailable", message: "down" } }, { status: 502 })
    );
    fetchMock.mockResolvedValueOnce(json({ data: report }));
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: gaslensCopy.analyse }));
    expect(await screen.findByRole("alert")).toHaveTextContent(aiCopy.errors.upstream_unavailable);
    fireEvent.click(screen.getByRole("button", { name: aiCopy.retry }));
    expect(await screen.findByText(report.summary)).toBeInTheDocument();
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
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(aiCopy.errors.rate_limited);
    expect(alert).toHaveTextContent(retryIn(90));
  });

  it("refuses a contract over 60 KB", () => {
    saveDraft("a".repeat(61 * 1024));
    renderTool();
    expect(screen.getByRole("alert")).toHaveTextContent(gaslensCopy.tooLarge);
  });
});
