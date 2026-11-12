export function createFakeRedis() {
  const strings = new Map<string, unknown>();
  const hashes = new Map<string, Map<string, unknown>>();
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

  return {
    strings,
    hashes,
    async get<T>(key: string) {
      return (strings.has(key) ? clone(strings.get(key)) : null) as T | null;
    },
    async set(key: string, value: unknown) {
      strings.set(key, clone(value));
      return "OK";
    },
    async hset(key: string, values: Record<string, unknown>) {
      const hash = hashes.get(key) ?? new Map<string, unknown>();
      for (const [field, value] of Object.entries(values)) hash.set(field, clone(value));
      hashes.set(key, hash);
      return Object.keys(values).length;
    },
    async hgetall<T>(key: string) {
      const hash = hashes.get(key);
      return (hash ? clone(Object.fromEntries(hash)) : null) as T | null;
    },
    async hdel(key: string, field: string) {
      return hashes.get(key)?.delete(field) ? 1 : 0;
    },
    async del(key: string) {
      return Number(strings.delete(key) || hashes.delete(key));
    },
    async expire() {
      return 1;
    },
  };
}
