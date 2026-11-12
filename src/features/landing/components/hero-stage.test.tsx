import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { landingCopy } from "../copy";
import { HeroStage } from "./hero-stage";

const panels = {
  review: null,
  optimise: null,
  deploy: null,
  watch: null,
  contention: null,
};

function word(container: HTMLElement) {
  return Array.from(container.querySelectorAll("[data-char]"))
    .map((node) => node.textContent)
    .join("");
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("HeroStage", () => {
  it("gives screen readers one stable heading", () => {
    render(<HeroStage aside={null} panels={panels} />);
    expect(
      screen.getByRole("heading", { level: 1, name: landingCopy.titleAccessible })
    ).toBeInTheDocument();
  });

  it("cycles the headline verb on its own timer", () => {
    vi.useFakeTimers();
    const { container } = render(<HeroStage aside={null} panels={panels} />);
    expect(word(container)).toBe(landingCopy.titleVerbs[0]);
    expect(container.querySelector("[data-char]")).not.toHaveAttribute("style");
    act(() => vi.advanceTimersByTime(2800));
    expect(word(container)).toBe(landingCopy.titleVerbs[1]);
    expect(container.querySelector("[data-char]")?.getAttribute("style")).toContain("char-in");
  });

  it("keeps the first verb when motion is reduced", () => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: true, media: query }));
    const { container } = render(<HeroStage aside={null} panels={panels} />);
    act(() => vi.advanceTimersByTime(10000));
    expect(word(container)).toBe(landingCopy.titleVerbs[0]);
  });
});
