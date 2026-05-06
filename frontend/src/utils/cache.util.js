/**
 * Stale-While-Revalidate cache using localStorage.
 * Shows cached data instantly, fetches fresh data in background.
 */

const PREFIX = 'taskflow_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const cacheGet = (key) => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    // Return data even if stale — caller decides what to do with isStale
    return { data, isStale: Date.now() > expiresAt };
  } catch {
    return null;
  }
};

export const cacheSet = (key, data, ttl = DEFAULT_TTL) => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, expiresAt: Date.now() + ttl }));
  } catch {
    // localStorage full — fail silently
  }
};

export const cacheDelete = (key) => {
  localStorage.removeItem(PREFIX + key);
};

/**
 * useCachedFetch(key, fetcher, setter)
 *
 * 1. If cache exists → call setter with stale data immediately (instant render)
 * 2. Always fetch fresh data → update setter + cache
 */
export const cachedFetch = async (key, fetcher, onData) => {
  const cached = cacheGet(key);
  if (cached) {
    onData(cached.data, true); // show stale data instantly
  }
  try {
    const fresh = await fetcher();
    cacheSet(key, fresh);
    onData(fresh, false);
    return fresh;
  } catch (err) {
    if (!cached) throw err; // only throw if we have no fallback
    console.warn(`[cache] Serving stale data for "${key}" due to fetch error`);
  }
};
