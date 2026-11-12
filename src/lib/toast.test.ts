import { beforeEach, describe, expect, it } from "vitest";
import { toast } from "./toast";

beforeEach(() => {
  for (const item of toast.items()) toast.dismiss(item.id);
});

describe("toast", () => {
  it("turns a loading toast into a result in place", () => {
    const id = toast.loading("Scanning", { id: "run" });
    toast.success("Scan finished", { id, description: "2 findings" });
    expect(toast.items()).toEqual([
      expect.objectContaining({
        id: "run",
        kind: "success",
        title: "Scan finished",
        duration: 5000,
      }),
    ]);
  });

  it("keeps a loading toast open until it is replaced", () => {
    toast.loading("Scanning");
    expect(toast.items()[0].duration).toBe(Number.POSITIVE_INFINITY);
  });

  it("keeps the four newest toasts and dismisses by id", () => {
    const ids = ["a", "b", "c", "d", "e"].map((title) => toast.info(title));
    expect(toast.items().map((item) => item.title)).toEqual(["b", "c", "d", "e"]);
    toast.dismiss(ids[4]);
    expect(toast.items().map((item) => item.title)).toEqual(["b", "c", "d"]);
  });

  it("notifies subscribers", () => {
    let calls = 0;
    const unsubscribe = toast.subscribe(() => (calls += 1));
    toast.warning("Check skipped");
    unsubscribe();
    toast.error("Failed");
    expect(calls).toBe(1);
  });
});
