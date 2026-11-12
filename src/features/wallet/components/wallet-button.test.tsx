import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { walletCopy } from "../copy";
import { WalletButton } from "./wallet-button";

interface RenderState {
  mounted: boolean;
  account?: { displayName: string };
  chain?: { name?: string; unsupported?: boolean };
  openAccountModal: () => void;
  openChainModal: () => void;
  openConnectModal: () => void;
}

const state: { current: RenderState } = {
  current: {
    mounted: true,
    openAccountModal: vi.fn(),
    openChainModal: vi.fn(),
    openConnectModal: vi.fn(),
  },
};

vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: {
    Custom: ({ children }: { children: (props: RenderState) => ReactNode }) =>
      children(state.current),
  },
}));

function setState(partial: Partial<RenderState>) {
  state.current = {
    mounted: true,
    openAccountModal: vi.fn(),
    openChainModal: vi.fn(),
    openConnectModal: vi.fn(),
    ...partial,
  };
}

beforeEach(() => setState({}));

describe("WalletButton", () => {
  it("reserves its space until the wallet state is known", () => {
    setState({ mounted: false });
    const { container } = render(<WalletButton />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("asks to connect when no wallet is connected", () => {
    render(<WalletButton />);
    fireEvent.click(screen.getByRole("button", { name: walletCopy.connect }));
    expect(state.current.openConnectModal).toHaveBeenCalled();
    expect(screen.getByText(walletCopy.network)).toBeInTheDocument();
  });

  it("asks to switch when the wallet is on another network", () => {
    setState({ account: { displayName: "0x71C7…3A9f" }, chain: { unsupported: true } });
    render(<WalletButton />);
    fireEvent.click(screen.getByRole("button", { name: walletCopy.switchNetwork }));
    expect(state.current.openChainModal).toHaveBeenCalled();
  });

  it("shows the network and account once connected", () => {
    setState({ account: { displayName: "0x71C7…3A9f" }, chain: { name: "Monad Testnet" } });
    render(<WalletButton />);
    expect(screen.getByRole("button", { name: walletCopy.networkMenu })).toHaveTextContent(
      "Monad Testnet"
    );
    fireEvent.click(screen.getByRole("button", { name: walletCopy.accountMenu }));
    expect(state.current.openAccountModal).toHaveBeenCalled();
  });
});
