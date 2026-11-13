import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sessionCookie } from "@/lib/server/session";

const limit = vi.hoisted(() => ({ allowed: true, retryAfterSeconds: 120 }));

vi.mock("@/lib/server/rate-limit", () => ({
  limitAiCall: vi.fn(async () => ({ ...limit })),
}));

const SOURCE = [
  "contract Bank {",
  "  function withdraw() external {",
  '    (bool ok, ) = msg.sender.call{value: balances[msg.sender]}("");',
  "    balances[msg.sender] = 0;",
  "  }",
  "}",
].join("\n");

const FIXED = [
  "contract Bank {",
  "  function withdraw() external {",
  "    uint256 amount = balances[msg.sender];",
  "    balances[msg.sender] = 0;",
  '    (bool ok, ) = msg.sender.call{value: amount}("");',
  "  }",
  "}",
].join("\n");

const findings = [
  {
    id: "MG-01",
    title: "Reentrancy in withdraw",
    fix: "Zero the balance before the call.",
    fixCode: "balances[msg.sender] = 0;",
    lines: [3],
  },
  { id: "MG-02", title: "Missing event", fix: "Emit an event.", fixCode: "", lines: [] },
];

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
    new Request("http://localhost/api/monguard/fix", {
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

describe("POST /api/monguard/fix", () => {
  it("refuses a caller without a wallet session before calling the model", async () => {
    expect((await post({ source: SOURCE, findings }, false)).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns the fixed contract with what was applied and what was skipped", async () => {
    fetchMock.mockResolvedValueOnce(
      groqReply(
        JSON.stringify({
          fixedSource: "```solidity\n" + FIXED + "\n```",
          applied: [
            { id: "MG-01", note: "Zeroes `balances` before the call." },
            { id: "MG-99", note: "Not asked for." },
          ],
          skipped: [{ id: "MG-02", reason: "No event is declared." }],
        })
      )
    );
    const response = await post({ source: SOURCE, findings });
    expect(response.status).toBe(200);
    const { data } = await response.json();
    expect(data).toEqual({
      fixedSource: FIXED,
      applied: [{ id: "MG-01", note: "Zeroes balances before the call." }],
      skipped: [{ id: "MG-02", reason: "No event is declared." }],
    });
    const sent = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(sent.response_format.json_schema.name).toBe("monguard_fix");
    expect(sent.messages[1].content).toContain("MG-01: Reentrancy in withdraw");
    expect(sent.messages[1].content).toContain("3|     (bool ok, )");
  });

  it("counts every fix as skipped when the contract comes back unchanged", async () => {
    fetchMock.mockResolvedValueOnce(
      groqReply(
        JSON.stringify({
          fixedSource: SOURCE,
          applied: [{ id: "MG-01", note: "Done." }],
          skipped: [],
        })
      )
    );
    const { data } = await (await post({ source: SOURCE, findings })).json();
    expect(data.fixedSource).toBe(SOURCE);
    expect(data.applied).toEqual([]);
    expect(data.skipped.map((item: { id: string }) => item.id)).toEqual(["MG-01", "MG-02"]);
  });

  it("rejects no findings, too many findings or an oversized contract", async () => {
    expect((await post({ source: SOURCE, findings: [] })).status).toBe(400);
    const many = Array.from({ length: 21 }, (_, index) => ({ ...findings[0], id: `MG-${index}` }));
    expect((await post({ source: SOURCE, findings: many })).status).toBe(400);
    expect((await post({ source: "a".repeat(60 * 1024 + 1), findings })).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 429 once the AI limit is reached", async () => {
    limit.allowed = false;
    expect((await post({ source: SOURCE, findings })).status).toBe(429);
  });

  it("returns 502 when the reply does not match the schema", async () => {
    fetchMock.mockResolvedValue(groqReply(JSON.stringify({ fixedSource: "x" })));
    const response = await post({ source: SOURCE, findings });
    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe("invalid_reply");
  });
});
