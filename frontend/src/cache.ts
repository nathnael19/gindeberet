const CACHE_PREFIX = 'gindeberet:admin-cache:';

export type CacheEntry<T> = {
  value: T;
  savedAt: number;
};

const buildKey = (key: string) => `${CACHE_PREFIX}${key}`;

const isStorageAvailable = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const createCacheKey = (namespace: string, params?: Record<string, unknown>) => {
  if (!params || Object.keys(params).length === 0) {
    return namespace;
  }

  const sortedParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('&');

  return sortedParams ? `${namespace}?${sortedParams}` : namespace;
};

export const readCache = <T,>(key: string): CacheEntry<T> | null => {
  if (!isStorageAvailable()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(buildKey(key));
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as CacheEntry<T>;
  } catch {
    return null;
  }
};

export const writeCache = <T,>(key: string, value: T) => {
  if (!isStorageAvailable()) {
    return;
  }

  const entry: CacheEntry<T> = {
    value,
    savedAt: Date.now(),
  };

  window.localStorage.setItem(buildKey(key), JSON.stringify(entry));
};

export const invalidateCache = (key: string) => {
  if (!isStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(buildKey(key));
};

export const invalidateCachePrefix = (prefix: string) => {
  if (!isStorageAvailable()) {
    return;
  }

  const namespacedPrefix = buildKey(prefix);
  const keysToRemove: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const storageKey = window.localStorage.key(index);
    if (storageKey && storageKey.startsWith(namespacedPrefix)) {
      keysToRemove.push(storageKey);
    }
  }

  keysToRemove.forEach((storageKey) => window.localStorage.removeItem(storageKey));
};

export const loadFromCacheWithBackgroundRefresh = async <T,>({
  key,
  fetcher,
  onUpdate,
}: {
  key: string;
  fetcher: () => Promise<T>;
  onUpdate?: (value: T) => void;
}): Promise<T> => {
  const cachedEntry = readCache<T>(key);

  if (cachedEntry) {
    void fetcher()
      .then((freshValue) => {
        writeCache(key, freshValue);
        onUpdate?.(freshValue);
      })
      .catch((error) => {
        console.error(`Background refresh failed for ${key}:`, error);
      });

    return cachedEntry.value;
  }

  const freshValue = await fetcher();
  writeCache(key, freshValue);
  return freshValue;
};
