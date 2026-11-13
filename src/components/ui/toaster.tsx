"use client";

import {
  CircleAlert,
  CircleCheck,
  Info,
  LoaderCircle,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { Toast } from "radix-ui";
import { useToasts } from "@/hooks/use-toasts";
import { toast, type ToastKind } from "@/lib/toast";
import { cn } from "@/lib/utils";

const KINDS: Record<ToastKind, { icon: LucideIcon; tone: string }> = {
  loading: { icon: LoaderCircle, tone: "text-eyebrow" },
  success: { icon: CircleCheck, tone: "text-success" },
  error: { icon: CircleAlert, tone: "text-severity-critical" },
  info: { icon: Info, tone: "text-severity-low" },
  warning: { icon: TriangleAlert, tone: "text-severity-medium" },
};

interface ToasterProps {
  closeLabel: string;
  regionLabel: string;
}

export function Toaster({ closeLabel, regionLabel }: ToasterProps) {
  const items = useToasts();

  return (
    <Toast.Provider swipeDirection="right" label={regionLabel}>
      {items.map((item) => {
        const { icon: Icon, tone } = KINDS[item.kind];
        return (
          <Toast.Root
            key={item.id}
            data-kind={item.kind}
            type={item.kind === "error" ? "foreground" : "background"}
            duration={item.duration}
            onOpenChange={(open) => {
              if (!open) toast.dismiss(item.id);
            }}
            className="toast pointer-events-auto! flex w-full items-start gap-3 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg"
          >
            <Icon
              aria-hidden
              className={cn(
                "mt-0.5 size-5 shrink-0",
                tone,
                item.kind === "loading" && "animate-spin"
              )}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Toast.Title className="text-sm font-medium">{item.title}</Toast.Title>
              {item.description ? (
                <Toast.Description className="text-sm text-muted-foreground">
                  {item.description}
                </Toast.Description>
              ) : null}
              {item.action ? (
                <Toast.Action
                  altText={item.action.label}
                  onClick={item.action.onClick}
                  className="mt-1 self-start rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
                >
                  {item.action.label}
                </Toast.Action>
              ) : null}
            </div>
            <Toast.Close
              aria-label={closeLabel}
              className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X aria-hidden className="size-4" />
            </Toast.Close>
          </Toast.Root>
        );
      })}
      <Toast.Viewport
        data-toast-viewport
        className="pointer-events-none fixed right-0 bottom-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 outline-none [body:has([data-next-step])_&]:bottom-44 lg:[body:has([data-next-step])_&]:bottom-20"
      />
    </Toast.Provider>
  );
}
