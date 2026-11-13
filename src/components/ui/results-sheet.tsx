"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import type { ReactNode } from "react";

interface ResultsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  closeLabel: string;
  footer?: ReactNode;
  children: ReactNode;
}

function isInToasts(target: EventTarget | null) {
  return target instanceof Element && target.closest("[data-toast-viewport]") !== null;
}

export function ResultsSheet(props: ResultsSheetProps) {
  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content
          {...(props.description ? {} : { "aria-describedby": undefined })}
          onPointerDownOutside={(event) => {
            if (isInToasts(event.target)) event.preventDefault();
          }}
          className="sheet fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l bg-background shadow-2xl outline-none lg:w-[calc(100vw-3rem)]"
        >
          <div className="flex items-center justify-between gap-4 border-b px-5 py-3 sm:px-8">
            <div className="flex min-w-0 flex-col">
              <Dialog.Title className="truncate text-lg font-medium">{props.title}</Dialog.Title>
              {props.description ? (
                <Dialog.Description className="truncate text-sm text-muted-foreground">
                  {props.description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close
              aria-label={props.closeLabel}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X aria-hidden className="size-5" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">{props.children}</div>
          {props.footer}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
