interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private storage = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 min default
    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.storage.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  size(): number {
    return this.storage.size;
  }
}

export const cache = new Cache();

export const withCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  const cached = cache.get<T>(key);
  if (cached) return cached;

  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
};