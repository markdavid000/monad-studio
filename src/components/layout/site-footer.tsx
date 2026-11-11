import { layoutCopy } from "./copy";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <p className="page-container py-6 text-sm text-muted-foreground">{layoutCopy.footer}</p>
    </footer>
  );
}
