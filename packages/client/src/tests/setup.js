// Vitest setup file
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom';

// Extend Vitest's expect method with jest-dom matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index) => Object.keys(store)[index] || null),
    length: vi.fn(() => Object.keys(store).length),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }
}

window.IntersectionObserver = IntersectionObserver;

// Mock ResizeObserver
class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }
}

window.ResizeObserver = ResizeObserver;

// Define IndexedDB related classes
class IDBRequest {
  constructor() {
    this.result = null;
    this.error = null;
    this.source = null;
    this.transaction = null;
    this.readyState = 'pending';
    this._listeners = {
      success: [],
      error: [],
      upgradeneeded: []
    };
  }

  addEventListener(type, callback) {
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(callback);
  }

  removeEventListener(type, callback) {
    if (this._listeners[type]) {
      this._listeners[type] = this._listeners[type].filter(cb => cb !== callback);
    }
  }

  _triggerSuccess() {
    this.readyState = 'done';
    const event = { target: this };

    // Call onsuccess handler if defined
    if (typeof this.onsuccess === 'function') {
      this.onsuccess(event);
    }

    // Call all success event listeners
    if (this._listeners.success) {
      this._listeners.success.forEach(callback => callback(event));
    }
  }

  _triggerError(error) {
    this.readyState = 'done';
    this.error = error || new Error('IndexedDB error');
    const event = { target: this };

    // Call onerror handler if defined
    if (typeof this.onerror === 'function') {
      this.onerror(event);
    }

    // Call all error event listeners
    if (this._listeners.error) {
      this._listeners.error.forEach(callback => callback(event));
    }
  }

  _triggerUpgradeNeeded(oldVersion, newVersion, transaction) {
    const event = {
      target: this,
      oldVersion: oldVersion || 0,
      newVersion: newVersion || 1,
      transaction: transaction
    };

    // Make sure the transaction has a reference to the db for objectStoreNames
    if (transaction && this.result) {
      transaction.db = this.result;
    }

    // Call onupgradeneeded handler if defined
    if (typeof this.onupgradeneeded === 'function') {
      this.onupgradeneeded(event);
    }

    // Call all upgradeneeded event listeners
    if (this._listeners.upgradeneeded) {
      this._listeners.upgradeneeded.forEach(callback => callback(event));
    }
  }
}

class IDBOpenDBRequest extends IDBRequest {
  constructor() {
    super();
    this.onblocked = null;
    this.onupgradeneeded = null;
    this._listeners.blocked = [];
  }

  _triggerBlocked() {
    const event = { target: this };

    // Call onblocked handler if defined
    if (typeof this.onblocked === 'function') {
      this.onblocked(event);
    }

    // Call all blocked event listeners
    if (this._listeners.blocked) {
      this._listeners.blocked.forEach(callback => callback(event));
    }
  }
}

class IDBTransaction {
  constructor(db, storeNames, mode) {
    this.db = db;
    this.objectStoreNames = Array.isArray(storeNames) ? storeNames : (storeNames ? [storeNames] : []);
    this.mode = mode || 'readonly';
    this.error = null;
    this.oncomplete = null;
    this.onerror = null;
    this.onabort = null;
    this._listeners = {
      complete: [],
      error: [],
      abort: []
    };
  }

  objectStore(name) {
    if (!this.objectStoreNames.includes(name)) {
      throw new Error(`Object store ${name} not found in transaction`);
    }
    return new IDBObjectStore(name, this);
  }

  abort() {
    this._triggerAbort();
  }

  addEventListener(type, callback) {
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(callback);
  }

  removeEventListener(type, callback) {
    if (this._listeners[type]) {
      this._listeners[type] = this._listeners[type].filter(cb => cb !== callback);
    }
  }

  _triggerComplete() {
    const event = { target: this };

    // Call oncomplete handler if defined
    if (typeof this.oncomplete === 'function') {
      this.oncomplete(event);
    }

    // Call all complete event listeners
    if (this._listeners.complete) {
      this._listeners.complete.forEach(callback => callback(event));
    }
  }

  _triggerError(error) {
    this.error = error || new Error('Transaction error');
    const event = { target: this };

    // Call onerror handler if defined
    if (typeof this.onerror === 'function') {
      this.onerror(event);
    }

    // Call all error event listeners
    if (this._listeners.error) {
      this._listeners.error.forEach(callback => callback(event));
    }
  }

  _triggerAbort() {
    const event = { target: this };

    // Call onabort handler if defined
    if (typeof this.onabort === 'function') {
      this.onabort(event);
    }

    // Call all abort event listeners
    if (this._listeners.abort) {
      this._listeners.abort.forEach(callback => callback(event));
    }
  }
}

class IDBObjectStore {
  constructor(name, transaction) {
    this.name = name;
    this.transaction = transaction;
    this.keyPath = 'id';
    this.autoIncrement = true;
    this.indexNames = [];
    this._data = {};
  }

  put(value, key) {
    const request = new IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    setTimeout(() => {
      try {
        const keyToUse = key || (value[this.keyPath] !== undefined ? value[this.keyPath] : Date.now());
        this._data[keyToUse] = value;
        request.result = keyToUse;
        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  }

  add(value, key) {
    const request = new IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    setTimeout(() => {
      try {
        const keyToUse = key || (value[this.keyPath] !== undefined ? value[this.keyPath] : Date.now());
        if (this._data[keyToUse] !== undefined) {
          throw new Error('Key already exists in the object store');
        }
        this._data[keyToUse] = value;
        request.result = keyToUse;
        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  }

  get(key) {
    const request = new IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    setTimeout(() => {
      try {
        request.result = this._data[key] || null;
        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  }

  getAll(query, count) {
    const request = new IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    setTimeout(() => {
      try {
        if (!query) {
          request.result = Object.values(this._data).slice(0, count || undefined);
        } else if (query instanceof IDBKeyRange) {
          const results = [];
          for (const key in this._data) {
            if (query.includes(key)) {
              results.push(this._data[key]);
              if (count && results.length >= count) {break;}
            }
          }
          request.result = results;
        } else {
          request.result = this._data[query] ? [this._data[query]] : [];
        }
        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  }

  getAllKeys(query, count) {
    const request = new IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    setTimeout(() => {
      try {
        if (!query) {
          request.result = Object.keys(this._data).slice(0, count || undefined);
        } else if (query instanceof IDBKeyRange) {
          const results = [];
          for (const key in this._data) {
            if (query.includes(key)) {
              results.push(key);
              if (count && results.length >= count) {break;}
            }
          }
          request.result = results;
        } else {
          request.result = this._data[query] ? [query] : [];
        }
        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  }

  delete(key) {
    const request = new IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    setTimeout(() => {
      try {
        delete this._data[key];
        request.result = undefined;
        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  }

  clear() {
    const request = new IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    setTimeout(() => {
      try {
        this._data = {};
        request.result = undefined;
        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  }

  createIndex(indexName, keyPath, options = {}) {
    this.indexNames.push(indexName);
    return new IDBIndex(indexName, this, keyPath, options);
  }

  index(name) {
    if (!this.indexNames.includes(name)) {
      throw new Error(`Index ${name} not found on ${this.name}`);
    }
    return new IDBIndex(name, this);
  }

  openCursor(range, direction) {
    const request = new IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    setTimeout(() => {
      try {
        let keys = Object.keys(this._data);

        if (range instanceof IDBKeyRange) {
          keys = keys.filter(key => range.includes(key));
        } else if (range !== null && range !== undefined) {
          keys = keys.filter(key => key === range);
        }

        if (direction === 'prev' || direction === 'prevunique') {
          keys.reverse();
        }

        if (keys.length > 0) {
          const cursor = new IDBCursor(this, keys, 0, direction, range);
          request.result = cursor;
        } else {
          request.result = null;
        }

        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  }
}

class IDBIndex {
  constructor(name, objectStore, keyPath, options = {}) {
    this.name = name;
    this.objectStore = objectStore;
    this.keyPath = keyPath;
    this.multiEntry = options.multiEntry || false;
    this.unique = options.unique || false;
  }

  get(key) {
    const request = new IDBRequest();
    request.source = this;
    request.transaction = this.objectStore.transaction;

    setTimeout(() => {
      try {
        const values = Object.values(this.objectStore._data);
        const result = values.find(value => {
          const indexValue = this._getValueByKeyPath(value, this.keyPath);
          return indexValue === key;
        });

        request.result = result || null;
        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  }

  getAll(query, count) {
    const request = new IDBRequest();
    request.source = this;
    request.transaction = this.objectStore.transaction;

    setTimeout(() => {
      try {
        const values = Object.values(this.objectStore._data);
        let results = values;

        if (query !== undefined && query !== null) {
          results = values.filter(value => {
            const indexValue = this._getValueByKeyPath(value, this.keyPath);
            if (query instanceof IDBKeyRange) {
              return query.includes(indexValue);
            }
            return indexValue === query;
          });
        }

        if (count !== undefined) {
          results = results.slice(0, count);
        }

        request.result = results;
        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  }

  getAllKeys(query, count) {
    const request = new IDBRequest();
    request.source = this;
    request.transaction = this.objectStore.transaction;

    setTimeout(() => {
      try {
        const entries = Object.entries(this.objectStore._data);
        let results = [];

        if (query !== undefined && query !== null) {
          for (const [key, value] of entries) {
            const indexValue = this._getValueByKeyPath(value, this.keyPath);
            if (query instanceof IDBKeyRange) {
              if (query.includes(indexValue)) {
                results.push(key);
              }
            } else if (indexValue === query) {
              results.push(key);
            }
          }
        } else {
          results = entries.map(([key]) => key);
        }

        if (count !== undefined) {
          results = results.slice(0, count);
        }

        request.result = results;
        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  }

  openCursor(range, direction) {
    // Similar implementation to objectStore.openCursor but filtering by index
    const request = new IDBRequest();
    request.source = this;
    request.transaction = this.objectStore.transaction;

    setTimeout(() => {
      try {
        const entries = Object.entries(this.objectStore._data);
        let filteredEntries = entries;

        if (range !== undefined && range !== null) {
          filteredEntries = entries.filter(([, value]) => {
            const indexValue = this._getValueByKeyPath(value, this.keyPath);
            if (range instanceof IDBKeyRange) {
              return range.includes(indexValue);
            }
            return indexValue === range;
          });
        }

        const keys = filteredEntries.map(([key]) => key);

        if (direction === 'prev' || direction === 'prevunique') {
          keys.reverse();
        }

        if (keys.length > 0) {
          const cursor = new IDBCursor(this.objectStore, keys, 0, direction, range, this);
          request.result = cursor;
        } else {
          request.result = null;
        }

        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  }

  _getValueByKeyPath(obj, keyPath) {
    if (typeof keyPath === 'string') {
      const parts = keyPath.split('.');
      let value = obj;
      for (const part of parts) {
        if (value === undefined || value === null) {return undefined;}
        value = value[part];
      }
      return value;
    } else if (Array.isArray(keyPath)) {
      return keyPath.map(path => this._getValueByKeyPath(obj, path));
    }
    return undefined;
  }
}

class IDBCursor {
  constructor(source, keys, index, direction, range, indexSource) {
    this.source = source;
    this._index = index;
    this._keys = keys;
    this._direction = direction;
    this._range = range;
    this._indexSource = indexSource;
    this.key = keys[index];
    this.primaryKey = keys[index];
    this.direction = direction || 'next';
    this.request = null;
  }

  get value() {
    return this.source._data[this.primaryKey];
  }

  continue(key) {
    const request = new IDBRequest();
    request.source = this.source;

    setTimeout(() => {
      try {
        let nextIndex = this._index + 1;

        if (key !== undefined) {
          nextIndex = this._keys.findIndex(k => k === key);
          if (nextIndex === -1) {
            nextIndex = this._keys.length;
          }
        }

        if (nextIndex < this._keys.length) {
          this._index = nextIndex;
          this.key = this._keys[nextIndex];
          this.primaryKey = this._keys[nextIndex];
          request.result = this;
        } else {
          request.result = null;
        }

        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  }

  advance(count) {
    const request = new IDBRequest();
    request.source = this.source;

    setTimeout(() => {
      try {
        const nextIndex = this._index + count;

        if (nextIndex < this._keys.length) {
          this._index = nextIndex;
          this.key = this._keys[nextIndex];
          this.primaryKey = this._keys[nextIndex];
          request.result = this;
        } else {
          request.result = null;
        }

        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  }

  update(value) {
    return this.source.put(value, this.primaryKey);
  }

  delete() {
    return this.source.delete(this.primaryKey);
  }
}

class IDBKeyRange {
  constructor(lower, upper, lowerOpen, upperOpen) {
    this.lower = lower;
    this.upper = upper;
    this.lowerOpen = lowerOpen || false;
    this.upperOpen = upperOpen || false;
  }

  includes(key) {
    let lowerValid = true;
    let upperValid = true;

    if (this.lower !== undefined) {
      lowerValid = this.lowerOpen ? key > this.lower : key >= this.lower;
    }

    if (this.upper !== undefined) {
      upperValid = this.upperOpen ? key < this.upper : key <= this.upper;
    }

    return lowerValid && upperValid;
  }

  static only(value) {
    return new IDBKeyRange(value, value, false, false);
  }

  static lowerBound(lower, open) {
    return new IDBKeyRange(lower, undefined, open || false, true);
  }

  static upperBound(upper, open) {
    return new IDBKeyRange(undefined, upper, true, open || false);
  }

  static bound(lower, upper, lowerOpen, upperOpen) {
    return new IDBKeyRange(lower, upper, lowerOpen || false, upperOpen || false);
  }
}

class IDBDatabase {
  constructor(name, version) {
    this.name = name;
    this.version = version;
    // Create a custom object with array functionality plus contains method
    const storeNames = [];
    this.objectStoreNames = Object.assign(storeNames, {
      contains: (name) => storeNames.includes(name)
    });
    this._stores = {};
    this.onclose = null;
    this.onerror = null;
    this.onversionchange = null;
    this._listeners = {
      close: [],
      error: [],
      versionchange: []
    };
  }

  createObjectStore(name, options = {}) {
    if (!this.objectStoreNames.contains(name)) {
      this.objectStoreNames.push(name);
    }

    const store = new IDBObjectStore(name);
    store.keyPath = options.keyPath || 'id';
    store.autoIncrement = options.autoIncrement || false;

    this._stores[name] = store;
    return store;
  }

  deleteObjectStore(name) {
    this.objectStoreNames = this.objectStoreNames.filter(storeName => storeName !== name);
    delete this._stores[name];
  }

  transaction(storeNames, mode) {
    return new IDBTransaction(this, storeNames, mode);
  }

  close() {
    this._triggerClose();
  }

  addEventListener(type, callback) {
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(callback);
  }

  removeEventListener(type, callback) {
    if (this._listeners[type]) {
      this._listeners[type] = this._listeners[type].filter(cb => cb !== callback);
    }
  }

  _triggerClose() {
    const event = { target: this };

    // Call onclose handler if defined
    if (typeof this.onclose === 'function') {
      this.onclose(event);
    }

    // Call all close event listeners
    if (this._listeners.close) {
      this._listeners.close.forEach(callback => callback(event));
    }
  }

  _triggerError(error) {
    const event = { target: this, error };

    // Call onerror handler if defined
    if (typeof this.onerror === 'function') {
      this.onerror(event);
    }

    // Call all error event listeners
    if (this._listeners.error) {
      this._listeners.error.forEach(callback => callback(event));
    }
  }

  _triggerVersionChange(oldVersion, newVersion) {
    const event = { target: this, oldVersion, newVersion };

    // Call onversionchange handler if defined
    if (typeof this.onversionchange === 'function') {
      this.onversionchange(event);
    }

    // Call all versionchange event listeners
    if (this._listeners.versionchange) {
      this._listeners.versionchange.forEach(callback => callback(event));
    }
  }
}

class IDBVersionChangeEvent extends Event {
  constructor(type, options = {}) {
    super(type);
    this.oldVersion = options.oldVersion || 0;
    this.newVersion = options.newVersion || null;
  }
}

// Mock indexedDB
const indexedDBMock = {
  _databases: {},

  open(name, version) {
    const request = new IDBOpenDBRequest();

    setTimeout(() => {
      try {
        // Check if database exists
        let db = this._databases[name];
        const isNewDB = !db;

        if (isNewDB) {
          // Create new database
          db = new IDBDatabase(name, version || 1);
          this._databases[name] = db;

          // Set the result first so it's available in the upgrade event
          request.result = db;

          // Trigger upgradeneeded event
          const transaction = new IDBTransaction(db, [], 'versionchange');
          request._triggerUpgradeNeeded(0, version || 1, transaction);
        } else if (version && version > db.version) {
          // Upgrade database
          const oldVersion = db.version;
          db.version = version;

          // Set the result first so it's available in the upgrade event
          request.result = db;

          // Trigger upgradeneeded event
          const transaction = new IDBTransaction(db, db.objectStoreNames, 'versionchange');
          request._triggerUpgradeNeeded(oldVersion, version, transaction);
        } else {
          // No upgrade needed, just set the result
          request.result = db;
        }

        // Trigger success
        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  },

  deleteDatabase(name) {
    const request = new IDBOpenDBRequest();

    setTimeout(() => {
      try {
        delete this._databases[name];
        request.result = undefined;
        request._triggerSuccess();
      } catch (error) {
        request._triggerError(error);
      }
    }, 0);

    return request;
  },

  cmp(a, b) {
    if (a === b) {return 0;}
    return a < b ? -1 : 1;
  }
};

// Register all IndexedDB related classes as globals
global.indexedDB = indexedDBMock;
global.IDBRequest = IDBRequest;
global.IDBOpenDBRequest = IDBOpenDBRequest;
global.IDBTransaction = IDBTransaction;
global.IDBObjectStore = IDBObjectStore;
global.IDBIndex = IDBIndex;
global.IDBCursor = IDBCursor;
global.IDBKeyRange = IDBKeyRange;
global.IDBDatabase = IDBDatabase;
global.IDBVersionChangeEvent = IDBVersionChangeEvent;

// Add form role to form elements for accessibility testing
const originalCreateElement = document.createElement;
document.createElement = function (tagName, options) {
  const element = originalCreateElement.call(document, tagName, options);
  if (tagName.toLowerCase() === 'form') {
    element.setAttribute('role', 'form');
  }
  return element;
};
vi.spyOn(console, 'debug').mockImplementation(() => { }); 