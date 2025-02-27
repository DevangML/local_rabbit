const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

class Cache {
  constructor() {
    this.cache = new Map();
  }

  generateKey(type, params) {
    return `${type}:${JSON.stringify(params)}`;
  }

  set(type, params, data) {
    const key = this.generateKey(type, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(type, params) {
    const key = this.generateKey(type, params);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if cache has expired
    if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  clearType(type) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${type}:`)) {
        this.cache.delete(key);
      }
    }
  }

  async getOrFetch(type, params, fetchFn) {
    const cachedData = this.get(type, params);
    if (cachedData) {
      return cachedData;
    }
    
    const data = await fetchFn();
    this.set(type, params, data);
    return data;
  }
}

export const cacheInstance = new Cache();

export const CACHE_TYPES = {
  DIFF: 'diff',
  IMPACT: 'impact',
  QUALITY: 'quality',
  REVIEW: 'review'
}; 