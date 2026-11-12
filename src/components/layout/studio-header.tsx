import { ChevronRight } from "lucide-react";
import { WalletButton } from "@/features/wallet";
import { BrandLink } from "./brand-link";
import { layoutCopy } from "./copy";
import { ThemeToggle } from "./theme-toggle";

export function StudioHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <BrandLink />
        <ChevronRight aria-hidden className="size-4 text-muted-foreground/50" />
        <span className="text-sm text-muted-foreground">{layoutCopy.studio}</span>
        <div className="ml-auto flex items-center gap-2">
          <WalletButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
