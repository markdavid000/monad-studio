import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { tools } from "@/config/tools";
import { checksCopy, flowCopy, landingCopy, sectionCopy } from "../copy";
import { LandingPage } from "./landing-page";

describe("LandingPage", () => {
  it("has one section per tool with its points", () => {
    render(<LandingPage />);
    for (const section of Object.values(sectionCopy)) {
      expect(screen.getByRole("heading", { level: 2, name: section.title })).toBeInTheDocument();
      for (const point of section.points) {
        expect(screen.getByRole("heading", { level: 3, name: point.title })).toBeInTheDocument();
      }
    }
  });

  it("links to a tool only once its route exists", () => {
    render(<LandingPage />);
    for (const tool of tools) {
      const link = screen.queryByRole("link", { name: `${landingCopy.openTool} ${tool.name}` });
      if (tool.href) {
        expect(link).toHaveAttribute("href", tool.href);
      } else {
        expect(link).toBeNull();
      }
    }
  });

  it("explains why checking matters with a labelled diagram", () => {
    render(<LandingPage />);
    expect(screen.getByRole("heading", { level: 2, name: flowCopy.title })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: `${flowCopy.sources}, ${flowCopy.hub}, ${flowCopy.target}` })
    ).toBeInTheDocument();
  });

  it("lists every check once for screen readers", () => {
    render(<LandingPage />);
    const list = screen.getByRole("region", { name: checksCopy.label });
    for (const item of checksCopy.items) {
      expect(
        Array.from(list.querySelectorAll("li:not([aria-hidden='true'])")).filter(
          (node) => node.textContent === item
        )
      ).toHaveLength(1);
    }
  });

  it("labels the previews as example output", () => {
    render(<LandingPage />);
    expect(screen.getAllByText(landingCopy.exampleData).length).toBeGreaterThan(0);
  });
});
