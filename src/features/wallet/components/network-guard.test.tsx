import { fireEvent, render, screen } from "@testing-library/react";
import { UserRejectedRequestError } from "viem";
import { monadTestnet } from "viem/chains";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { networkGuardCopy } from "../copy";
import { NetworkGuard } from "./network-guard";

const wallet = {
  isConnected: true,
  chainId: 1 as number | undefined,
  isPending: false,
  error: null as Error | null,
  switchChain: vi.fn(),
  reset: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock("wagmi", () => ({
  useAccount: () => ({ isConnected: wallet.isConnected, chainId: wallet.chainId }),
  useSwitchChain: () => ({
    switchChain: wallet.switchChain,
    isPending: wallet.isPending,
    error: wallet.error,
    reset: wallet.reset,
  }),
  useDisconnect: () => ({ disconnect: wallet.disconnect }),
}));

beforeEach(() => {
  Object.assign(wallet, {
    isConnected: true,
    chainId: 1,
    isPending: false,
    error: null,
    switchChain: vi.fn(),
    reset: vi.fn(),
    disconnect: vi.fn(),
  });
});

describe("NetworkGuard", () => {
  it("stays closed without a connected wallet", () => {
    wallet.isConnected = false;
    render(<NetworkGuard />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("stays closed on Monad testnet", () => {
    wallet.chainId = monadTestnet.id;
    render(<NetworkGuard />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("blocks the app and asks the wallet to switch on another network", () => {
    render(<NetworkGuard />);
    expect(screen.getByRole("dialog", { name: networkGuardCopy.title })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: networkGuardCopy.switch }));
    expect(wallet.switchChain).toHaveBeenCalledWith({ chainId: monadTestnet.id });
  });

  it("cannot be dismissed with Escape", () => {
    render(<NetworkGuard />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("waits for the wallet while the switch is pending", () => {
    wallet.isPending = true;
    render(<NetworkGuard />);
    expect(screen.getByRole("button", { name: networkGuardCopy.confirming })).toBeDisabled();
  });

  it("explains a declined switch", () => {
    wallet.error = new UserRejectedRequestError(new Error("rejected"));
    render(<NetworkGuard />);
    expect(screen.getByRole("alert")).toHaveTextContent(networkGuardCopy.rejected);
  });

  it("explains a failed switch", () => {
    wallet.error = new Error("Unrecognized chain");
    render(<NetworkGuard />);
    expect(screen.getByRole("alert")).toHaveTextContent(networkGuardCopy.failed);
  });

  it("lets the user disconnect instead", () => {
    render(<NetworkGuard />);
    fireEvent.click(screen.getByRole("button", { name: networkGuardCopy.disconnect }));
    expect(wallet.disconnect).toHaveBeenCalled();
  });
});
