import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toaster } from "@/components/ui/toaster";
import { aiCopy } from "@/lib/copy";
import { toast } from "@/lib/toast";
import { compiledTitle, forgeCopy, lineLabel } from "../copy";
import type { CompileResult, GeneratedContract } from "../types";
import { ForgeTool } from "./forge-tool";

const SOURCE = [
  "pragma solidity ^0.8.24;",
  "contract Vault {",
  "  constructor(address owner) {}",
  "  function deposit() external payable {}",
  "}",
].join("\n");

const compiled: CompileResult = {
  status: "compiled",
  compilerVersion: "0.8.38+commit.1835d247",
  standardJsonInput: "{}",
  warnings: [],
  contracts: [
    {
      name: "Vault",
      bytecode: "0x6080",
      deployedSize: 2048,
      abi: [
        { type: "constructor", inputs: [{ name: "owner", type: "address" }] },
        { type: "function", name: "deposit", inputs: [], stateMutability: "payable" },
      ],
    },
  ],
};

const failed: CompileResult = {
  status: "failed",
  compilerVersion: "0.8.38+commit.1835d247",
  warnings: [],
  errors: [
    { severity: "error", kind: "ParserError", message: "Expected ';' but got '}'", line: 4 },
  ],
};

const generated: GeneratedContract = {
  contractName: "Vault",
  fileName: "Vault.sol",
  summary: "Holds deposits.",
  source: SOURCE,
  notes: ["Choose the owner at deployment."],
  compile: compiled,
};

const fetchMock = vi.fn<typeof fetch>();

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
}

function saveDraft(source: string, name = "Vault.sol") {
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
      <ForgeTool />
      <Toaster closeLabel={aiCopy.closeNotification} regionLabel={aiCopy.notifications} />
    </QueryClientProvider>
  );
}

function promptBox() {
  return screen.getByRole("textbox", { name: forgeCopy.generate.label });
}

beforeEach(() => {
  for (const item of toast.items()) toast.dismiss(item.id);
  window.localStorage.clear();
  window.localStorage.setItem("monad-studio:seen:forge", "seen");
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

describe("ForgeTool: write a contract", () => {
  it("explains the screen once on the first visit", async () => {
    window.localStorage.removeItem("monad-studio:seen:forge");
    renderTool();
    const intro = await screen.findByRole("dialog", { name: forgeCopy.intro.title });
    expect(intro).toHaveTextContent(forgeCopy.intro.points[0].title);
  });

  it("keeps the button off until the description is long enough", () => {
    renderTool();
    const button = screen.getByRole("button", { name: forgeCopy.generate.run });
    expect(button).toBeDisabled();
    fireEvent.change(promptBox(), { target: { value: "token" } });
    expect(button).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.generate.examples[0] }));
    expect(promptBox()).toHaveValue(forgeCopy.generate.examples[0]);
    expect(button).toBeEnabled();
  });

  it("shows the written contract and loads it into the workspace only when asked", async () => {
    saveDraft("contract Mine {}", "Mine.sol");
    let resolve: (response: Response) => void = () => undefined;
    fetchMock.mockImplementationOnce(() => new Promise((done) => (resolve = done)));
    renderTool();
    fireEvent.change(promptBox(), { target: { value: "A vault that takes deposits" } });
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.generate.run }));

    expect(await screen.findByRole("button", { name: forgeCopy.generate.running })).toBeDisabled();
    expect(await screen.findByText(forgeCopy.generate.pendingTitle)).toBeInTheDocument();
    const sent = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(sent).toEqual({ prompt: "A vault that takes deposits" });

    resolve(json({ data: generated }));
    const sheet = await screen.findByRole("dialog", { name: forgeCopy.generate.resultsTitle });
    expect(within(sheet).getByText(forgeCopy.generate.compiles)).toBeInTheDocument();
    expect(within(sheet).getByText(generated.notes[0])).toBeInTheDocument();
    expect(
      within(sheet).getByRole("region", { name: forgeCopy.generate.codeLabel })
    ).toBeInTheDocument();
    expect(readDraft().name).toBe("Mine.sol");

    fireEvent.click(within(sheet).getByRole("button", { name: forgeCopy.generate.use }));
    expect(readDraft()).toEqual({ name: "Vault.sol", source: SOURCE });
    expect(await screen.findByText(forgeCopy.generate.usedTitle)).toBeInTheDocument();
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("brings the written contract back after the layer is closed", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: generated }));
    renderTool();
    fireEvent.change(promptBox(), { target: { value: "A vault that takes deposits" } });
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.generate.run }));
    await screen.findByRole("dialog", { name: forgeCopy.generate.resultsTitle });
    fireEvent.click(screen.getByRole("button", { name: aiCopy.closeResults }));
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.generate.showResult }));
    expect(
      await screen.findByRole("dialog", { name: forgeCopy.generate.resultsTitle })
    ).toBeInTheDocument();
  });

  it("marks a written contract that does not compile and jumps to its errors", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { ...generated, compile: failed } }));
    renderTool();
    fireEvent.change(promptBox(), { target: { value: "A vault that takes deposits" } });
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.generate.run }));
    const sheet = await screen.findByRole("dialog", { name: forgeCopy.generate.resultsTitle });
    expect(within(sheet).getByText(forgeCopy.generate.doesNotCompile)).toBeInTheDocument();
    const region = within(sheet).getByRole("region", { name: forgeCopy.generate.codeLabel });
    expect(region.querySelector('[data-line="l4"]')).toHaveAttribute("data-flagged", "true");
    fireEvent.click(within(sheet).getByRole("button", { name: lineLabel(4) }));
    expect(region.querySelector('[data-line="l4"]')).toHaveAttribute("data-highlighted", "true");
  });

  it("shows the error with a retry when the AI call fails", async () => {
    fetchMock.mockResolvedValue(
      json({ error: { code: "upstream_busy", message: "busy" } }, { status: 502 })
    );
    renderTool();
    fireEvent.change(promptBox(), { target: { value: "A vault that takes deposits" } });
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.generate.run }));
    expect(await screen.findByText(aiCopy.errors.upstream_busy)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: aiCopy.retry }));
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});

describe("ForgeTool: compile", () => {
  it("points to the workspace when it is empty", () => {
    renderTool();
    expect(screen.getByText(forgeCopy.compile.emptyTitle)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: forgeCopy.compile.openWorkspace })).toHaveAttribute(
      "href",
      "/studio"
    );
  });

  it("compiles the workspace contract and opens what it can deploy in the results layer", async () => {
    saveDraft(SOURCE);
    fetchMock.mockResolvedValueOnce(json({ data: compiled }));
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.run }));

    const sheet = await screen.findByRole("dialog", { name: forgeCopy.compile.resultsTitle });
    expect(await screen.findByText(compiledTitle(1))).toBeInTheDocument();
    const sent = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(sent).toEqual({ fileName: "Vault.sol", source: SOURCE });
    expect(
      within(sheet).getByRole("region", { name: forgeCopy.compile.compiledCodeLabel })
    ).toBeInTheDocument();
    expect(within(sheet).getByText("constructor(address owner)")).toBeInTheDocument();
    expect(within(sheet).getByText("deposit()")).toBeInTheDocument();
    expect(within(sheet).getByText("payable")).toBeInTheDocument();
    fireEvent.click(within(sheet).getByRole("button", { name: forgeCopy.compile.copyBytecode }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("0x6080");

    fireEvent.click(screen.getByRole("button", { name: aiCopy.closeResults }));
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.queryByText("deposit()")).toBeNull();
    expect(screen.getByRole("button", { name: forgeCopy.compile.rerun })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.showResults }));
    expect(
      await screen.findByRole("dialog", { name: forgeCopy.compile.resultsTitle })
    ).toBeInTheDocument();
  });

  it("sends a safe file name for an untitled draft", async () => {
    saveDraft(SOURCE, "");
    fetchMock.mockResolvedValueOnce(json({ data: compiled }));
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.run }));
    await screen.findByText(compiledTitle(1));
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).fileName).toBe("Contract.sol");
  });

  it("shows compiler errors on their line and marks a result made stale by an edit", async () => {
    saveDraft(SOURCE);
    fetchMock.mockResolvedValueOnce(json({ data: failed }));
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.run }));

    const sheet = await screen.findByRole("dialog", { name: forgeCopy.compile.resultsTitle });
    expect(within(sheet).getByText(failed.errors[0].message)).toBeInTheDocument();
    const code = within(sheet).getByRole("region", { name: forgeCopy.compile.compiledCodeLabel });
    expect(code.querySelector('[data-line="l4"]')).toHaveAttribute("data-flagged", "true");

    fireEvent.click(within(sheet).getByRole("button", { name: lineLabel(4) }));
    expect(code.querySelector('[data-line="l4"]')).toHaveAttribute("data-highlighted", "true");

    saveDraft(`${SOURCE}\n`);
    expect(await within(sheet).findByText(forgeCopy.compile.stale)).toBeInTheDocument();
  });

  it("says when nothing in the file can be deployed", async () => {
    saveDraft("interface IVault {}");
    fetchMock.mockResolvedValueOnce(json({ data: { ...compiled, contracts: [] } }));
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.run }));
    expect(await screen.findByText(forgeCopy.compile.nothingToDeploy)).toBeInTheDocument();
  });

  it("blocks a contract over the size limit", () => {
    saveDraft("a".repeat(61 * 1024));
    renderTool();
    expect(screen.getByText(forgeCopy.compile.tooLarge)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: forgeCopy.compile.run })).toBeNull();
  });
});
