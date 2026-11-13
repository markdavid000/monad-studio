import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sessionCookie } from "@/lib/server/session";

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

function scanRequest(body: unknown, signedIn = true) {
  const cookie = signedIn
    ? sessionCookie("0x70997970C51812dc3A010C7d01b50e0d17dc79C8").split(";")[0]
    : "";
  return new Request("http://localhost/api/monguard/scan", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.7",
      cookie,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function post(body: unknown, signedIn = true) {
  const { POST } = await import("./route");
  return POST(scanRequest(body, signedIn));
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
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/monguard/scan", () => {
  it("refuses a caller without a wallet session before reading the body", async () => {
    const response = await post({ source: "contract A {}" }, false);
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("unauthorized");
    expect(fetchMock).not.toHaveBeenCalled();
  });

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

  it("waits out Groq's per-minute token limit before giving up", async () => {
    const tokenLimit = () =>
      new Response(JSON.stringify({ error: { message: "Rate limit reached (TPM)" } }), {
        status: 429,
        headers: { "content-type": "application/json", "retry-after": "3" },
      });
    fetchMock
      .mockResolvedValueOnce(tokenLimit())
      .mockResolvedValueOnce(tokenLimit())
      .mockResolvedValueOnce(groqReply(JSON.stringify(validReply)));
    vi.useFakeTimers();
    const pending = post({ source: "contract A {}" });
    await vi.runAllTimersAsync();
    const response = await pending;
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("returns 502 when the token limit outlasts the wait", async () => {
    fetchMock.mockImplementation(
      async () =>
        new Response(JSON.stringify({ error: { message: "Rate limit reached (TPM)" } }), {
          status: 429,
          headers: { "content-type": "application/json", "retry-after": "3" },
        })
    );
    vi.useFakeTimers();
    const pending = post({ source: "contract A {}" });
    await vi.runAllTimersAsync();
    const response = await pending;
    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe("upstream_busy");
  });
});
