import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const limit = vi.hoisted(() => ({ allowed: true, retryAfterSeconds: 120 }));

vi.mock("@/lib/server/rate-limit", () => ({
  limitAiCall: vi.fn(async () => ({ ...limit })),
}));

const validReply = {
  contractName: "VulnerableBank",
  summary: "Funds can be drained.",
  findings: [
    {
      severity: "critical",
      title: "Reentrancy in withdraw",
      description: "State is updated after the call.",
      impact: "An attacker drains the contract.",
      fix: "Update the balance before the call.",
      fixCode: "",
      lines: [2],
    },
  ],
};

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

function scanRequest(body: unknown) {
  return new Request("http://localhost/api/monguard/scan", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function post(body: unknown) {
  const { POST } = await import("./route");
  return POST(scanRequest(body));
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv("GROQ_API_KEY", "test-key");
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

describe("POST /api/monguard/scan", () => {
  it("returns the mapped report", async () => {
    fetchMock.mockResolvedValue(groqReply(JSON.stringify(validReply)));
    const response = await post({ source: "contract A {\n  function withdraw() {}\n}" });
    expect(response.status).toBe(200);
    const { data } = await response.json();
    expect(data).toMatchObject({ contractName: "VulnerableBank", score: 75 });
    expect(data.findings[0]).toMatchObject({ id: "MG-01", lines: [2] });

    const sent = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(sent.model).toBe("openai/gpt-oss-120b");
    expect(sent.response_format.type).toBe("json_schema");
    expect(sent.messages[1].content).toContain("2|   function withdraw() {}");
  });

  it("rejects a body that is not JSON with 400", async () => {
    const response = await post("not json");
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("invalid_input");
  });

  it("rejects an oversized contract with 400 before calling the model", async () => {
    const response = await post({ source: "a".repeat(60 * 1024 + 1) });
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 429 with Retry-After once the limit is reached", async () => {
    limit.allowed = false;
    const response = await post({ source: "contract A {}" });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("120");
    expect((await response.json()).error.code).toBe("rate_limited");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 502 when the model reply does not match the schema", async () => {
    fetchMock.mockResolvedValue(groqReply(JSON.stringify({ contractName: "A" })));
    const response = await post({ source: "contract A {}" });
    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe("invalid_reply");
  });

  it("returns 502 when the model reply is not JSON", async () => {
    fetchMock.mockResolvedValue(groqReply("Sure, here is the review"));
    const response = await post({ source: "contract A {}" });
    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe("invalid_reply");
  });

  it("returns 502 when Groq is unavailable", async () => {
    fetchMock.mockResolvedValue(new Response("down", { status: 503 }));
    const response = await post({ source: "contract A {}" });
    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe("upstream_unavailable");
  });
});
