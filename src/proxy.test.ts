import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sessionCookie } from "./lib/server/session";
import { config, proxy } from "./proxy";

const ALICE = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

function request(path: string, cookie = "") {
  return new NextRequest(new URL(path, "http://localhost:3000"), { headers: { cookie } });
}

function signedIn() {
  return sessionCookie(ALICE).split(";")[0];
}

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "a-test-secret-that-is-at-least-32-characters");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("proxy", () => {
  it("covers every studio page and studio API", () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining([
        "/studio",
        "/studio/:path*",
        "/api/monguard/:path*",
        "/api/gaslens/:path*",
        "/api/forge/:path*",
        "/api/history",
        "/api/history/:path*",
      ])
    );
  });

  it("leaves the demo public", () => {
    expect(config.matcher.some((pattern) => pattern.startsWith("/demo"))).toBe(false);
  });

  it("sends a visitor without a session to connect, remembering where they were going", () => {
    const response = proxy(request("/studio/gaslens?run=abc"));
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/");
    expect(location.searchParams.get("connect")).toBe("1");
    expect(location.searchParams.get("next")).toBe("/studio/gaslens?run=abc");
  });

  it("answers API calls without a session with 401", async () => {
    const response = proxy(request("/api/monguard/scan"));
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("unauthorized");
  });

  it("lets a valid session through", () => {
    const response = proxy(request("/studio", signedIn()));
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("rejects a forged or expired session", () => {
    const forged = signedIn().replace(/%7C\d+/, "%7C9999999999");
    expect(proxy(request("/studio", forged)).status).toBe(307);
    const cookie = signedIn();
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 8 * 24 * 60 * 60 * 1000);
    expect(proxy(request("/studio", cookie)).status).toBe(307);
  });
});
