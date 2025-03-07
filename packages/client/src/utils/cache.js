const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

class Cache {
  constructor() {
  this.cache = new Map();
  this.initializeFromLocalStorage();

  // Set up event listener for storage changes in other tabs
  if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('storage', (event) => {
  if (event.key === 'cache_cleared') {
    this.clear(false); // Clear without triggering another event
  }
  });
  }
  }

  initializeFromLocalStorage() {
  try {
  if (typeof localStorage === 'undefined') { return; }

  const persistedCache = localStorage.getItem('app_cache');
  if (persistedCache) {
  const parsed = JSON.parse(persistedCache);
  Object.entries(parsed).forEach(([key, value]) => {
    this.cache.set(key, value);
  });
  console.warn('Cache initialized from localStorage');
  }
  } catch (error) {
  console.error('Failed to initialize cache from localStorage:', error);
  try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('app_cache');
  }
  } catch {
  // Ignore errors when removing from localStorage
  }
  }
  }

  persistToLocalStorage() {
  try {
  if (typeof localStorage === 'undefined') { return; }

  const cacheObj = {};
  this.cache.forEach((value, key) => {
  (Object.hasOwn(cacheObj, key) ? (Object.hasOwn(cacheObj, key) ? cacheObj[key] : undefined) : undefined) = value;
  });
  localStorage.setItem('app_cache', JSON.stringify(cacheObj));
  } catch (error) {
  console.error('Failed to persist cache to localStorage:', error);
  }
  }

  generateKey(type, params) {
  // Sort keys to ensure consistent key generation regardless of property order
  const sortedParams = this.sortObjectKeys(params);
  return `${ type }:${ JSON.stringify(sortedParams) }`;
  }

  sortObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
  return obj;
  }

  // Create a new object with sorted keys
  return Object.keys(obj).sort().reduce((result, key) => {
  (Object.hasOwn(result, key) ? (Object.hasOwn(result, key) ? result[key] : undefined) : undefined) = this.sortObjectKeys((Object.hasOwn(obj, key) ? (Object.hasOwn(obj, key) ? obj[key] : undefined) : undefined)); // Recursively sort nested objects
  return result;
  }, {});
  }

  set(type, params, data) {
  try {
  const key = this.generateKey(type, params);
  this.cache.set(key, {
  data,
  timestamp: Date.now()
  });
  this.persistToLocalStorage();
  } catch (error) {
  console.error('Error setting cache:', error);
  }
  }

  get(type, params) {
  try {
  const key = this.generateKey(type, params);
  const cached = this.cache.get(key);

  if (!cached) { return null; }

  // Check if cache has expired
  if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
  this.cache.delete(key);
  this.persistToLocalStorage();
  return null;
  }

  return cached.data;
  } catch (error) {
  console.error('Error getting from cache:', error);
  return null;
  }
  }

  clear(triggerEvent = true) {
  this.cache.clear();

  try {
  if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('app_cache');

  if (triggerEvent) {
    // Notify other tabs that cache was cleared
    localStorage.setItem('cache_cleared', Date.now().toString());
  }
  }
  } catch (error) {
  console.error('Error clearing cache from localStorage:', error);
  }

  console.warn('Cache cleared');
  }

  clearType(type) {
  let deleted = false;
  for (const key of this.cache.keys()) {
  if (key.startsWith(`${ type }:`)) {
  this.cache.delete(key);
  deleted = true;
  }
  }

  if (deleted) {
  this.persistToLocalStorage();
  }
  }

  async getOrFetch(type, params, fetchFn) {
  try {
  const cachedData = this.get(type, params);
  if (cachedData) {
  console.warn(`Cache hit for ${ type }`);
  return cachedData;
  }

  console.warn(`Cache miss for ${ type }, fetching data...`);
  const data = await fetchFn();
  this.set(type, params, data);
  return data;
  } catch (error) {
  console.error(`Error in getOrFetch for ${ type }:`, error);
  throw error;
  }
  }
}

export const cacheInstance = new Cache();

export const CACHE_TYPES = {
  DIFF: 'diff',
  IMPACT: 'impact',
  QUALITY: 'quality',
  REVIEW: 'review'
};

export { Cache }; 