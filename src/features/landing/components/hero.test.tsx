import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { landingCopy } from "../copy";
import { Hero } from "./hero";

describe("Hero", () => {
  it("says what the product does as the page heading", () => {
    render(<Hero showcase={null} />);
    expect(screen.getByRole("heading", { level: 1, name: landingCopy.title })).toBeInTheDocument();
  });

  it("links to the studio and to the tool sections", () => {
    render(<Hero showcase={null} />);
    expect(screen.getByRole("link", { name: landingCopy.cta })).toHaveAttribute("href", "/studio");
    expect(screen.getByRole("link", { name: landingCopy.secondaryCta })).toHaveAttribute(
      "href",
      "#tools"
    );
  });

  it("renders the showcase it is given", () => {
    render(<Hero showcase={<p>preview</p>} />);
    expect(screen.getByText("preview")).toBeInTheDocument();
  });
});
