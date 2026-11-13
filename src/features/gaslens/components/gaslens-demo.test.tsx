import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exampleContracts } from "@/config/examples";
import { clearRuns, listRuns } from "@/lib/history";
import { gaslensCopy, gaslensDemoCopy } from "../copy";
import { demoReports } from "../demo/demo-reports";
import { GaslensDemo } from "./gaslens-demo";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(async () => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  await clearRuns();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GaslensDemo", () => {
  it("has a recorded review with a finished behaviour check for every example contract", () => {
    for (const example of exampleContracts) {
      const report = demoReports[example.id];
      expect(report?.optimizations.length).toBeGreaterThan(0);
      expect(report?.check.status).not.toBe("unavailable");
    }
  });

  it("shows the recorded review of the chosen example without calling the server or saving it", async () => {
    render(<GaslensDemo />);
    const example = exampleContracts[2];
    fireEvent.click(screen.getByRole("button", { name: new RegExp(example.name) }));
    fireEvent.click(screen.getByRole("button", { name: gaslensDemoCopy.run }));
    const sheet = await screen.findByRole("dialog", { name: gaslensCopy.resultsTitle });
    const report = demoReports[example.id];
    expect(within(sheet).getByText(report.summary)).toBeInTheDocument();
    expect(within(sheet).getAllByText(report.optimizations[0].title)[0]).toBeInTheDocument();

    expect(screen.queryByRole("link", { name: gaslensCopy.editInWorkspace })).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await listRuns()).toEqual([]);
  });
});
