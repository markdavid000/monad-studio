import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toaster } from "@/components/ui/toaster";
import { aiCopy, historyCopy, journeyCopy } from "@/lib/copy";
import { clearRuns, listRuns, saveRun } from "@/lib/history";
import { toast } from "@/lib/toast";
import { compiledTitle, errorsTitle, forgeCopy, lineLabel } from "../copy";
import type { CompileResult, GeneratedContract } from "../types";
import { ForgeTool } from "./forge-tool";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/studio/forge",
}));

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" }),
}));

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

function newClient() {
  return new QueryClient({ defaultOptions: { mutations: { retry: false } } });
}

function renderTool(runId?: string, client = newClient()) {
  return render(
    <QueryClientProvider client={client}>
      <ForgeTool runId={runId} />
      <Toaster closeLabel={aiCopy.closeNotification} regionLabel={aiCopy.notifications} />
    </QueryClientProvider>
  );
}

function promptBox() {
  return screen.getByRole("textbox", { name: forgeCopy.generate.label });
}

function writeContract() {
  fireEvent.change(promptBox(), { target: { value: "A vault that takes deposits" } });
  fireEvent.click(screen.getByRole("button", { name: forgeCopy.generate.run }));
}

function writtenSheet() {
  return screen.findByRole("dialog", { name: forgeCopy.generate.resultsTitle });
}

function compileSheet() {
  return screen.findByRole("dialog", { name: forgeCopy.compile.resultsTitle });
}

async function closeSheet() {
  fireEvent.click(screen.getByRole("button", { name: aiCopy.closeResults }));
  await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
}

beforeEach(async () => {
  await clearRuns();
  for (const item of toast.items()) toast.dismiss(item.id);
  window.localStorage.clear();
  window.sessionStorage.clear();
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

  it("opens the written contract beside its code and loads it into the workspace only when asked", async () => {
    saveDraft("contract Mine {}", "Mine.sol");
    let resolve: (response: Response) => void = () => undefined;
    fetchMock.mockImplementationOnce(() => new Promise((done) => (resolve = done)));
    renderTool();
    writeContract();

    expect(await screen.findByRole("button", { name: forgeCopy.generate.running })).toBeDisabled();
    expect(await screen.findByText(forgeCopy.generate.pendingTitle)).toBeInTheDocument();
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      prompt: "A vault that takes deposits",
    });

    await act(async () => resolve(json({ data: generated })));
    const sheet = await writtenSheet();
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

  it("saves each written contract to the activity", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: generated }));
    renderTool();
    writeContract();
    await writtenSheet();
    await vi.waitFor(async () => expect(await listRuns()).toHaveLength(1));
    const [saved] = await listRuns();
    expect(saved).toMatchObject({
      tool: "forge",
      fileName: "Vault.sol",
      contractName: "Vault",
      summary: "Written, compiles",
      source: SOURCE,
      report: { kind: "generate" },
    });
  });

  it("keeps the last written contract and its button after leaving the page", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: generated }));
    const client = newClient();
    const first = renderTool(undefined, client);
    writeContract();
    await writtenSheet();
    await vi.waitFor(async () => expect(await listRuns()).toHaveLength(1));
    first.unmount();

    renderTool(undefined, client);
    expect(await screen.findByText(forgeCopy.generate.lastLabel)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.generate.showResult }));
    expect(within(await writtenSheet()).getByText(generated.summary)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("finishes and saves a contract being written while away", async () => {
    let resolve: (response: Response) => void = () => undefined;
    fetchMock.mockImplementationOnce(() => new Promise((done) => (resolve = done)));
    const client = newClient();
    const first = renderTool(undefined, client);
    writeContract();
    await screen.findByRole("button", { name: forgeCopy.generate.running });
    first.unmount();

    renderTool(undefined, client);
    expect(screen.getByRole("button", { name: forgeCopy.generate.running })).toBeDisabled();
    await act(async () => resolve(json({ data: generated })));
    await vi.waitFor(async () => expect(await listRuns()).toHaveLength(1));
    expect(
      await screen.findByRole("button", { name: forgeCopy.generate.showResult })
    ).toBeInTheDocument();
  });

  it("marks a written contract that does not compile and jumps to its errors", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { ...generated, compile: failed } }));
    renderTool();
    writeContract();
    const sheet = await writtenSheet();
    expect(within(sheet).getByText(forgeCopy.generate.doesNotCompile)).toBeInTheDocument();
    const region = within(sheet).getByRole("region", { name: forgeCopy.generate.codeLabel });
    expect(region.querySelector('[data-line="l4"]')).toHaveAttribute("data-flagged", "true");
    fireEvent.click(within(sheet).getByRole("button", { name: lineLabel(4) }));
    expect(region.querySelector('[data-line="l4"]')).toHaveAttribute("data-highlighted", "true");
    await closeSheet();
    expect(screen.getByText(errorsTitle(1))).toBeInTheDocument();
  });

  it("compiles the written contract from its next step bar", async () => {
    saveDraft("contract Mine {}", "Mine.sol");
    fetchMock
      .mockResolvedValueOnce(json({ data: generated }))
      .mockResolvedValueOnce(json({ data: compiled }));
    renderTool();
    writeContract();
    const bar = within(await writtenSheet()).getByRole("group", { name: journeyCopy.label });
    expect(within(bar).getByText(forgeCopy.generate.statusWritten)).toBeInTheDocument();
    fireEvent.click(within(bar).getByRole("button", { name: forgeCopy.generate.compileNow }));

    expect(readDraft()).toEqual({ name: "Vault.sol", source: SOURCE });
    const sheet = await compileSheet();
    expect(screen.queryByRole("dialog", { name: forgeCopy.generate.resultsTitle })).toBeNull();
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({
      fileName: "Vault.sol",
      source: SOURCE,
    });
    const compiledBar = within(sheet).getByRole("group", { name: journeyCopy.label });
    fireEvent.click(within(compiledBar).getByRole("button", { name: journeyCopy.gas }));
    expect(router.push).toHaveBeenLastCalledWith("/studio/gaslens?run=new");
  });

  it("sends the written contract to MonGuard through the workspace", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: generated }));
    renderTool();
    writeContract();
    const bar = within(await writtenSheet()).getByRole("group", { name: journeyCopy.label });
    fireEvent.click(within(bar).getByRole("button", { name: journeyCopy.scan }));
    expect(readDraft()).toEqual({ name: "Vault.sol", source: SOURCE });
    expect(router.push).toHaveBeenLastCalledWith("/studio/monguard?run=new");
  });

  it("shows the error with a retry when the AI call fails", async () => {
    fetchMock.mockResolvedValue(
      json({ error: { code: "upstream_busy", message: "busy" } }, { status: 502 })
    );
    renderTool();
    writeContract();
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
    expect(screen.getByRole("button", { name: forgeCopy.compile.run })).toBeDisabled();
  });

  it("summarises the workspace contract instead of printing all of it", () => {
    saveDraft(SOURCE);
    renderTool();
    const card = screen.getByRole("region", { name: forgeCopy.compile.heading });
    expect(within(card).getByText("Vault.sol")).toBeInTheDocument();
    expect(within(card).getByText("^0.8.24")).toBeInTheDocument();
    expect(within(card).getByText("Vault")).toBeInTheDocument();
    expect(within(card).getByText(/5 lines/)).toBeInTheDocument();
    expect(
      screen.queryByText("function deposit() external payable {}", { exact: false })
    ).toBeNull();
  });

  it("compiles the workspace contract, saves it and opens it in the results layer", async () => {
    saveDraft(SOURCE);
    fetchMock.mockResolvedValueOnce(json({ data: compiled }));
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.run }));

    const sheet = await compileSheet();
    expect((await screen.findAllByText(compiledTitle(1))).length).toBeGreaterThan(0);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      fileName: "Vault.sol",
      source: SOURCE,
    });
    expect(
      within(sheet).getByRole("region", { name: forgeCopy.compile.compiledCodeLabel })
    ).toBeInTheDocument();
    expect(within(sheet).getByText("constructor(address owner)")).toBeInTheDocument();
    expect(within(sheet).getByText("deposit()")).toBeInTheDocument();
    fireEvent.click(within(sheet).getByRole("button", { name: forgeCopy.compile.copyBytecode }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("0x6080");

    await vi.waitFor(async () => expect(await listRuns()).toHaveLength(1));
    const [saved] = await listRuns();
    expect(saved).toMatchObject({
      tool: "forge",
      contractName: "Vault",
      summary: compiledTitle(1),
      report: { kind: "compile", fileName: "Vault.sol" },
    });

    await closeSheet();
    expect(screen.queryByText("deposit()")).toBeNull();
    expect(screen.getByRole("button", { name: forgeCopy.compile.rerun })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.showResults }));
    expect(await compileSheet()).toBeInTheDocument();
  });

  it("keeps the last compile after leaving the page and marks it once the contract changes", async () => {
    saveDraft(SOURCE);
    fetchMock.mockResolvedValueOnce(json({ data: compiled }));
    const client = newClient();
    const first = renderTool(undefined, client);
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.run }));
    await compileSheet();
    await vi.waitFor(async () => expect(await listRuns()).toHaveLength(1));
    first.unmount();

    renderTool(undefined, client);
    expect(await screen.findByText(forgeCopy.compile.lastLabel)).toBeInTheDocument();
    expect(screen.queryByText(forgeCopy.compile.changedSince)).toBeNull();
    saveDraft(`${SOURCE}\n`);
    expect(await screen.findByText(forgeCopy.compile.changedSince)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.showResults }));
    const sheet = await compileSheet();
    expect(within(sheet).getByText(forgeCopy.compile.stale)).toBeInTheDocument();
  });

  it("reopens a saved compile from the activity without compiling again", async () => {
    const run = await saveRun({
      tool: "forge",
      fileName: "Vault.sol",
      contractName: "Vault",
      summary: compiledTitle(1),
      source: SOURCE,
      report: { kind: "compile", fileName: "Vault.sol", result: compiled },
    });
    saveDraft(SOURCE);
    renderTool(run.id);
    const sheet = await compileSheet();
    expect(within(sheet).getByText("deposit()")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("says when a saved run is gone", async () => {
    renderTool("00000000-0000-4000-8000-000000000000");
    expect(await screen.findByText(historyCopy.missing)).toBeInTheDocument();
  });

  it("sends a safe file name for an untitled draft", async () => {
    saveDraft(SOURCE, "");
    fetchMock.mockResolvedValueOnce(json({ data: compiled }));
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.run }));
    await screen.findAllByText(compiledTitle(1));
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).fileName).toBe("Contract.sol");
  });

  it("shows compiler errors on their line in the results layer", async () => {
    saveDraft(SOURCE);
    fetchMock.mockResolvedValueOnce(json({ data: failed }));
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.run }));

    const sheet = await compileSheet();
    expect(within(sheet).getByText(failed.errors[0].message)).toBeInTheDocument();
    const code = within(sheet).getByRole("region", { name: forgeCopy.compile.compiledCodeLabel });
    expect(code.querySelector('[data-line="l4"]')).toHaveAttribute("data-flagged", "true");
    fireEvent.click(within(sheet).getByRole("button", { name: lineLabel(4) }));
    expect(code.querySelector('[data-line="l4"]')).toHaveAttribute("data-highlighted", "true");
  });

  it("suggests fixes for compiler errors, shows them, then accepts and compiles", async () => {
    const fixedSource = SOURCE.replace("{}", "{ }");
    saveDraft(SOURCE);
    fetchMock
      .mockResolvedValueOnce(json({ data: failed }))
      .mockResolvedValueOnce(
        json({
          data: {
            fixedSource,
            changes: [{ line: 4, note: "Adds the missing semicolon." }],
            compile: compiled,
          },
        })
      )
      .mockResolvedValueOnce(json({ data: compiled }));
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.run }));
    const sheet = await compileSheet();
    const bar = within(sheet).getByRole("group", { name: journeyCopy.label });
    fireEvent.click(within(bar).getByRole("button", { name: forgeCopy.compile.fixes.suggest }));

    expect(await within(sheet).findByText("Adds the missing semicolon.")).toBeInTheDocument();
    expect(fetchMock.mock.calls[1][0]).toBe("/api/forge/fix");
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({
      fileName: "Vault.sol",
      source: SOURCE,
    });
    expect(within(sheet).getByText(forgeCopy.compile.fixes.compiles)).toBeInTheDocument();
    const diff = within(sheet).getByRole("region", { name: forgeCopy.compile.fixes.diffLabel });
    expect(diff.querySelector('[data-kind="add"]')).toBeInTheDocument();
    expect(readDraft().source).toBe(SOURCE);

    fireEvent.click(
      within(within(sheet).getByRole("group", { name: journeyCopy.label })).getByRole("button", {
        name: forgeCopy.compile.fixes.accept,
      })
    );
    expect(readDraft().source).toBe(fixedSource);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(JSON.parse(String(fetchMock.mock.calls[2][1]?.body)).source).toBe(fixedSource);
    const after = await compileSheet();
    expect(await within(after).findByText("deposit()")).toBeInTheDocument();
  });

  it("goes back to the errors and offers the fixes again", async () => {
    saveDraft(SOURCE);
    fetchMock.mockResolvedValueOnce(json({ data: failed })).mockResolvedValueOnce(
      json({
        data: {
          fixedSource: `${SOURCE}\n`,
          changes: [{ line: 4, note: "Adds the missing semicolon." }],
          compile: compiled,
        },
      })
    );
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.run }));
    const sheet = await compileSheet();
    fireEvent.click(within(sheet).getByRole("button", { name: forgeCopy.compile.fixes.suggest }));
    fireEvent.click(
      await within(sheet).findByRole("button", { name: forgeCopy.compile.fixes.back })
    );
    expect(within(sheet).getByText(failed.errors[0].message)).toBeInTheDocument();
    fireEvent.click(within(sheet).getByRole("button", { name: forgeCopy.compile.fixes.show }));
    expect(within(sheet).getByText("Adds the missing semicolon.")).toBeInTheDocument();
  });

  it("does not offer suggested fixes once the contract compiles", async () => {
    saveDraft(SOURCE);
    fetchMock.mockResolvedValueOnce(json({ data: compiled }));
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.run }));
    const sheet = await compileSheet();
    expect(
      within(sheet).queryByRole("button", { name: forgeCopy.compile.fixes.suggest })
    ).toBeNull();
  });

  it("says when nothing in the file can be deployed", async () => {
    saveDraft("interface IVault {}");
    fetchMock.mockResolvedValueOnce(json({ data: { ...compiled, contracts: [] } }));
    renderTool();
    fireEvent.click(screen.getByRole("button", { name: forgeCopy.compile.run }));
    expect(await screen.findByText(forgeCopy.compile.nothingToDeploy)).toBeInTheDocument();
  });

  it("compiles by itself when a contract is sent here", async () => {
    saveDraft(SOURCE);
    fetchMock.mockResolvedValueOnce(json({ data: compiled }));
    render(
      <QueryClientProvider client={newClient()}>
        <ForgeTool autoRun />
      </QueryClientProvider>
    );
    await compileSheet();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/studio/forge");
  });

  it("blocks a contract over the size limit", () => {
    saveDraft("a".repeat(61 * 1024));
    renderTool();
    expect(screen.getByRole("alert")).toHaveTextContent(forgeCopy.compile.tooLarge);
    expect(screen.getByRole("button", { name: forgeCopy.compile.run })).toBeDisabled();
  });
});
