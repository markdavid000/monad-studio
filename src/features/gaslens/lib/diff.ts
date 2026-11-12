export interface DiffLine {
  kind: "same" | "add" | "remove";
  text: string;
  oldNumber?: number;
  newNumber?: number;
}

function same(a: string, b: string) {
  return a.trimEnd() === b.trimEnd();
}

export function diffLines(before: string, after: string): DiffLine[] {
  const oldLines = before.split("\n");
  const newLines = after.split("\n");

  let prefix = 0;
  while (
    prefix < oldLines.length &&
    prefix < newLines.length &&
    same(oldLines[prefix], newLines[prefix])
  ) {
    prefix += 1;
  }
  let suffix = 0;
  while (
    suffix < oldLines.length - prefix &&
    suffix < newLines.length - prefix &&
    same(oldLines[oldLines.length - 1 - suffix], newLines[newLines.length - 1 - suffix])
  ) {
    suffix += 1;
  }

  const oldMiddle = oldLines.slice(prefix, oldLines.length - suffix);
  const newMiddle = newLines.slice(prefix, newLines.length - suffix);
  const rows = oldMiddle.length;
  const columns = newMiddle.length;
  const width = columns + 1;
  const lengths = new Uint16Array((rows + 1) * width);
  for (let i = rows - 1; i >= 0; i -= 1) {
    for (let j = columns - 1; j >= 0; j -= 1) {
      lengths[i * width + j] = same(oldMiddle[i], newMiddle[j])
        ? lengths[(i + 1) * width + j + 1] + 1
        : Math.max(lengths[(i + 1) * width + j], lengths[i * width + j + 1]);
    }
  }

  const result: DiffLine[] = [];
  for (let index = 0; index < prefix; index += 1) {
    result.push({
      kind: "same",
      text: newLines[index],
      oldNumber: index + 1,
      newNumber: index + 1,
    });
  }

  let i = 0;
  let j = 0;
  while (i < rows || j < columns) {
    if (i < rows && j < columns && same(oldMiddle[i], newMiddle[j])) {
      result.push({
        kind: "same",
        text: newMiddle[j],
        oldNumber: prefix + i + 1,
        newNumber: prefix + j + 1,
      });
      i += 1;
      j += 1;
    } else if (
      i < rows &&
      (j === columns || lengths[(i + 1) * width + j] >= lengths[i * width + j + 1])
    ) {
      result.push({ kind: "remove", text: oldMiddle[i], oldNumber: prefix + i + 1 });
      i += 1;
    } else {
      result.push({ kind: "add", text: newMiddle[j], newNumber: prefix + j + 1 });
      j += 1;
    }
  }

  for (let index = 0; index < suffix; index += 1) {
    const oldIndex = oldLines.length - suffix + index;
    const newIndex = newLines.length - suffix + index;
    result.push({
      kind: "same",
      text: newLines[newIndex],
      oldNumber: oldIndex + 1,
      newNumber: newIndex + 1,
    });
  }

  return result;
}
