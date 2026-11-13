import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sessionCookie } from "@/lib/server/session";

const limit = vi.hoisted(() => ({ allowed: true, retryAfterSeconds: 120 }));

vi.mock("@/lib/server/rate-limit", () => ({
  limitAiCall: vi.fn(async () => ({ ...limit })),
}));

const GOOD = [
  "// SPDX-License-Identifier: MIT",
  "pragma solidity ^0.8.24;",
  "contract Counter {",
  "    uint256 public count;",
  "    function increment() external { count += 1; }",
  "}",
].join("\n");

const BROKEN = GOOD.replace("count += 1;", "count += 1\n        revert;");

function groqReply(content: string) {
  return new Response(
    JSON.stringify({
      id: "chatcmpl-1",
      object: "chat.completion",
      created: 0,
      model: "openai/gpt-oss-120b",
      choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content } }],
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}

async function post(body: unknown, signedIn = true) {
  const cookie = signedIn
    ? sessionCookie("0x70997970C51812dc3A010C7d01b50e0d17dc79C8").split(";")[0]
    : "";
  const { POST } = await import("./route");
  return POST(
    new Request("http://localhost/api/forge/fix", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", cookie },
      body: JSON.stringify(body),
    })
  );
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv("GROQ_API_KEY", "test-key");
  vi.stubEnv("SESSION_SECRET", "a-test-secret-that-is-at-least-32-characters");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  limit.allowed = true;
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/forge/fix", () => {
  it("refuses a caller without a wallet session", async () => {
    expect((await post({ fileName: "Counter.sol", source: BROKEN }, false)).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the compiler's own errors, then compiles the suggested fix", async () => {
    fetchMock.mockResolvedValueOnce(
      groqReply(
        JSON.stringify({
          fixedSource: "```solidity\n" + GOOD + "\n```",
          changes: [{ line: 5, note: "Adds the missing `;` and removes the bare revert." }],
        })
      )
    );
    const response = await post({ fileName: "Counter.sol", source: BROKEN });
    expect(response.status).toBe(200);
    const { data } = await response.json();
    expect(data.fixedSource).toBe(GOOD);
    expect(data.changes).toEqual([
      { line: 5, note: "Adds the missing ; and removes the bare revert." },
    ]);
    expect(data.compile.status).toBe("compiled");
    const sent = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(sent.response_format.json_schema.name).toBe("forge_fix_errors");
    expect(sent.messages[1].content).toMatch(/Line 6: ParserError/);
    expect(sent.messages[1].content).toContain("6|         revert;");
  });

  it("returns the suggestion with its remaining errors when it still does not compile", async () => {
    fetchMock.mockResolvedValueOnce(
      groqReply(
        JSON.stringify({
          fixedSource: GOOD.replace("count += 1;", "undefinedName();"),
          changes: [{ line: 99, note: "Tried." }],
        })
      )
    );
    const { data } = await (await post({ fileName: "Counter.sol", source: BROKEN })).json();
    expect(data.compile.status).toBe("failed");
    expect(data.compile.errors[0].kind).toBe("DeclarationError");
    expect(data.changes[0].line).toBe(7);
  });

  it("does not call the model when the contract already compiles", async () => {
    const { data } = await (await post({ fileName: "Counter.sol", source: GOOD })).json();
    expect(data).toMatchObject({ fixedSource: GOOD, changes: [], compile: { status: "compiled" } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports no change when the model returns the same contract", async () => {
    fetchMock.mockResolvedValueOnce(
      groqReply(JSON.stringify({ fixedSource: BROKEN, changes: [{ line: 5, note: "Done." }] }))
    );
    const { data } = await (await post({ fileName: "Counter.sol", source: BROKEN })).json();
    expect(data.changes).toEqual([]);
    expect(data.compile.status).toBe("failed");
  });

  it("uses the AI limit and rejects bad input", async () => {
    expect((await post({ fileName: "../x", source: BROKEN })).status).toBe(400);
    limit.allowed = false;
    expect((await post({ fileName: "Counter.sol", source: BROKEN })).status).toBe(429);
  });
});
