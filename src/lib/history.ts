export const HISTORY_TOOLS = ["monguard", "gaslens"] as const;
export const HISTORY_LIMIT = 200;

export type HistoryTool = (typeof HISTORY_TOOLS)[number];

export interface HistoryRun {
  id: string;
  tool: HistoryTool;
  createdAt: number;
  fileName: string;
  contractName: string;
  summary: string;
  source: string;
  report: unknown;
}

export type NewHistoryRun = Omit<HistoryRun, "id" | "createdAt">;

const DB_NAME = "monad-studio";
const DB_VERSION = 1;
const STORE = "runs";
const BY_TIME = "createdAt";

let connection: Promise<IDBDatabase> | undefined;

function request<T>(req: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function done(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function open() {
  connection ??= new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore(STORE, { keyPath: "id" });
      store.createIndex(BY_TIME, BY_TIME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }).catch((error: unknown) => {
    connection = undefined;
    throw error;
  });
  return connection;
}

async function withStore<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => Promise<T>
): Promise<T> {
  const db = await open();
  const transaction = db.transaction(STORE, mode);
  const [result] = await Promise.all([work(transaction.objectStore(STORE)), done(transaction)]);
  return result;
}

export async function listRuns(): Promise<HistoryRun[]> {
  const runs = await withStore("readonly", (store) =>
    request(store.index(BY_TIME).getAll() as IDBRequest<HistoryRun[]>)
  );
  return runs.reverse();
}

export function getRun(id: string): Promise<HistoryRun | undefined> {
  return withStore("readonly", (store) =>
    request(store.get(id) as IDBRequest<HistoryRun | undefined>)
  );
}

export async function saveRun(run: NewHistoryRun): Promise<HistoryRun> {
  const saved: HistoryRun = { ...run, id: crypto.randomUUID(), createdAt: Date.now() };
  await withStore("readwrite", async (store) => {
    await request(store.put(saved));
    const keys = await request(store.index(BY_TIME).getAllKeys());
    await Promise.all(
      keys
        .slice(0, Math.max(0, keys.length - HISTORY_LIMIT))
        .map((key) => request(store.delete(key)))
    );
  });
  return saved;
}

export function deleteRun(id: string): Promise<void> {
  return withStore("readwrite", (store) => request(store.delete(id)));
}

export function clearRuns(): Promise<void> {
  return withStore("readwrite", (store) => request(store.clear()));
}
