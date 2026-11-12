import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import { createSiweMessage } from "viem/siwe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/rate-limit", () => ({
  limitSyncCall: vi.fn(async () => ({ allowed: true, retryAfterSeconds: 1 })),
}));

const account = privateKeyToAccount(
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
);

function cookiesFrom(response: Response) {
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

async function signIn(overrides: { chainId?: number; domain?: string; nonce?: string } = {}) {
  const nonceRoute = await import("../nonce/route");
  const nonceResponse = await nonceRoute.GET(new Request("http://localhost/api/auth/nonce"), {
    params: Promise.resolve({}),
  });
  const { nonce } = (await nonceResponse.json()).data;
  const message = createSiweMessage({
    address: account.address,
    chainId: overrides.chainId ?? monadTestnet.id,
    domain: overrides.domain ?? "localhost",
    nonce: overrides.nonce ?? nonce,
    uri: "http://localhost",
    version: "1",
  });
  const signature = await account.signMessage({ message });
  const { POST } = await import("./route");
  return POST(
    new Request("http://localhost/api/auth/session", {
      method: "POST",
      headers: { host: "localhost", cookie: cookiesFrom(nonceResponse) },
      body: JSON.stringify({ message, signature }),
    }),
    { params: Promise.resolve({}) }
  );
}

async function sessionWith(cookie: string) {
  const { GET } = await import("./route");
  const response = await GET(
    new Request("http://localhost/api/auth/session", { headers: { cookie } }),
    { params: Promise.resolve({}) }
  );
  return (await response.json()).data.address;
}

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "a-test-secret-that-is-at-least-32-characters");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("no network in tests");
    })
  );
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("wallet sign-in", () => {
  it("starts a session for a valid signature and reads it back", async () => {
    const response = await signIn();
    expect(response.status).toBe(200);
    expect((await response.json()).data.address).toBe(account.address);
    const setCookies = response.headers.getSetCookie();
    expect(
      setCookies.some((cookie) => /ms_session=.+; Path=\/; HttpOnly; SameSite=Lax/.test(cookie))
    ).toBe(true);
    expect(await sessionWith(cookiesFrom(response))).toBe(account.address);
  });

  it("rejects a message signed for another chain, domain or nonce", async () => {
    expect((await signIn({ chainId: 1 })).status).toBe(401);
    expect((await signIn({ domain: "evil.example" })).status).toBe(401);
    expect((await signIn({ nonce: "abcdefgh12345678" })).status).toBe(401);
  });

  it("rejects a sign-in without the nonce cookie", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/auth/session", {
        method: "POST",
        headers: { host: "localhost" },
        body: JSON.stringify({ message: "hello", signature: "0x00" }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(response.status).toBe(401);
  });

  it("ignores a tampered or foreign session cookie", async () => {
    const cookie = cookiesFrom(await signIn());
    const tampered = cookie.replace(
      /ms_session=[^.]+/,
      "ms_session=0x0000000000000000000000000000000000000001%7C9999999999"
    );
    expect(await sessionWith(tampered)).toBeNull();
    vi.stubEnv("SESSION_SECRET", "another-secret-that-is-at-least-32-characters");
    vi.resetModules();
    expect(await sessionWith(cookie)).toBeNull();
  });

  it("signs out by clearing the cookie", async () => {
    const { DELETE } = await import("./route");
    const response = await DELETE(new Request("http://localhost/api/auth/session"), {
      params: Promise.resolve({}),
    });
    expect(response.headers.getSetCookie()[0]).toMatch(/^ms_session=; .*Max-Age=0/);
  });
});
