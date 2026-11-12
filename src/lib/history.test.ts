import { beforeEach, describe, expect, it, vi } from "vitest";
import { HISTORY_LIMIT, clearRuns, deleteRun, getRun, listRuns, saveRun } from "./history";

const run = {
  tool: "monguard" as const,
  fileName: "Bank.sol",
  contractName: "Bank",
  summary: "Score 75, 2 findings",
  source: "contract Bank {}",
  report: { score: 75 },
};

beforeEach(async () => {
  vi.useRealTimers();
  await clearRuns();
});

describe("history", () => {
  it("saves a run with an id and time and reads it back", async () => {
    const saved = await saveRun(run);
    expect(saved).toMatchObject(run);
    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(await getRun(saved.id)).toEqual(saved);
  });

  it("lists the newest run first", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(1_000);
    await saveRun({ ...run, contractName: "First" });
    vi.setSystemTime(2_000);
    await saveRun({ ...run, contractName: "Second" });
    expect((await listRuns()).map((item) => item.contractName)).toEqual(["Second", "First"]);
  });

  it(`keeps only the newest ${HISTORY_LIMIT} runs`, async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    for (let index = 0; index < HISTORY_LIMIT + 2; index += 1) {
      vi.setSystemTime(10_000 + index);
      await saveRun({ ...run, contractName: `C${index}` });
    }
    const runs = await listRuns();
    expect(runs).toHaveLength(HISTORY_LIMIT);
    expect(runs.at(-1)?.contractName).toBe("C2");
  });

  it("deletes one run or all of them", async () => {
    const first = await saveRun(run);
    await saveRun(run);
    await deleteRun(first.id);
    expect(await getRun(first.id)).toBeUndefined();
    expect(await listRuns()).toHaveLength(1);
    await clearRuns();
    expect(await listRuns()).toEqual([]);
  });
});
