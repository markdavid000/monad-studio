export const walletCopy = {
  appName: "MonadStudio",
  connect: "Connect wallet",
  switchNetwork: "Switch to Monad testnet",
  network: "Monad testnet",
  networkMenu: "Change network",
  accountMenu: "Wallet details",
} as const;

export const networkGuardCopy = {
  title: "Switch to Monad testnet",
  body: "Your wallet is on another network. MonadStudio only works on Monad testnet, so switch networks and confirm the request in your wallet to continue.",
  switch: "Switch network",
  confirming: "Confirm in your wallet",
  disconnect: "Disconnect",
  rejected: "You declined the request in your wallet. Switch again when you are ready.",
  failed:
    "Your wallet could not switch networks. Add Monad testnet in your wallet, then try again.",
} as const;
