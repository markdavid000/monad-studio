import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exampleContracts } from "@/config/examples";
import { clearRuns, listRuns } from "@/lib/history";
import { monguardCopy, monguardDemoCopy } from "../copy";
import { demoReports } from "../demo/demo-reports";
import { MonguardDemo } from "./monguard-demo";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(async () => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  await clearRuns();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("MonguardDemo", () => {
  it("has a recorded scan for every example contract", () => {
    for (const example of exampleContracts) {
      expect(demoReports[example.id]?.findings.length).toBeGreaterThan(0);
    }
  });

  it("shows the recorded scan of the chosen example without calling the server or saving it", async () => {
    render(<MonguardDemo />);
    const [first, second] = exampleContracts;
    expect(screen.getByRole("button", { name: new RegExp(first.name) })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    fireEvent.click(screen.getByRole("button", { name: new RegExp(second.name) }));
    fireEvent.click(screen.getByRole("button", { name: monguardDemoCopy.run }));
    const sheet = await screen.findByRole("dialog", { name: monguardCopy.resultsTitle });
    const report = demoReports[second.id];
    expect(within(sheet).getByText(String(report.score))).toBeInTheDocument();
    expect(within(sheet).getAllByText(report.findings[0].title)[0]).toBeInTheDocument();

    expect(screen.queryByRole("link", { name: monguardCopy.editInWorkspace })).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await listRuns()).toEqual([]);
  });
});
