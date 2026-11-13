import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HISTORY_LIMIT } from "@/lib/history";
import { createFakeRedis } from "@/lib/server/fake-redis";
import { sessionCookie } from "@/lib/server/session";

const redis = vi.hoisted(() => ({ current: null as ReturnType<typeof createFakeRedis> | null }));

vi.mock("@/lib/server/rate-limit", () => ({
  limitSyncCall: vi.fn(async () => ({ allowed: true, retryAfterSeconds: 1 })),
  redisClient: () => redis.current,
}));

const ALICE = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const BOB = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

function run(index: number) {
  return {
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    tool: "monguard",
    createdAt: 1_000 + index,
    fileName: "Bank.sol",
    contractName: `Bank${index}`,
    summary: "Score 75, 2 findings",
    source: "contract Bank {}",
    report: { score: 75, findings: [] },
  };
}

function cookieFor(address: string) {
  return sessionCookie(address as `0x${string}`).split(";")[0];
}

const noParams = { params: Promise.resolve({}) };

async function call(method: string, address: string | null, body?: unknown) {
  const route = await import("./route");
  const handler = route[method as "GET" | "POST" | "DELETE"];
  return handler(
    new Request("http://localhost/api/history", {
      method,
      headers: address ? { cookie: cookieFor(address) } : {},
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    noParams
  );
}

async function callRun(method: "GET" | "DELETE", address: string, id: string) {
  const route = await import("./[id]/route");
  return route[method](
    new Request(new URL(`/api/history/${id}`, "http://localhost"), {
      method,
      headers: { cookie: cookieFor(address) },
    }),
    { params: Promise.resolve({ id }) }
  );
}

async function list(address: string) {
  return (await (await call("GET", address)).json()).data.runs;
}

beforeEach(() => {
  redis.current = createFakeRedis();
  vi.stubEnv("SESSION_SECRET", "a-test-secret-that-is-at-least-32-characters");
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("/api/history", () => {
  it("refuses every call without a wallet session", async () => {
    for (const method of ["GET", "POST", "DELETE"]) {
      const response = await call(method, null, method === "POST" ? { runs: [run(1)] } : undefined);
      expect(response.status).toBe(401);
      expect((await response.json()).error.code).toBe("unauthorized");
    }
  });

  it("saves runs, lists them newest first without sources, and returns one in full", async () => {
    expect((await call("POST", ALICE, { runs: [run(1), run(2)] })).status).toBe(200);
    const runs = await list(ALICE);
    expect(runs.map((item: { contractName: string }) => item.contractName)).toEqual([
      "Bank2",
      "Bank1",
    ]);
    expect(runs[0]).not.toHaveProperty("source");
    const full = await (await callRun("GET", ALICE, run(1).id)).json();
    expect(full.data.run).toEqual(run(1));
  });

  it("keeps one wallet's runs away from another", async () => {
    await call("POST", ALICE, { runs: [run(1)] });
    expect(await list(BOB)).toEqual([]);
    expect((await callRun("GET", BOB, run(1).id)).status).toBe(404);
    await call("DELETE", BOB);
    expect(await list(ALICE)).toHaveLength(1);
  });

  it("rejects bad input: too many runs, oversized source, unknown tool", async () => {
    const many = Array.from({ length: 6 }, (_, index) => run(index));
    expect((await call("POST", ALICE, { runs: many })).status).toBe(400);
    const big = { ...run(1), source: "a".repeat(61 * 1024) };
    expect((await call("POST", ALICE, { runs: [big] })).status).toBe(400);
    expect((await call("POST", ALICE, { runs: [{ ...run(1), tool: "sentinel" }] })).status).toBe(
      400
    );
  });

  it(`keeps only the newest ${HISTORY_LIMIT} runs`, async () => {
    for (let index = 0; index < HISTORY_LIMIT + 3; index += 5) {
      const batch = Array.from({ length: 5 }, (_, offset) => run(index + offset));
      await call("POST", ALICE, { runs: batch });
    }
    const runs = await list(ALICE);
    expect(runs).toHaveLength(HISTORY_LIMIT);
    expect(runs.at(-1).contractName).toBe(`Bank${HISTORY_LIMIT + 5 - HISTORY_LIMIT}`);
  });

  it("deletes one run and clears the rest", async () => {
    await call("POST", ALICE, { runs: [run(1), run(2)] });
    await callRun("DELETE", ALICE, run(1).id);
    expect(await list(ALICE)).toHaveLength(1);
    expect(
      redis.current?.strings.has(`monad-studio:history:${ALICE.toLowerCase()}:run:${run(1).id}`)
    ).toBe(false);
    await call("DELETE", ALICE);
    expect(await list(ALICE)).toEqual([]);
    expect(redis.current?.strings.size).toBe(0);
  });
});
