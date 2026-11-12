"use client";

import { Info } from "lucide-react";
import { Popover } from "radix-ui";
import type { ReactNode } from "react";
import { useHoverPopover } from "@/hooks/use-hover-popover";

interface PageTitleProps {
  title: string;
  aboutLabel: string;
  children: ReactNode;
}

export function PageTitle({ title, aboutLabel, children }: PageTitleProps) {
  const popover = useHoverPopover();

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-3xl font-medium tracking-[-0.02em]">{title}</h1>
      <Popover.Root open={popover.open} onOpenChange={popover.onOpenChange}>
        <Popover.Trigger
          aria-label={aboutLabel}
          className="rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          {...popover.hoverProps}
        >
          <Info aria-hidden className="size-5" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="start"
            sideOffset={8}
            collisionPadding={16}
            onOpenAutoFocus={(event) => event.preventDefault()}
            className="z-50 flex max-w-sm flex-col gap-2 rounded-lg border bg-popover p-4 text-sm leading-relaxed text-popover-foreground shadow-lg"
            {...popover.hoverProps}
          >
            {children}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
