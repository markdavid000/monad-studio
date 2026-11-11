import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { landingCopy, showcaseTabs } from "../copy";
import { HeroStage } from "./hero-stage";

const panels = {
  review: <p>review panel</p>,
  optimise: <p>optimise panel</p>,
  deploy: <p>deploy panel</p>,
  watch: <p>watch panel</p>,
  contention: <p>contention panel</p>,
};

function renderStage() {
  return render(<HeroStage aside={<p>aside</p>} panels={panels} />);
}

function tabNamed(label: string) {
  return screen.getByRole("tab", { name: new RegExp(label) });
}

function panelFor(id: string) {
  return document.getElementById(`showcase-panel-${id}`);
}

function visibleWord(container: HTMLElement) {
  return Array.from(container.querySelectorAll("[data-char]"))
    .map((node) => node.textContent)
    .join("");
}

describe("HeroStage", () => {
  it("gives screen readers one stable heading", () => {
    renderStage();
    expect(
      screen.getByRole("heading", { level: 1, name: landingCopy.titleAccessible })
    ).toBeInTheDocument();
  });

  it("starts on the first tool without animating the headline", () => {
    const { container } = renderStage();
    expect(tabNamed("Review")).toHaveAttribute("aria-selected", "true");
    expect(visibleWord(container)).toBe(showcaseTabs[0].verb);
    expect(container.querySelector("[data-char]")).not.toHaveAttribute("style");
    expect(panelFor("review")).toHaveAttribute("aria-hidden", "false");
    expect(panelFor("deploy")).toHaveAttribute("aria-hidden", "true");
  });

  it("switches panel and headline word when a tab is clicked", () => {
    const { container } = renderStage();
    fireEvent.click(tabNamed("Deploy"));
    expect(tabNamed("Deploy")).toHaveAttribute("aria-selected", "true");
    expect(panelFor("deploy")).toHaveAttribute("aria-hidden", "false");
    expect(panelFor("review")).toHaveAttribute("aria-hidden", "true");
    expect(visibleWord(container)).toBe("Deploy");
    expect(container.querySelector("[data-char]")?.getAttribute("style")).toContain("char-in");
  });

  it("opens a panel from its preview", () => {
    renderStage();
    fireEvent.click(screen.getByRole("button", { name: `${landingCopy.showPreview} Watch` }));
    expect(tabNamed("Watch")).toHaveAttribute("aria-selected", "true");
  });

  it("moves between tabs with the arrow keys and wraps around", () => {
    renderStage();
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowLeft" });
    expect(tabNamed("Contention")).toHaveAttribute("aria-selected", "true");
    expect(tabNamed("Contention")).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(tabNamed("Review")).toHaveAttribute("aria-selected", "true");
  });

  it("advances when the progress bar finishes", () => {
    const { container } = renderStage();
    const progress = container.querySelector('[role="tab"][aria-selected="true"] span span');
    expect(progress).not.toBeNull();
    if (progress) fireEvent.animationEnd(progress);
    expect(tabNamed("Optimise")).toHaveAttribute("aria-selected", "true");
  });

  it("pauses and resumes", () => {
    renderStage();
    fireEvent.click(screen.getByRole("button", { name: landingCopy.pause }));
    fireEvent.click(screen.getByRole("button", { name: landingCopy.play }));
    expect(screen.getByRole("button", { name: landingCopy.pause })).toBeInTheDocument();
  });
});
