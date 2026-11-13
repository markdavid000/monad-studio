import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sessionCookie } from "@/lib/server/session";

const limit = vi.hoisted(() => ({ allowed: true, retryAfterSeconds: 60 }));

vi.mock("@/lib/server/rate-limit", () => ({
  limitAiCall: vi.fn(async () => ({ allowed: false, retryAfterSeconds: 1 })),
  limitCompileCall: vi.fn(async () => ({ ...limit })),
}));

const COUNTER = [
  "// SPDX-License-Identifier: MIT",
  "pragma solidity ^0.8.24;",
  "",
  "contract Counter {",
  "    uint256 public count;",
  "    constructor(uint256 start) { count = start; }",
  "    function increment() external { count += 1; }",
  "}",
].join("\n");

function compileRequest(body: unknown, signedIn = true) {
  const cookie = signedIn
    ? sessionCookie("0x70997970C51812dc3A010C7d01b50e0d17dc79C8").split(";")[0]
    : "";
  return new Request("http://localhost/api/forge/compile", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", cookie },
    body: JSON.stringify(body),
  });
}

async function post(body: unknown, signedIn = true) {
  const { POST } = await import("./route");
  return POST(compileRequest(body, signedIn));
}

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "a-test-secret-that-is-at-least-32-characters");
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  limit.allowed = true;
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/forge/compile", () => {
  it("refuses a caller without a wallet session", async () => {
    const response = await post({ fileName: "Counter.sol", source: COUNTER }, false);
    expect(response.status).toBe(401);
  });

  it("compiles the source as written and returns what deployment and verification need", async () => {
    const response = await post({ fileName: "Counter.sol", source: COUNTER });
    expect(response.status).toBe(200);
    const { data } = await response.json();
    expect(data.status).toBe("compiled");
    expect(data.compilerVersion).toMatch(/^0\.8\.38\+commit\.[0-9a-f]+$/);
    expect(data.warnings).toEqual([]);
    const [counter] = data.contracts;
    expect(counter.name).toBe("Counter");
    expect(counter.bytecode).toMatch(/^0x60/);
    expect(counter.deployedSize).toBeGreaterThan(0);
    expect(counter.abi).toContainEqual(
      expect.objectContaining({
        type: "constructor",
        inputs: [expect.objectContaining({ name: "start", type: "uint256" })],
      })
    );
    const input = JSON.parse(data.standardJsonInput);
    expect(input.sources["Counter.sol"].content).toBe(COUNTER);
    expect(input.settings).toMatchObject({
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "prague",
    });
    expect(input.settings.metadata).toBeUndefined();
  });

  it("returns compiler errors with their line instead of rewriting the source", async () => {
    const broken = COUNTER.replace("count += 1;", "count += 1\n        revert;");
    const response = await post({ fileName: "Counter.sol", source: broken });
    expect(response.status).toBe(200);
    const { data } = await response.json();
    expect(data.status).toBe("failed");
    expect(data.errors[0]).toMatchObject({ severity: "error", kind: "ParserError", line: 8 });
  });

  it("finds the line of an error after multi byte characters", async () => {
    const source = `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.24;\n// café ✓\ncontract A {\n    function f() external { undefinedName(); }\n}`;
    const { data } = await (await post({ fileName: "A.sol", source })).json();
    expect(data.errors[0]).toMatchObject({ kind: "DeclarationError", line: 5 });
  });

  it("lists only contracts that have bytecode", async () => {
    const source = `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.24;\ninterface IThing { function go() external; }\nabstract contract Base { function go() external virtual; }`;
    const { data } = await (await post({ fileName: "Thing.sol", source })).json();
    expect(data).toMatchObject({ status: "compiled", contracts: [] });
  });

  it("reports warnings with their line", async () => {
    const source = `pragma solidity ^0.8.24;\ncontract A {\n    function f(uint256 unused) external pure returns (uint256) { return 1; }\n}`;
    const { data } = await (await post({ fileName: "A.sol", source })).json();
    expect(data.status).toBe("compiled");
    expect(data.warnings.map((warning: { line?: number }) => warning.line)).toContain(3);
  });

  it("rejects a file name that is not a .sol file", async () => {
    const response = await post({ fileName: "../etc/passwd", source: COUNTER });
    expect(response.status).toBe(400);
  });

  it("rejects an empty or oversized source", async () => {
    expect((await post({ fileName: "A.sol", source: "  " })).status).toBe(400);
    expect((await post({ fileName: "A.sol", source: "a".repeat(60 * 1024 + 1) })).status).toBe(400);
  });

  it("uses the compile limit, not the AI limit", async () => {
    limit.allowed = false;
    const response = await post({ fileName: "Counter.sol", source: COUNTER });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
  });
});
