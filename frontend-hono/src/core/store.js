// src/core/store.js
class CoreDataStore {
    constructor() {
        this.cache = new Map();     // key -> { data, expiry, tags }
        this.inflight = new Map();  // key -> Promise
        this.listeners = new Set(); // subscriber callback set
    }

    /**
     * Berlangganan perubahan state / invalidasi cache
     * @param {Function} listener 
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /** @param {string[]} [tags] */
    notify(tags = []) {
        this.listeners.forEach((listener) => listener(tags));
    }

    /**
     * Fetch data dengan deduplikasi request & cache TTL
     * @param {string} key
     * @param {() => Promise<any>} fetcher
     * @param {{ ttl?: number, tags?: string[] }} [options]
     * @returns {Promise<any>}
     */
    async fetchWithCache(key, fetcher, { ttl = 60000, tags = [] } = {}) {
        const now = Date.now();
        const cached = this.cache.get(key);

        // 1. Kembalikan data cache jika masih berlaku
        if (cached && cached.expiry > now) {
            return cached.data;
        }

        // 2. Request Deduplication: gabungkan request yang sedang berjalan dengan key sama
        if (this.inflight.has(key)) {
            return this.inflight.get(key);
        }

        // 3. Eksekusi request baru
        const promise = (async () => {
            try {
                const data = await fetcher();
                this.cache.set(key, {
                    data,
                    expiry: Date.now() + ttl,
                    tags,
                });
                return data;
            } finally {
                this.inflight.delete(key);
            }
        })();

        this.inflight.set(key, promise);
        return promise;
    }

    /**
     * Menghapus cache berdasarkan tag dan memberi tahu subscriber
     * @param {string | string[]} tags 
     */
    invalidate(tags) {
        const targetTags = Array.isArray(tags) ? tags : [tags];
        let isInvalidated = false;

        for (const [key, value] of this.cache.entries()) {
            if (value.tags.some((tag) => targetTags.includes(tag))) {
                this.cache.delete(key);
                isInvalidated = true;
            }
        }

        if (isInvalidated) {
            this.notify(targetTags);
        }
    }

    clear() {
        this.cache.clear();
        this.inflight.clear();
        this.notify(['*']);
    }
}

export const coreStore = new CoreDataStore();