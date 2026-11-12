import { useSyncExternalStore } from "react";
import { toast } from "@/lib/toast";

const NO_TOASTS: ReturnType<typeof toast.items> = [];

export function useToasts() {
  return useSyncExternalStore(toast.subscribe, toast.items, () => NO_TOASTS);
}
