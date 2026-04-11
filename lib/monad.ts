import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC ||
          "https://testnet-rpc.monad.xyz",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadvision.com",
    },
  },
  testnet: true,
});

export const MONAD_CHAIN_ID = 10143;

export const MONAD_EXPLORER = "https://testnet.monadvision.com";

export function getExplorerTxUrl(hash: string): string {
  return `${MONAD_EXPLORER}/tx/${hash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${MONAD_EXPLORER}/address/${address}`;
}
