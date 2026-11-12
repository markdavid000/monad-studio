export function stripCodeFences(code: string) {
  return code
    .trim()
    .replace(/^```[\w-]*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

export function numberLines(source: string) {
  return source
    .split("\n")
    .map((line, index) => `${index + 1}| ${line}`)
    .join("\n");
}
