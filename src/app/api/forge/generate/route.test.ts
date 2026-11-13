import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sessionCookie } from "@/lib/server/session";

const limit = vi.hoisted(() => ({ allowed: true, retryAfterSeconds: 120 }));

vi.mock("@/lib/server/rate-limit", () => ({
  limitAiCall: vi.fn(async () => ({ ...limit })),
}));

const SOURCE = [
  "// SPDX-License-Identifier: MIT",
  "pragma solidity ^0.8.24;",
  "",
  "contract PiggyBank {",
  "    address public immutable owner = msg.sender;",
  "    receive() external payable {}",
  "}",
].join("\n");

const reply = {
  contractName: " PiggyBank ",
  summary: "Holds deposits for the owner. ",
  source: "```solidity\n" + SOURCE + "\n```",
  notes: ["Set `owner` carefully.", " "],
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

async function post(body: unknown, signedIn = true) {
  const cookie = signedIn
    ? sessionCookie("0x70997970C51812dc3A010C7d01b50e0d17dc79C8").split(";")[0]
    : "";
  const { POST } = await import("./route");
  return POST(
    new Request("http://localhost/api/forge/generate", {
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

const PROMPT = "A piggy bank that only the owner can empty";

describe("POST /api/forge/generate", () => {
  it("refuses a caller without a wallet session before calling the model", async () => {
    const response = await post({ prompt: PROMPT }, false);
    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns the written contract, cleaned and compiled", async () => {
    fetchMock.mockResolvedValueOnce(groqReply(JSON.stringify(reply)));
    const response = await post({ prompt: `  ${PROMPT}  ` });
    expect(response.status).toBe(200);
    const { data } = await response.json();
    expect(data).toMatchObject({
      contractName: "PiggyBank",
      fileName: "PiggyBank.sol",
      summary: "Holds deposits for the owner.",
      source: SOURCE,
      notes: ["Set owner carefully."],
    });
    expect(data.compile.status).toBe("compiled");
    expect(data.compile.contracts[0].name).toBe("PiggyBank");

    const sent = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(sent.response_format.json_schema.name).toBe("forge_generate");
    expect(sent.messages[1].content).toContain(PROMPT);
    expect(sent.messages[1].content).not.toContain(`  ${PROMPT}`);
  });

  it("sends compiler errors back once and returns the repaired contract", async () => {
    const broken = SOURCE.replace("{}", "{ revert; }");
    fetchMock
      .mockResolvedValueOnce(groqReply(JSON.stringify({ ...reply, source: broken })))
      .mockResolvedValueOnce(
        groqReply(JSON.stringify({ ...reply, notes: ["Fixed the revert syntax."] }))
      );
    const { data } = await (await post({ prompt: PROMPT })).json();
    expect(data.compile.status).toBe("compiled");
    expect(data.notes).toEqual(["Set owner carefully."]);
    expect(data.source).toBe(SOURCE);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const repair = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
    expect(repair.response_format.json_schema.name).toBe("forge_repair");
    expect(repair.messages[1].content).toContain("Line 6: TypeError");
    expect(repair.messages[1].content).toContain("6|     receive() external payable { revert; }");
    expect(repair.messages[1].content).toContain(PROMPT);
  });

  it("does not repair a contract that compiles", async () => {
    fetchMock.mockResolvedValueOnce(groqReply(JSON.stringify(reply)));
    await post({ prompt: PROMPT });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns the repaired contract with its errors when the repair still does not compile", async () => {
    const broken = SOURCE.replace("{}", "{ revert; }");
    const stillBroken = SOURCE.replace("{}", "{ undefinedName(); }");
    fetchMock
      .mockResolvedValueOnce(groqReply(JSON.stringify({ ...reply, source: broken })))
      .mockResolvedValueOnce(groqReply(JSON.stringify({ ...reply, source: stillBroken })));
    const { data } = await (await post({ prompt: PROMPT })).json();
    expect(data.compile.status).toBe("failed");
    expect(data.compile.errors[0]).toMatchObject({ kind: "DeclarationError", line: 6 });
  });

  it("returns the first draft with its errors when the repair call fails", async () => {
    fetchMock
      .mockResolvedValueOnce(
        groqReply(JSON.stringify({ ...reply, source: SOURCE.replace("{}", "{ revert; }") }))
      )
      .mockResolvedValueOnce(new Response("bad", { status: 400 }));
    const response = await post({ prompt: PROMPT });
    expect(response.status).toBe(200);
    const { data } = await response.json();
    expect(data.compile.status).toBe("failed");
    expect(data.compile.errors[0].line).toBe(6);
  });

  it("names the file safely whatever the model calls the contract", async () => {
    fetchMock.mockResolvedValueOnce(
      groqReply(JSON.stringify({ ...reply, contractName: "../My Token!" }))
    );
    const { data } = await (await post({ prompt: PROMPT })).json();
    expect(data.fileName).toBe("MyToken.sol");
  });

  it("rejects a description that is too short or too long", async () => {
    expect((await post({ prompt: "token" })).status).toBe(400);
    expect((await post({ prompt: "a".repeat(2001) })).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 429 once the AI limit is reached", async () => {
    limit.allowed = false;
    const response = await post({ prompt: PROMPT });
    expect(response.status).toBe(429);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 502 when the model reply does not match the schema", async () => {
    fetchMock.mockResolvedValue(groqReply(JSON.stringify({ contractName: "A" })));
    const response = await post({ prompt: PROMPT });
    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe("invalid_reply");
  });
});
