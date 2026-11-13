import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sessionCookie } from "@/lib/server/session";

const limit = vi.hoisted(() => ({ allowed: true, retryAfterSeconds: 60 }));

vi.mock("@/lib/server/rate-limit", () => ({
  limitAiCall: vi.fn(async () => ({ allowed: false, retryAfterSeconds: 1 })),
  limitCompileCall: vi.fn(async () => ({ ...limit })),
}));

const ADDRESS = "0xe5665A69afA64028837B36632636E97CA8d7C59b";
const SOURCE = "pragma solidity 0.8.28;\ncontract Token {}";
const INPUT = {
  address: ADDRESS,
  fileName: "Token.sol",
  source: SOURCE,
  contractName: "Token",
  compilerVersion: "0.8.28",
  optimizerEnabled: true,
  optimizerRuns: 1000,
  evmVersion: "cancun",
};
const LIST_URL = "https://binaries.soliditylang.org/bin/list.json";
const VERIFY_URL = "https://sourcify-api-monad.blockvision.org/v2/verify/10143/" + ADDRESS;

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function post(body: unknown, signedIn = true) {
  const { POST } = await import("./route");
  const cookie = signedIn
    ? sessionCookie("0x70997970C51812dc3A010C7d01b50e0d17dc79C8").split(";")[0]
    : "";
  return POST(
    new Request("http://localhost/api/forge/verify-source", {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify(body),
    })
  );
}

const fetchMock = vi.fn<typeof fetch>();

function sourcify() {
  fetchMock.mockImplementation(async (url) => {
    if (url === LIST_URL) {
      return reply({ releases: { "0.8.28": "soljson-v0.8.28+commit.7893614a.js" } });
    }
    return reply({ verificationId: "550e8400-e29b-41d4-a716-446655440000" }, 202);
  });
}

function sentToSourcify() {
  const call = fetchMock.mock.calls.find(([url]) => url === VERIFY_URL);
  return JSON.parse(String(call?.[1]?.body));
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("SESSION_SECRET", "a-test-secret-that-is-at-least-32-characters");
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  limit.allowed = true;
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/forge/verify-source", () => {
  it("refuses a caller without a wallet session", async () => {
    expect((await post(INPUT, false)).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resolves a short compiler version and sends the settings the contract was built with", async () => {
    sourcify();
    const response = await post(INPUT);
    expect((await response.json()).data).toEqual({
      status: "pending",
      verificationId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(sentToSourcify()).toEqual({
      stdJsonInput: {
        language: "Solidity",
        sources: { "Token.sol": { content: SOURCE } },
        settings: {
          optimizer: { enabled: true, runs: 1000 },
          evmVersion: "cancun",
          outputSelection: { "*": { "*": ["abi"] } },
        },
      },
      compilerVersion: "0.8.28+commit.7893614a",
      contractIdentifier: "Token.sol:Token",
    });
  });

  it("uses a full version as given and leaves the EVM version to the compiler by default", async () => {
    sourcify();
    await post({ ...INPUT, compilerVersion: "v0.8.38+commit.1835d247", evmVersion: "default" });
    const sent = sentToSourcify();
    expect(sent.compilerVersion).toBe("0.8.38+commit.1835d247");
    expect(sent.stdJsonInput.settings).not.toHaveProperty("evmVersion");
    expect(fetchMock.mock.calls.some(([url]) => url === LIST_URL)).toBe(false);
  });

  it("says when the version was never released, without asking Sourcify", async () => {
    sourcify();
    const { data } = await (await post({ ...INPUT, compilerVersion: "0.8.99" })).json();
    expect(data).toEqual({
      status: "failed",
      message: "Solidity 0.8.99 is not a released compiler version.",
    });
    expect(fetchMock.mock.calls.some(([url]) => url === VERIFY_URL)).toBe(false);
  });

  it("answers 502 when the release list cannot be read", async () => {
    fetchMock.mockResolvedValueOnce(new Response("down", { status: 503 }));
    const response = await post(INPUT);
    expect(response.status).toBe(502);
  });

  it("rejects bad input and uses the compile limit", async () => {
    expect((await post({ ...INPUT, compilerVersion: "latest" })).status).toBe(400);
    expect((await post({ ...INPUT, contractName: "1Token" })).status).toBe(400);
    expect((await post({ ...INPUT, evmVersion: "frontier" })).status).toBe(400);
    limit.allowed = false;
    expect((await post(INPUT)).status).toBe(429);
  });
});
