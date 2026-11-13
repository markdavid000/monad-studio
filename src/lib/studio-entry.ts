export const CONNECT_PARAM = "connect";
export const NEXT_PARAM = "next";

export function safeStudioPath(path: string | null | undefined) {
  if (!path || !/^\/studio(?:[/?#]|$)/.test(path) || path.startsWith("//")) return "/studio";
  return path;
}

export function connectUrl(next: string) {
  const params = new URLSearchParams({ [CONNECT_PARAM]: "1", [NEXT_PARAM]: safeStudioPath(next) });
  return `/?${params.toString()}`;
}
