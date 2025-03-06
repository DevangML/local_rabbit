const {
  describe, expect, it, jest, beforeEach,
} = require('@jest/globals');
const Cache = require('../../../src/utils/cache');

describe('Cache', () => {
  let cache;

  beforeEach(() => {
    cache = new Cache();
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should handle complex objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      cache.set('key2', obj);
      expect(cache.get('key2')).toEqual(obj);
    });

    it('should handle undefined and null values', () => {
      cache.set('key3', undefined);
      cache.set('key4', null);
      expect(cache.get('key3')).toBeUndefined();
      expect(cache.get('key4')).toBeNull();
    });
  });

  describe('expiration', () => {
    it('should expire items after ttl', async () => {
      jest.useFakeTimers();
      cache = new Cache({ ttl: 1000 }); // 1 second TTL

      cache.set('key', 'value');
      expect(cache.get('key')).toBe('value');

      jest.advanceTimersByTime(1001);
      expect(cache.get('key')).toBeNull();

      jest.useRealTimers();
    });

    it('should not expire items before ttl', () => {
      jest.useFakeTimers();
      cache = new Cache({ ttl: 1000 });

      cache.set('key', 'value');
      jest.advanceTimersByTime(999);
      expect(cache.get('key')).toBe('value');

      jest.useRealTimers();
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });

    it('should clear specific keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear(['key1']);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('has', () => {
    it('should check if key exists', () => {
      cache.set('key', 'value');
      expect(cache.has('key')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should handle expired items', () => {
      jest.useFakeTimers();
      cache = new Cache({ ttl: 1000 });

      cache.set('key', 'value');
      jest.advanceTimersByTime(1001);
      expect(cache.has('key')).toBe(false);

      jest.useRealTimers();
    });
  });

  describe('size', () => {
    it('should return correct cache size', () => {
      expect(cache.size()).toBe(0);
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });

    it('should not count expired items', () => {
      jest.useFakeTimers();
      cache = new Cache({ ttl: 1000 });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      jest.advanceTimersByTime(1001);
      expect(cache.size()).toBe(0);

      jest.useRealTimers();
    });
  });

  describe('keys', () => {
    it('should return all active keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.keys()).toEqual(['key1', 'key2']);
    });

    it('should not include expired keys', () => {
      jest.useFakeTimers();
      cache = new Cache({ ttl: 1000 });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      jest.advanceTimersByTime(1001);
      expect(cache.keys()).toEqual([]);

      jest.useRealTimers();
    });
  });
});
