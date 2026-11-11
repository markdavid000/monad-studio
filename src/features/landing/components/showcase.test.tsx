import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { landingCopy, showcaseTabs } from "../copy";
import { Showcase } from "./showcase";

const panels = {
  review: <p>review panel</p>,
  optimise: <p>optimise panel</p>,
  deploy: <p>deploy panel</p>,
  watch: <p>watch panel</p>,
  contention: <p>contention panel</p>,
};

function tabNamed(label: string) {
  return screen.getByRole("tab", { name: new RegExp(label) });
}

describe("Showcase", () => {
  it("shows the first panel and selects its tab", () => {
    render(<Showcase panels={panels} />);
    expect(screen.getAllByRole("tab")).toHaveLength(showcaseTabs.length);
    expect(tabNamed("Review")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("review panel")).toBeVisible();
    expect(screen.getByText("deploy panel")).not.toBeVisible();
  });

  it("switches panel when a tab is clicked", () => {
    render(<Showcase panels={panels} />);
    fireEvent.click(tabNamed("Deploy"));
    expect(tabNamed("Deploy")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("deploy panel")).toBeVisible();
    expect(screen.getByText("review panel")).not.toBeVisible();
  });

  it("moves between tabs with the arrow keys and wraps around", () => {
    render(<Showcase panels={panels} />);
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowLeft" });
    expect(tabNamed("Contention")).toHaveAttribute("aria-selected", "true");
    expect(tabNamed("Contention")).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(tabNamed("Review")).toHaveAttribute("aria-selected", "true");
  });

  it("advances to the next tab when the progress bar finishes", () => {
    const { container } = render(<Showcase panels={panels} />);
    const progress = container.querySelector('[role="tab"][aria-selected="true"] span span');
    expect(progress).not.toBeNull();
    if (progress) fireEvent.animationEnd(progress);
    expect(tabNamed("Optimise")).toHaveAttribute("aria-selected", "true");
  });

  it("pauses and resumes", () => {
    render(<Showcase panels={panels} />);
    fireEvent.click(screen.getByRole("button", { name: landingCopy.pause }));
    expect(screen.getByRole("button", { name: landingCopy.play })).toBeInTheDocument();
  });
});
