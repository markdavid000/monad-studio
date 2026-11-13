import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sessionCookie } from "@/lib/server/session";

const limit = vi.hoisted(() => ({ allowed: true, retryAfterSeconds: 60 }));

vi.mock("@/lib/server/rate-limit", () => ({
  limitAiCall: vi.fn(async () => ({ allowed: false, retryAfterSeconds: 1 })),
  limitCompileCall: vi.fn(async () => ({ ...limit })),
  limitSyncCall: vi.fn(async () => ({ ...limit })),
}));

const ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const JOB = "550e8400-e29b-41d4-a716-446655440000";
const INPUT = {
  address: ADDRESS,
  creationTxHash: `0x${"ab".repeat(32)}`,
  standardJsonInput: JSON.stringify({ language: "Solidity", sources: {}, settings: {} }),
  compilerVersion: "0.8.38+commit.1835d247",
  contractIdentifier: "Counter.sol:Counter",
};

function cookie(signedIn: boolean) {
  return signedIn ? sessionCookie("0x70997970C51812dc3A010C7d01b50e0d17dc79C8").split(";")[0] : "";
}

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function submit(body: unknown, signedIn = true) {
  const { POST } = await import("./route");
  return POST(
    new Request("http://localhost/api/forge/verify", {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookie(signedIn) },
      body: JSON.stringify(body),
    })
  );
}

async function job(id: string, signedIn = true) {
  const { GET } = await import("./[id]/route");
  return GET(
    new Request("http://localhost/api/forge/verify/" + id, {
      headers: { cookie: cookie(signedIn) },
    }),
    {
      params: Promise.resolve({ id }),
    }
  );
}

async function lookup(address: string) {
  const { GET } = await import("../contract/[address]/route");
  return GET(
    new Request("http://localhost/api/forge/contract/" + address, {
      headers: { cookie: cookie(true) },
    }),
    {
      params: Promise.resolve({ address }),
    }
  );
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "a-test-secret-that-is-at-least-32-characters");
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

describe("POST /api/forge/verify", () => {
  it("refuses a caller without a wallet session", async () => {
    expect((await submit(INPUT, false)).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits the exact compiler input to Monad's Sourcify and returns the job", async () => {
    fetchMock.mockResolvedValueOnce(reply({ verificationId: JOB }, 202));
    const response = await submit(INPUT);
    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual({ status: "pending", verificationId: JOB });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://sourcify-api-monad.blockvision.org/v2/verify/10143/" + ADDRESS);
    expect(JSON.parse(String(init?.body))).toEqual({
      stdJsonInput: { language: "Solidity", sources: {}, settings: {} },
      compilerVersion: INPUT.compilerVersion,
      contractIdentifier: INPUT.contractIdentifier,
      creationTransactionHash: INPUT.creationTxHash,
    });
  });

  it("reports an already verified contract as verified", async () => {
    fetchMock
      .mockResolvedValueOnce(reply({ customCode: "already_verified", message: "Already" }, 409))
      .mockResolvedValueOnce(reply({ match: "exact_match", chainId: "10143", address: ADDRESS }));
    expect((await (await submit(INPUT)).json()).data).toEqual({
      status: "verified",
      match: "exact_match",
    });
  });

  it("passes Sourcify's reason through when it rejects the request", async () => {
    fetchMock.mockResolvedValueOnce(
      reply({ customCode: "unsupported_chain", message: "Chain 10143 is not supported" }, 400)
    );
    expect((await (await submit(INPUT)).json()).data).toEqual({
      status: "failed",
      message: "Chain 10143 is not supported",
    });
  });

  it("answers 502 when Sourcify is down or rate limited", async () => {
    fetchMock.mockResolvedValueOnce(reply({ message: "down" }, 503));
    expect((await (await submit(INPUT)).json()).error.code).toBe("upstream_unavailable");
    fetchMock.mockResolvedValueOnce(reply({ message: "slow down" }, 429));
    expect((await (await submit(INPUT)).json()).error.code).toBe("upstream_busy");
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    expect((await submit(INPUT)).status).toBe(502);
  });

  it("rejects bad input and uses the compile limit", async () => {
    expect((await submit({ ...INPUT, address: "0x12" })).status).toBe(400);
    expect((await submit({ ...INPUT, contractIdentifier: "../x:Y" })).status).toBe(400);
    limit.allowed = false;
    expect((await submit(INPUT)).status).toBe(429);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/forge/verify/[id]", () => {
  it("is pending until Sourcify completes the job", async () => {
    fetchMock.mockResolvedValueOnce(reply({ isJobCompleted: false, verificationId: JOB }));
    expect((await (await job(JOB)).json()).data).toEqual({
      status: "pending",
      verificationId: JOB,
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://sourcify-api-monad.blockvision.org/v2/verify/" + JOB
    );
  });

  it("is verified only when the job reports a match", async () => {
    fetchMock.mockResolvedValueOnce(
      reply({ isJobCompleted: true, verificationId: JOB, contract: { match: "match" } })
    );
    expect((await (await job(JOB)).json()).data).toEqual({ status: "verified", match: "match" });
  });

  it("fails with Sourcify's message when the bytecode does not match", async () => {
    fetchMock.mockResolvedValueOnce(
      reply({
        isJobCompleted: true,
        verificationId: JOB,
        contract: { match: null },
        error: {
          customCode: "no_match",
          message: "The onchain and recompiled bytecodes don't match.",
        },
      })
    );
    expect((await (await job(JOB)).json()).data).toEqual({
      status: "failed",
      message: "The onchain and recompiled bytecodes don't match.",
    });
  });

  it("rejects an id that is not a uuid and needs a session", async () => {
    expect((await job("nope")).status).toBe(400);
    expect((await job(JOB, false)).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/forge/contract/[address]", () => {
  it("says verified or unverified from Sourcify's lookup", async () => {
    fetchMock.mockResolvedValueOnce(reply({ match: "exact_match" }));
    expect((await (await lookup(ADDRESS)).json()).data).toEqual({
      status: "verified",
      match: "exact_match",
    });
    fetchMock.mockResolvedValueOnce(reply({ message: "not found" }, 404));
    expect((await (await lookup(ADDRESS)).json()).data).toEqual({ status: "unverified" });
    expect((await lookup("0x1")).status).toBe(400);
  });
});
