import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sessionCookie } from "@/lib/server/session";

const limit = vi.hoisted(() => ({ allowed: true, retryAfterSeconds: 120 }));

vi.mock("@/lib/server/rate-limit", () => ({
  limitAiCall: vi.fn(async () => ({ ...limit })),
}));

const validReply = {
  contractName: "GasHeavy",
  summary: "Cache the owner.",
  optimizedSource: "contract A {\n  function withdraw() external {}\n}",
  optimizations: [
    {
      impact: "high",
      title: "Make owner immutable",
      description: "The owner is read from storage on every call.",
      estimatedGas: 2100,
      per: "call",
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
  return new Request("http://localhost/api/gaslens/analyze", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.7",
      cookie,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function tokenLimit(retryAfterSeconds = 3) {
  return new Response(
    JSON.stringify({
      error: {
        message: "Rate limit reached on tokens per minute (TPM)",
        code: "rate_limit_exceeded",
      },
    }),
    {
      status: 429,
      headers: { "content-type": "application/json", "retry-after": String(retryAfterSeconds) },
    }
  );
}

async function postWithTimers(body: unknown) {
  vi.useFakeTimers();
  const pending = post(body);
  await vi.runAllTimersAsync();
  return pending;
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

describe("POST /api/gaslens/analyze", () => {
  it("refuses a caller without a wallet session before reading the body", async () => {
    const response = await post({ source: "contract A {}" }, false);
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("unauthorized");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns the mapped report with the behaviour check of the rewrite", async () => {
    fetchMock.mockResolvedValueOnce(groqReply(JSON.stringify(validReply))).mockResolvedValueOnce(
      groqReply(
        JSON.stringify({
          risks: [
            { functionName: " withdraw ", description: "Anyone can call it.", lines: [2, 9] },
          ],
        })
      )
    );
    const response = await post({ source: "contract A {\n  function withdraw() {}\n}" });
    expect(response.status).toBe(200);
    const { data } = await response.json();
    expect(data).toMatchObject({ contractName: "GasHeavy" });
    expect(data.check).toEqual({
      status: "flagged",
      risks: [
        { id: "CK-01", functionName: "withdraw", description: "Anyone can call it.", lines: [2] },
      ],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const checkSent = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
    expect(checkSent.response_format.json_schema.name).toBe("gaslens_rewrite_check");
    expect(checkSent.messages[1].content).toContain("2|   function withdraw() external {}");
    expect(checkSent.messages[1].content).toContain("2|   function withdraw() {}");
    expect(data.optimizedSource).toContain("external");
    expect(data.optimizations[0]).toMatchObject({ id: "GL-01", estimatedGas: 2100, lines: [2] });

    const sent = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(sent.model).toBe("openai/gpt-oss-120b");
    expect(sent.response_format.type).toBe("json_schema");
    expect(sent.max_completion_tokens).toBe(40000);
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

  it("skips the check when the rewrite is the same contract", async () => {
    const source = "contract A {}";
    fetchMock.mockResolvedValueOnce(
      groqReply(JSON.stringify({ ...validReply, optimizedSource: source, optimizations: [] }))
    );
    const response = await post({ source });
    const { data } = await response.json();
    expect(data.check).toEqual({ status: "clear", risks: [] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("still returns the review, marked unchecked, when the check call fails", async () => {
    fetchMock
      .mockResolvedValueOnce(groqReply(JSON.stringify(validReply)))
      .mockImplementation(async () => new Response("down", { status: 503 }));
    const response = await post({ source: "contract A {\n  function withdraw() {}\n}" });
    expect(response.status).toBe(200);
    const { data } = await response.json();
    expect(data.check).toEqual({ status: "unavailable", risks: [] });
    expect(data.optimizations).toHaveLength(1);
  });

  it("waits out Groq's per-minute token limit and still checks the rewrite", async () => {
    fetchMock
      .mockResolvedValueOnce(groqReply(JSON.stringify(validReply)))
      .mockResolvedValueOnce(tokenLimit())
      .mockResolvedValueOnce(tokenLimit())
      .mockResolvedValueOnce(tokenLimit())
      .mockResolvedValueOnce(groqReply(JSON.stringify({ risks: [] })));
    const response = await postWithTimers({ source: "contract A {\n  function withdraw() {}\n}" });
    expect(response.status).toBe(200);
    const { data } = await response.json();
    expect(data.check).toEqual({ status: "clear", risks: [] });
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("waits as long as Groq asks when the token window is busy", async () => {
    fetchMock
      .mockResolvedValueOnce(groqReply(JSON.stringify(validReply)))
      .mockResolvedValueOnce(tokenLimit(17))
      .mockResolvedValueOnce(tokenLimit(10))
      .mockResolvedValueOnce(groqReply(JSON.stringify({ risks: [] })));
    const response = await postWithTimers({ source: "contract A {\n  function withdraw() {}\n}" });
    const { data } = await response.json();
    expect(data.check).toEqual({ status: "clear", risks: [] });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("marks the check unchecked once the token limit outlasts the wait", async () => {
    fetchMock
      .mockResolvedValueOnce(groqReply(JSON.stringify(validReply)))
      .mockImplementation(async () => tokenLimit());
    const response = await postWithTimers({ source: "contract A {\n  function withdraw() {}\n}" });
    expect(response.status).toBe(200);
    const { data } = await response.json();
    expect(data.check).toEqual({ status: "unavailable", risks: [] });
    expect(fetchMock.mock.calls.length).toBeLessThan(12);
  });
});
