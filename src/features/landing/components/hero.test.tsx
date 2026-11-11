import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { landingCopy } from "../copy";
import { Hero } from "./hero";

describe("Hero", () => {
  it("says what the product does as the page heading", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1, name: landingCopy.title })).toBeInTheDocument();
  });

  it("links to the studio", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: landingCopy.cta })).toHaveAttribute("href", "/studio");
  });
});
