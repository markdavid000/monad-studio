import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  callSummary,
  forgeMocks,
  gaslensMocks,
  mockLabels,
  monguardMocks,
  paradebugMocks,
  sentinelMocks,
} from "../../copy";
import { ForgeMock } from "./forge-mock";
import { GaslensMock } from "./gaslens-mock";
import { MonguardMock } from "./monguard-mock";
import { ParadebugMock } from "./paradebug-mock";
import { SentinelMock } from "./sentinel-mock";

describe("preview cards", () => {
  it("show the raw output when Example output is pressed, and go back", () => {
    render(<ForgeMock data={forgeMocks.section} />);
    fireEvent.click(screen.getByRole("button", { name: mockLabels.showRaw }));
    expect(screen.getByText(mockLabels.rawTitle)).toBeInTheDocument();
    expect(screen.getByText(/"chainId": 10143/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: mockLabels.hideRaw }));
    expect(screen.queryByText(mockLabels.rawTitle)).not.toBeInTheDocument();
  });

  it("MonGuard opens the finding that is clicked", () => {
    const data = monguardMocks.hero;
    render(<MonguardMock data={data} />);
    expect(screen.getByText(data.findings[0].detail)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(data.findings[2].title) }));
    expect(screen.getByText(data.findings[2].detail)).toBeInTheDocument();
    expect(screen.queryByText(data.findings[0].detail)).not.toBeInTheDocument();
  });

  it("GasLens highlights the diff lines of the chosen finding", () => {
    const data = gaslensMocks.hero;
    const { container } = render(<GaslensMock data={data} />);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(data.findings[0].title) }));
    const dimmed = container.querySelectorAll(".opacity-30");
    expect(dimmed).toHaveLength(data.diff.length - data.findings[0].lines.length);
  });

  it("SentinelMon explains a call when it is clicked", () => {
    const data = sentinelMocks.section;
    render(<SentinelMock data={data} />);
    const row = data.rows[0];
    fireEvent.click(screen.getAllByRole("button", { name: new RegExp(row.method) })[0]);
    expect(
      screen.getByText(callSummary(row.method, row.from, row.ago, mockLabels.status[row.status]))
    ).toBeInTheDocument();
  });

  it("ParaDebug dims calls to other functions when one is picked", () => {
    const data = paradebugMocks.hero;
    const { container } = render(<ParadebugMock data={data} />);
    const picker = screen.getByText(mockLabels.functionsLabel).parentElement;
    expect(picker).not.toBeNull();
    if (picker) fireEvent.click(within(picker).getByRole("button", { name: /mint/ }));
    const chips = Array.from(container.querySelectorAll("span.rounded.border"));
    const dimmed = chips.filter((chip) => chip.classList.contains("opacity-25"));
    expect(dimmed.length).toBe(chips.filter((chip) => chip.textContent !== "mint").length);
  });
});
