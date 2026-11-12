"use client";

import { Dialog } from "radix-ui";
import { useFirstVisit } from "@/hooks/use-first-visit";
import { Button } from "./button";

interface IntroContent {
  title: string;
  body: string;
  points: readonly { title: string; body: string }[];
  done: string;
}

interface IntroDialogProps {
  screen: string;
  content: IntroContent;
}

export function IntroDialog({ screen, content }: IntroDialogProps) {
  const visit = useFirstVisit(screen);

  return (
    <Dialog.Root
      open={visit.isFirstVisit}
      onOpenChange={(open) => {
        if (!open) visit.markSeen();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-5 overflow-y-auto rounded-2xl border bg-background p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-2">
            <Dialog.Title className="text-2xl font-medium tracking-[-0.02em]">
              {content.title}
            </Dialog.Title>
            <Dialog.Description className="text-muted-foreground">
              {content.body}
            </Dialog.Description>
          </div>
          <ol className="flex flex-col gap-4">
            {content.points.map((point, index) => (
              <li key={point.title} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="font-medium">{point.title}</p>
                  <p className="text-sm text-muted-foreground">{point.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Dialog.Close asChild>
            <Button size="lg" className="self-end">
              {content.done}
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
