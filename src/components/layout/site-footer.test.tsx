import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteLinks } from "@/config/site";
import { layoutCopy } from "./copy";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("links only to places that exist", () => {
    render(<SiteFooter />);
    const nav = screen.getByRole("navigation", { name: layoutCopy.footerLinksLabel });
    expect(nav.querySelectorAll("a")).toHaveLength(2);
    expect(screen.getByRole("link", { name: layoutCopy.github })).toHaveAttribute(
      "href",
      siteLinks.github
    );
  });

  it("says the reviews are AI suggestions, not an audit", () => {
    render(<SiteFooter />);
    expect(screen.getByText(layoutCopy.footerNote)).toBeInTheDocument();
    expect(screen.getByText(layoutCopy.copyright)).toBeInTheDocument();
  });
});
