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

function tab(label: string) {
  return screen.getByRole("button", { name: new RegExp(`^\\d+ ${label}$`) });
}

function panel(id: string) {
  return document.getElementById(`showcase-panel-${id}`);
}

describe("Showcase", () => {
  it("opens the first column and hides the rest from screen readers", () => {
    render(<Showcase panels={panels} />);
    expect(screen.getAllByRole("button", { expanded: false })).toHaveLength(
      showcaseTabs.length - 1
    );
    expect(tab("Review")).toHaveAttribute("aria-expanded", "true");
    expect(panel("review")).toHaveAttribute("aria-hidden", "false");
    expect(panel("deploy")).toHaveAttribute("aria-hidden", "true");
  });

  it("opens a column when the pointer moves over it", () => {
    render(<Showcase panels={panels} />);
    const column = tab("Watch").parentElement;
    expect(column).not.toBeNull();
    if (column) fireEvent.mouseEnter(column);
    expect(tab("Watch")).toHaveAttribute("aria-expanded", "true");
    expect(panel("watch")).toHaveAttribute("aria-hidden", "false");
  });

  it("opens a column when its header is clicked", () => {
    render(<Showcase panels={panels} />);
    fireEvent.click(tab("Deploy"));
    expect(tab("Deploy")).toHaveAttribute("aria-expanded", "true");
    expect(panel("review")).toHaveAttribute("aria-hidden", "true");
  });

  it("moves between columns with the arrow keys and wraps around", () => {
    render(<Showcase panels={panels} />);
    fireEvent.keyDown(screen.getByRole("group", { name: landingCopy.showcaseLabel }), {
      key: "ArrowLeft",
    });
    expect(tab("Contention")).toHaveAttribute("aria-expanded", "true");
    expect(tab("Contention")).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("group", { name: landingCopy.showcaseLabel }), {
      key: "ArrowRight",
    });
    expect(tab("Review")).toHaveAttribute("aria-expanded", "true");
  });

  it("advances when the progress line finishes", () => {
    const { container } = render(<Showcase panels={panels} />);
    const progress = container.querySelector("[aria-hidden='true'] > span[style]");
    expect(progress).not.toBeNull();
    if (progress) fireEvent.animationEnd(progress);
    expect(tab("Optimise")).toHaveAttribute("aria-expanded", "true");
  });

  it("pauses and resumes", () => {
    render(<Showcase panels={panels} />);
    fireEvent.click(screen.getByRole("button", { name: landingCopy.pause }));
    fireEvent.click(screen.getByRole("button", { name: landingCopy.play }));
    expect(screen.getByRole("button", { name: landingCopy.pause })).toBeInTheDocument();
  });
});
