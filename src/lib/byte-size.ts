export const SOURCE_LIMIT_BYTES = 60 * 1024;

export function byteSize(text: string) {
  return new TextEncoder().encode(text).length;
}

export function formatKilobytes(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
