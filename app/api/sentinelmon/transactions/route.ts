import { NextRequest, NextResponse } from "next/server";

const MONAD_RPC =
  process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC || "https://testnet-rpc.monad.xyz";

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(MONAD_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

function hexToNumber(hex: string): number {
  return parseInt(hex, 16);
}

export async function POST(req: NextRequest) {
  try {
    const { contractAddress, fromBlock } = await req.json();

    if (!contractAddress) {
      return NextResponse.json(
        { error: "contractAddress required" },
        { status: 400 }
      );
    }

    const address = contractAddress.toLowerCase();

    // Get latest block
    const latestHex: string = await rpc("eth_blockNumber", []);
    const latestBlock = hexToNumber(latestHex);

    // Default: last 200 blocks on first load, otherwise from last seen block
    const startBlock = fromBlock
      ? fromBlock + 1
      : Math.max(0, latestBlock - 200);

    if (startBlock > latestBlock) {
      return NextResponse.json({ transactions: [], latestBlock });
    }

    const startHex = "0x" + startBlock.toString(16);
    const endHex = "0x" + latestBlock.toString(16);

    // Use eth_getLogs to get ALL events emitted by this contract
    // This is how block explorers work — much faster than scanning blocks
    const logs = await rpc("eth_getLogs", [
      {
        address: contractAddress,
        fromBlock: startHex,
        toBlock: endHex,
      },
    ]).catch(() => []);

    // Also get transactions where `to` = contract using a broader block scan
    // but only scan a small window to keep it fast
    const scanStart = Math.max(startBlock, latestBlock - 30);
    const transactions: Record<string, unknown>[] = [];
    const seenHashes = new Set<string>();

    // Collect unique tx hashes from logs first
    const logTxHashes: string[] = [];
    for (const log of logs as Array<{
      transactionHash: string;
      blockNumber: string;
    }>) {
      if (!seenHashes.has(log.transactionHash)) {
        seenHashes.add(log.transactionHash);
        logTxHashes.push(log.transactionHash);
      }
    }

    // Fetch tx details for log transactions (batch, max 20)
    const txsToFetch = logTxHashes.slice(0, 20);
    await Promise.allSettled(
      txsToFetch.map(async (hash) => {
        try {
          const [tx, receipt] = await Promise.all([
            rpc("eth_getTransactionByHash", [hash]),
            rpc("eth_getTransactionReceipt", [hash]),
          ]);

          if (!tx) return;

          const blockNum = hexToNumber(tx.blockNumber || "0x0");
          let timestamp = Date.now();

          try {
            const block = await rpc("eth_getBlockByNumber", [
              tx.blockNumber,
              false,
            ]);
            if (block?.timestamp)
              timestamp = hexToNumber(block.timestamp) * 1000;
          } catch {
            /* use current time */
          }

          const to = (tx.to || "").toLowerCase();
          const from = (tx.from || "").toLowerCase();

          transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value ? (parseInt(tx.value, 16) / 1e18).toFixed(6) : "0",
            gasUsed: receipt ? hexToNumber(receipt.gasUsed || "0x0") : 0,
            status: receipt
              ? receipt.status === "0x1"
                ? "success"
                : "failed"
              : "unknown",
            blockNumber: blockNum,
            timestamp,
            input: tx.input || "0x",
            direction: to === address ? "in" : from === address ? "out" : "in",
          });
        } catch {
          /* skip failed tx fetches */
        }
      })
    );

    // Also scan recent blocks for direct transactions to the contract
    // (catches plain ETH transfers which don't emit logs)
    for (let blockNum = scanStart; blockNum <= latestBlock; blockNum++) {
      try {
        const blockHex = "0x" + blockNum.toString(16);
        const block = await rpc("eth_getBlockByNumber", [blockHex, true]);
        if (!block?.transactions) continue;

        const timestamp = hexToNumber(block.timestamp || "0x0") * 1000;

        for (const tx of block.transactions as Array<{
          hash: string;
          from: string;
          to: string | null;
          value: string;
          input: string;
          blockNumber: string;
        }>) {
          if (seenHashes.has(tx.hash)) continue;

          const to = (tx.to || "").toLowerCase();
          const from = (tx.from || "").toLowerCase();

          if (to !== address && from !== address) continue;

          seenHashes.add(tx.hash);

          let status = "unknown";
          let gasUsed = 0;
          try {
            const receipt = await rpc("eth_getTransactionReceipt", [tx.hash]);
            if (receipt) {
              status = receipt.status === "0x1" ? "success" : "failed";
              gasUsed = hexToNumber(receipt.gasUsed || "0x0");
            }
          } catch {
            /* skip */
          }

          transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value ? (parseInt(tx.value, 16) / 1e18).toFixed(6) : "0",
            gasUsed,
            status,
            blockNumber: blockNum,
            timestamp,
            input: tx.input || "0x",
            direction: to === address ? "in" : "out",
          });
        }
      } catch {
        continue;
      }
    }

    // Sort newest first
    transactions.sort(
      (a, b) => (b.blockNumber as number) - (a.blockNumber as number)
    );

    return NextResponse.json({
      transactions: transactions.slice(0, 50),
      latestBlock,
    });
  } catch (error) {
    console.error("SentinelMon transactions error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch transactions",
      },
      { status: 500 }
    );
  }
}
