import "server-only";
import type { Address } from "viem";
import { z } from "zod";
import { HISTORY_LIMIT, type HistoryRun } from "@/lib/history";
import { historyMetaSchema, historyRunSchema, type HistoryMeta } from "@/lib/history-schema";
import { redisClient } from "./rate-limit";

const TTL_SECONDS = 180 * 24 * 60 * 60;

function metaKey(address: Address) {
  return `monad-studio:history:${address.toLowerCase()}:meta`;
}

function runKey(address: Address, id: string) {
  return `monad-studio:history:${address.toLowerCase()}:run:${id}`;
}

function toMeta({ id, tool, createdAt, fileName, contractName, summary }: HistoryRun): HistoryMeta {
  return { id, tool, createdAt, fileName, contractName, summary };
}

export async function listRemoteRuns(address: Address): Promise<HistoryMeta[]> {
  const stored = await redisClient().hgetall<Record<string, unknown>>(metaKey(address));
  const metas = z.array(historyMetaSchema).safeParse(Object.values(stored ?? {}));
  if (!metas.success) {
    console.error("Stored history metadata is malformed", metas.error);
    return [];
  }
  return metas.data.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getRemoteRun(address: Address, id: string): Promise<HistoryRun | null> {
  const stored = await redisClient().get<unknown>(runKey(address, id));
  if (stored === null) return null;
  const run = historyRunSchema.safeParse(stored);
  if (!run.success) {
    console.error("A stored history run is malformed", run.error);
    return null;
  }
  return run.data;
}

export async function deleteRemoteRun(address: Address, id: string) {
  const redis = redisClient();
  await Promise.all([redis.hdel(metaKey(address), id), redis.del(runKey(address, id))]);
}

export async function saveRemoteRuns(address: Address, runs: readonly HistoryRun[]) {
  const redis = redisClient();
  for (const run of runs) {
    await redis.set(runKey(address, run.id), run, { ex: TTL_SECONDS });
    await redis.hset(metaKey(address), { [run.id]: toMeta(run) });
  }
  await redis.expire(metaKey(address), TTL_SECONDS);
  const metas = await listRemoteRuns(address);
  await Promise.all(metas.slice(HISTORY_LIMIT).map((meta) => deleteRemoteRun(address, meta.id)));
}

export async function clearRemoteRuns(address: Address) {
  const metas = await listRemoteRuns(address);
  const redis = redisClient();
  await Promise.all(metas.map((meta) => redis.del(runKey(address, meta.id))));
  await redis.del(metaKey(address));
}
