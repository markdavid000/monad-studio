import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { landingCopy } from "../copy";
import { ToolsSection } from "./tools-section";

describe("ToolsSection", () => {
  it("renders the tool list under its heading", () => {
    render(
      <ToolsSection>
        <ul aria-label="tools" />
      </ToolsSection>
    );
    expect(screen.getByRole("heading", { name: landingCopy.toolsHeading })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "tools" })).toBeInTheDocument();
  });

  it("says the reviews are AI suggestions, not an audit", () => {
    render(<ToolsSection>{null}</ToolsSection>);
    expect(screen.getByText(landingCopy.honesty)).toBeInTheDocument();
  });
});
