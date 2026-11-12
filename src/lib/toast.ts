export type ToastKind = "loading" | "success" | "error" | "info" | "warning";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
  action?: ToastAction;
  duration: number;
}

interface ToastOptions {
  id?: string;
  description?: string;
  action?: ToastAction;
}

const DURATIONS: Record<ToastKind, number> = {
  loading: Number.POSITIVE_INFINITY,
  success: 5000,
  info: 5000,
  warning: 8000,
  error: 10000,
};
const MAX_TOASTS = 4;

let items: readonly ToastItem[] = [];
let counter = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function show(kind: ToastKind, title: string, { id, ...options }: ToastOptions = {}) {
  counter += 1;
  const item: ToastItem = {
    id: id ?? `toast-${counter}`,
    kind,
    title,
    ...options,
    duration: DURATIONS[kind],
  };
  items = items.some((existing) => existing.id === item.id)
    ? items.map((existing) => (existing.id === item.id ? item : existing))
    : [...items, item].slice(-MAX_TOASTS);
  emit();
  return item.id;
}

export const toast = {
  loading: (title: string, options?: ToastOptions) => show("loading", title, options),
  success: (title: string, options?: ToastOptions) => show("success", title, options),
  error: (title: string, options?: ToastOptions) => show("error", title, options),
  info: (title: string, options?: ToastOptions) => show("info", title, options),
  warning: (title: string, options?: ToastOptions) => show("warning", title, options),
  dismiss: (id: string) => {
    items = items.filter((item) => item.id !== id);
    emit();
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  items: () => items,
};
