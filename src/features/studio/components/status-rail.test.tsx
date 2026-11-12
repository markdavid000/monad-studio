import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { studioCopy } from "../copy";
import { StatusRail } from "./status-rail";

const wagmiState = {
  block: { data: undefined as bigint | undefined, isError: false },
  account: { address: undefined as string | undefined, isConnected: false },
};

vi.mock("wagmi", () => ({
  useAccount: () => wagmiState.account,
  useBlockNumber: () => wagmiState.block,
}));

beforeEach(() => {
  wagmiState.block = { data: undefined, isError: false };
  wagmiState.account = { address: undefined, isConnected: false };
});

describe("StatusRail", () => {
  it("shows the latest block once the chain answers", () => {
    wagmiState.block = { data: 4812331n, isError: false };
    render(<StatusRail />);
    expect(screen.getByText("4,812,331")).toBeInTheDocument();
    expect(screen.getByText(studioCopy.network.live)).toBeInTheDocument();
  });

  it("says it is reading the chain while waiting", () => {
    render(<StatusRail />);
    expect(screen.getByText(studioCopy.network.loading)).toBeInTheDocument();
  });

  it("says when the RPC cannot be reached", () => {
    wagmiState.block = { data: undefined, isError: true };
    render(<StatusRail />);
    expect(screen.getByText(studioCopy.network.error)).toBeInTheDocument();
  });

  it("explains the wallet is only needed to deploy, and shows the address once connected", () => {
    const { rerender } = render(<StatusRail />);
    expect(screen.getByText(studioCopy.wallet.note)).toBeInTheDocument();
    wagmiState.account = {
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      isConnected: true,
    };
    rerender(<StatusRail />);
    expect(screen.getByText("0x71C7...976F")).toBeInTheDocument();
  });
});
