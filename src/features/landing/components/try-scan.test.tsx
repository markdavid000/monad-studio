import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ctaCopy } from "../copy";
import { TryScan } from "./try-scan";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TryScan", () => {
  it("runs the example scan and shows its findings", () => {
    const { container } = render(<TryScan />);
    fireEvent.click(screen.getByRole("button", { name: ctaCopy.run }));
    expect(screen.getByText(new RegExp(ctaCopy.scanning))).toBeInTheDocument();
    const bar = container.querySelector("span[style*='showcase-progress']");
    expect(bar).not.toBeNull();
    if (bar) fireEvent.animationEnd(bar);
    for (const finding of ctaCopy.samples[0].findings) {
      expect(screen.getByText(finding.title)).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: ctaCopy.openReport })).toHaveAttribute(
      "href",
      "/studio"
    );
  });

  it("switches to another contract and starts over", () => {
    render(<TryScan />);
    const other = ctaCopy.samples[2];
    fireEvent.click(screen.getByRole("button", { name: other.file }));
    expect(screen.getByRole("button", { name: other.file })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByText(other.code[0])).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ctaCopy.run })).toBeInTheDocument();
  });

  it("skips the scanning bar when motion is reduced", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: true, media: query }));
    render(<TryScan />);
    fireEvent.click(screen.getByRole("button", { name: ctaCopy.run }));
    expect(screen.getByText(ctaCopy.samples[0].findings[0].title)).toBeInTheDocument();
  });
});
