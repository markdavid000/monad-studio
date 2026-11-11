import { layoutCopy } from "./copy";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <p className="mx-auto w-full max-w-6xl px-6 py-6 text-sm text-muted-foreground">
        {layoutCopy.footer}
      </p>
    </footer>
  );
}
