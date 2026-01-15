/**
 * Simple in-memory cache for API responses
 * Helps reduce database queries for frequently accessed data
 */

const cache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute default TTL

export function getCached(key) {
    const item = cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }

    return item.data;
}

export function setCache(key, data, ttl = CACHE_TTL) {
    cache.set(key, {
        data,
        expiry: Date.now() + ttl
    });
}

export function clearCache(pattern) {
    if (!pattern) {
        cache.clear();
        return;
    }

    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
}

export function getCacheStats() {
    return {
        size: cache.size,
        keys: Array.from(cache.keys())
    };
}
