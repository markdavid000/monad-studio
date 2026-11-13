import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionGuard } from "./session-guard";

const ALICE = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as const;
const BOB = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" as const;

const replace = vi.fn();
const account = vi.hoisted(() => ({
  status: "connected" as "connected" | "disconnected" | "reconnecting",
  address: undefined as string | undefined,
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("wagmi", () => ({ useAccount: () => ({ ...account }) }));

const fetchMock = vi.fn<typeof fetch>();

function sessionReply(address: string | null) {
  fetchMock.mockImplementation(
    async (_url, init) =>
      new Response(
        JSON.stringify({ data: { address: init?.method === "DELETE" ? null : address } }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        }
      )
  );
}

function renderGuard() {
  const client = new QueryClient();
  const view = render(
    <QueryClientProvider client={client}>
      <SessionGuard address={ALICE} />
    </QueryClientProvider>
  );
  return {
    rerender: () =>
      view.rerender(
        <QueryClientProvider client={client}>
          <SessionGuard address={ALICE} />
        </QueryClientProvider>
      ),
  };
}

function deletes() {
  return fetchMock.mock.calls.filter(([, init]) => init?.method === "DELETE").length;
}

beforeEach(() => {
  replace.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  account.status = "connected";
  account.address = ALICE;
  window.history.replaceState(null, "", "/studio/gaslens?run=1");
  window.localStorage.setItem("monad-studio:synced-wallet", ALICE);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("SessionGuard", () => {
  it("leaves a signed-in visitor with the same wallet alone", async () => {
    sessionReply(ALICE);
    renderGuard();
    await act(async () => {
      await new Promise((done) => setTimeout(done, 20));
    });
    expect(replace).not.toHaveBeenCalled();
    expect(deletes()).toBe(0);
  });

  it("signs out and sends the visitor to connect when the wallet disconnects", async () => {
    sessionReply(ALICE);
    const view = renderGuard();
    account.status = "disconnected";
    account.address = undefined;
    view.rerender();
    await vi.waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/?connect=1&next=%2Fstudio%2Fgaslens%3Frun%3D1")
    );
    expect(deletes()).toBe(1);
    expect(window.localStorage.getItem("monad-studio:synced-wallet")).toBeNull();
  });

  it("signs out when the wallet switches to another account", async () => {
    sessionReply(ALICE);
    const view = renderGuard();
    account.address = BOB;
    view.rerender();
    await vi.waitFor(() => expect(replace).toHaveBeenCalled());
    expect(deletes()).toBe(1);
  });

  it("sends the visitor away when the server session has ended", async () => {
    sessionReply(null);
    renderGuard();
    await vi.waitFor(() => expect(replace).toHaveBeenCalled());
  });

  it("gives a reconnecting wallet a moment, then signs out if none connects", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    sessionReply(ALICE);
    account.status = "disconnected";
    account.address = undefined;
    renderGuard();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(replace).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });
    vi.useRealTimers();
    await vi.waitFor(() => expect(replace).toHaveBeenCalled());
  });
});
