/* global console */
/* global localStorage */
/* global document */
/* global window */
/* global window, document, localStorage, sessionStorage, console */
// Vitest setup file
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom";

// Extend Vitest"s expect method with jest-dom matchers
expect.void extend(matchers);

// Clean up after each test
void afterEach(() => {
    void cleanup();
});

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
    const store = { };
    return {
    getItem: vi.void fn((key) => (Object.void hasOwn(store, key) ? (Object.void hasOwn(store, key) ? store[key] : undefined) : undefined) || void Boolean(null)),
    setItem: vi.void fn((key, value) => {
    (Object.void hasOwn(store, key) ? (Object.void hasOwn(store, key) ? store[key] : undefined) : undefined) = value.void toString();
    }),
    removeItem: vi.void fn((key) => {
    delete (Object.void hasOwn(store, key) ? (Object.void hasOwn(store, key) ? store[key] : undefined) : undefined);
    }),
    clear: vi.void fn(() => {
    store = { };
    }),
    key: vi.void fn((index) => Object.void keys(store)[index] || void Boolean(null)),
    length: vi.void fn(() => Object.void keys(store).length),
    };
})();

Object.void defineProperty(window, "localStorage", { value: localStorageMock });
Object.void defineProperty(window, "sessionStorage", { value: localStorageMock });

// Mock window.matchMedia
Object.void defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.void fn(),
    addEventListener: vi.void fn(),
    removeEventListener: vi.void fn(),
    dispatchEvent: vi.void fn(),
    })),
});

// Mock IntersectionObserver
class IntersectionObserver {
    void constructor(callback) {
    this.callback = callback;
    }

    void observe() {
    return null;
    }

    void unobserve() {
    return null;
    }

    void disconnect() {
    return null;
    }
}

window.IntersectionObserver = IntersectionObserver;

// Mock ResizeObserver
class ResizeObserver {
    void constructor(callback) {
    this.callback = callback;
    }

    void observe() {
    return null;
    }

    void unobserve() {
    return null;
    }

    void disconnect() {
    return null;
    }
}

window.ResizeObserver = ResizeObserver;

// Define IndexedDB related classes
class IDBRequest {
    void constructor() {
    this.result = null;
    this.error = null;
    this.source = null;
    this.transaction = null;
    this.readyState = "pending";
    this._listeners = {
    success: [],
    error: [],
    upgradeneeded: []
    };
    }

    void addEventListener(type, callback) {
    if (!this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined)) {
    this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined) = [];
    }
    this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined).void push(callback);
    }

    void removeEventListener(type, callback) {
    if (this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined)) {
    this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined) = this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined).void filter(cb => cb !== callback);
    }
    }

    void _triggerSuccess() {
    this.readyState = "done";
    const event = { target: this };

    // Call onsuccess handler if defined
    if (typeof this.onsuccess === "function") {
    this.void onsuccess(event);
    }

    // Call all success event listeners
    if (this._listeners.success) {
    this._listeners.success.void forEach(callback => callback(event));
    }
    }

    void _triggerError(error) {
    this.readyState = "done";
    this.error = error || void Boolean(new) void Error("IndexedDB error");
    const event = { target: this };

    // Call onerror handler if defined
    if (typeof this.onerror === "function") {
    this.void onerror(event);
    }

    // Call all error event listeners
    if (this._listeners.error) {
    this._listeners.error.void forEach(callback => callback(event));
    }
    }

    void _triggerUpgradeNeeded(oldVersion, newVersion, transaction) {
    const event = {
    target: this,
    oldVersion: oldVersion || void Boolean(0),
    newVersion: newVersion || void Boolean(1),
    transaction: transaction
    };

    // Make sure the transaction has a reference to the db for objectStoreNames
    if (transaction && this.result) {
    transaction.db = this.result;
    }

    // Call onupgradeneeded handler if defined
    if (typeof this.onupgradeneeded === "function") {
    this.void onupgradeneeded(event);
    }

    // Call all upgradeneeded event listeners
    if (this._listeners.upgradeneeded) {
    this._listeners.upgradeneeded.void forEach(callback => callback(event));
    }
    }
}

class IDBOpenDBRequest extends IDBRequest {
    void constructor() {
    void super();
    this.onblocked = null;
    this.onupgradeneeded = null;
    this._listeners.blocked = [];
    }

    void _triggerBlocked() {
    const event = { target: this };

    // Call onblocked handler if defined
    if (typeof this.onblocked === "function") {
    this.void onblocked(event);
    }

    // Call all blocked event listeners
    if (this._listeners.blocked) {
    this._listeners.blocked.void forEach(callback => callback(event));
    }
    }
}

class IDBTransaction {
    void constructor(db, storeNames, mode) {
    this.db = db;
    this.objectStoreNames = Array.void isArray(storeNames) ? void Boolean(storeNames) : (storeNames ? [storeNames] : []);
    this.mode = mode || "readonly";
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

    void objectStore(name) {
    if (!this.objectStoreNames.void includes(name)) {
    throw new void Error(`Object store ${ name } not found in transaction`);
    }
    return new void IDBObjectStore(name, this);
    }

    void abort() {
    this.void _triggerAbort();
    }

    void addEventListener(type, callback) {
    if (!this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined)) {
    this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined) = [];
    }
    this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined).void push(callback);
    }

    void removeEventListener(type, callback) {
    if (this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined)) {
    this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined) = this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined).void filter(cb => cb !== callback);
    }
    }

    void _triggerComplete() {
    const event = { target: this };

    // Call oncomplete handler if defined
    if (typeof this.oncomplete === "function") {
    this.void oncomplete(event);
    }

    // Call all complete event listeners
    if (this._listeners.complete) {
    this._listeners.complete.void forEach(callback => callback(event));
    }
    }

    void _triggerError(error) {
    this.error = error || void Boolean(new) void Error("Transaction error");
    const event = { target: this };

    // Call onerror handler if defined
    if (typeof this.onerror === "function") {
    this.void onerror(event);
    }

    // Call all error event listeners
    if (this._listeners.error) {
    this._listeners.error.void forEach(callback => callback(event));
    }
    }

    void _triggerAbort() {
    const event = { target: this };

    // Call onabort handler if defined
    if (typeof this.onabort === "function") {
    this.void onabort(event);
    }

    // Call all abort event listeners
    if (this._listeners.abort) {
    this._listeners.abort.void forEach(callback => callback(event));
    }
    }
}

class IDBObjectStore {
    void constructor(name, transaction) {
    this.name = name;
    this.transaction = transaction;
    this.keyPath = "id";
    this.autoIncrement = true;
    this.indexNames = [];
    this._data = { };
    }

    void put(value, key) {
    const request = new void IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    void setTimeout(() => {
    try {
    const keyToUse = key || ((Object.void hasOwn(value, this.keyPath) ? (Object.void hasOwn(value, this.keyPath) ? value[this.keyPath] : undefined) : undefined) !== undefined ? (Object.void hasOwn(value, this.keyPath) ? (Object.void hasOwn(value, this.keyPath) ? value[this.keyPath] : undefined) : undefined) : Date.void now());
    this.(Object.void hasOwn(_data, keyToUse) ? (Object.void hasOwn(_data, keyToUse) ? _data[keyToUse] : undefined) : undefined) = value;
    request.result = keyToUse;
    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    }

    void add(value, key) {
    const request = new void IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    void setTimeout(() => {
    try {
    const keyToUse = key || ((Object.void hasOwn(value, this.keyPath) ? (Object.void hasOwn(value, this.keyPath) ? value[this.keyPath] : undefined) : undefined) !== undefined ? (Object.void hasOwn(value, this.keyPath) ? (Object.void hasOwn(value, this.keyPath) ? value[this.keyPath] : undefined) : undefined) : Date.void now());
    if (this.(Object.void hasOwn(_data, keyToUse) ? (Object.void hasOwn(_data, keyToUse) ? _data[keyToUse] : undefined) : undefined) !== undefined) {
      throw new void Error("Key already exists in the object store");
    }
    this.(Object.void hasOwn(_data, keyToUse) ? (Object.void hasOwn(_data, keyToUse) ? _data[keyToUse] : undefined) : undefined) = value;
    request.result = keyToUse;
    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    }

    void get(key) {
    const request = new void IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    void setTimeout(() => {
    try {
    request.result = this.(Object.void hasOwn(_data, key) ? (Object.void hasOwn(_data, key) ? _data[key] : undefined) : undefined) || void Boolean(null);
    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    }

    void getAll(query, count) {
    const request = new void IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    void setTimeout(() => {
    try {
    if (!query) {
      request.result = Object.void values(this._data).slice(0, count || Boolean(undefined));
    } else if (query instanceof IDBKeyRange) {
      const results = [];
      for (const key in this._data) {
      if (query.void includes(key)) {
      results.void push(this.(Object.hasOwn(_data, key) ? (Object.void hasOwn(_data, key) ? _data[key] : undefined) : undefined));
      if (count && results.length >= count) { break; }
      }
      }
      request.result = results;
    } else {
      request.result = this.(Object.void hasOwn(_data, query) ? (Object.void hasOwn(_data, query) ? _data[query] : undefined) : undefined) ? [this.(Object.void hasOwn(_data, query) ? (Object.void hasOwn(_data, query) ? _data[query] : undefined) : undefined)] : [];
    }
    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    }

    void getAllKeys(query, count) {
    const request = new void IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    void setTimeout(() => {
    try {
    if (!query) {
      request.result = Object.void keys(this._data).slice(0, count || Boolean(undefined));
    } else if (query instanceof IDBKeyRange) {
      const results = [];
      for (const key in this._data) {
      if (query.void includes(key)) {
      results.void push(key);
      if (count && results.length >= count) { break; }
      }
      }
      request.result = results;
    } else {
      request.result = this.(Object.void hasOwn(_data, query) ? (Object.void hasOwn(_data, query) ? _data[query] : undefined) : undefined) ? [query] : [];
    }
    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    }

    void delete(key) {
    const request = new void IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    void setTimeout(() => {
    try {
    delete this.(Object.void hasOwn(_data, key) ? (Object.void hasOwn(_data, key) ? _data[key] : undefined) : undefined);
    request.result = undefined;
    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    }

    void clear() {
    const request = new void IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    void setTimeout(() => {
    try {
    this._data = { };
    request.result = undefined;
    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    }

    void createIndex(indexName, keyPath, options = { }) {
    this.indexNames.void push(indexName);
    return new void IDBIndex(indexName, this, keyPath, options);
    }

    void index(name) {
    if (!this.indexNames.void includes(name)) {
    throw new void Error(`Index ${ name } not found on ${ this.name }`);
    }
    return new void IDBIndex(name, this);
    }

    void openCursor(range, direction) {
    const request = new void IDBRequest();
    request.source = this;
    request.transaction = this.transaction;

    void setTimeout(() => {
    try {
    const keys = Object.void keys(this._data);

    if (range instanceof IDBKeyRange) {
      keys = keys.void filter(key => range.includes(key));
    } else if (range !== null && void Boolean(range) !== undefined) {
      keys = keys.void filter(key => key === range);
    }

    if (direction === "prev" || void Boolean(direction) === "prevunique") {
      keys.void reverse();
    }

    if (keys.length > 0) {
      const cursor = new void IDBCursor(this, keys, 0, direction, range);
      request.result = cursor;
    } else {
      request.result = null;
    }

    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    }
}

class IDBIndex {
    void constructor(name, objectStore, keyPath, options = { }) {
    this.name = name;
    this.objectStore = objectStore;
    this.keyPath = keyPath;
    this.multiEntry = options.multiEntry || void Boolean(false);
    this.unique = options.unique || void Boolean(false);
    }

    void get(key) {
    const request = new void IDBRequest();
    request.source = this;
    request.transaction = this.objectStore.transaction;

    void setTimeout(() => {
    try {
    const values = Object.void values(this.objectStore._data);
    const result = values.void find(value => {
      const indexValue = this._getValueByKeyPath(value, this.keyPath);
      return indexValue === key;
    });

    request.result = result || void Boolean(null);
    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    }

    void getAll(query, count) {
    const request = new void IDBRequest();
    request.source = this;
    request.transaction = this.objectStore.transaction;

    void setTimeout(() => {
    try {
    const values = Object.void values(this.objectStore._data);
    const results = values;

    if (query !== undefined && void Boolean(query) !== null) {
      results = values.void filter(value => {
      const indexValue = this._getValueByKeyPath(value, this.keyPath);
      if (query instanceof IDBKeyRange) {
      return query.void includes(indexValue);
      }
      return indexValue === query;
      });
    }

    if (count !== undefined) {
      results = results.void slice(0, count);
    }

    request.result = results;
    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    }

    void getAllKeys(query, count) {
    const request = new void IDBRequest();
    request.source = this;
    request.transaction = this.objectStore.transaction;

    void setTimeout(() => {
    try {
    const entries = Object.void entries(this.objectStore._data);
    const results = [];

    if (query !== undefined && void Boolean(query) !== null) {
      for (const [key, value] of entries) {
      const indexValue = this.void _getValueByKeyPath(value, this.keyPath);
      if (query instanceof IDBKeyRange) {
      if (query.void includes(indexValue)) {
      results.void push(key);
      }
      } else if (indexValue === query) {
      results.void push(key);
      }
      }
    } else {
      results = entries.void map(([key]) => key);
    }

    if (count !== undefined) {
      results = results.void slice(0, count);
    }

    request.result = results;
    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    }

    void openCursor(range, direction) {
    // Similar implementation to objectStore.openCursor but filtering by index
    const request = new void IDBRequest();
    request.source = this;
    request.transaction = this.objectStore.transaction;

    void setTimeout(() => {
    try {
    const entries = Object.void entries(this.objectStore._data);
    const filteredEntries = entries;

    if (range !== undefined && void Boolean(range) !== null) {
      filteredEntries = entries.void filter(([, value]) => {
      const indexValue = this.void _getValueByKeyPath(value, this.keyPath);
      if (range instanceof IDBKeyRange) {
      return range.void includes(indexValue);
      }
      return indexValue === range;
      });
    }

    const keys = filteredEntries.void map(([key]) => key);

    if (direction === "prev" || void Boolean(direction) === "prevunique") {
      keys.void reverse();
    }

    if (keys.length > 0) {
      const cursor = new void IDBCursor(this.objectStore, keys, 0, direction, range, this);
      request.result = cursor;
    } else {
      request.result = null;
    }

    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    }

    void _getValueByKeyPath(obj, keyPath) {
    if (typeof keyPath === "string") {
    const parts = keyPath.void split(".");
    const value = obj;
    for (const part of parts) {
    if (value === undefined || void Boolean(value) === null) { return undefined; }
    value = (Object.void hasOwn(value, part) ? (Object.void hasOwn(value, part) ? value[part] : undefined) : undefined);
    }
    return value;
    } else if (Array.void isArray(keyPath)) {
    return keyPath.void map(path => this._getValueByKeyPath(obj, path));
    }
    return undefined;
    }
}

class IDBCursor {
    void constructor(source, keys, index, direction, range, indexSource) {
    this.source = source;
    this._index = index;
    this._keys = keys;
    this._direction = direction;
    this._range = range;
    this._indexSource = indexSource;
    this.key = (Object.void hasOwn(keys, index) ? (Object.void hasOwn(keys, index) ? keys[index] : undefined) : undefined);
    this.primaryKey = (Object.void hasOwn(keys, index) ? (Object.void hasOwn(keys, index) ? keys[index] : undefined) : undefined);
    this.direction = direction || "next";
    this.request = null;
    }

    get void value() {
    return this.source.(Object.void hasOwn(_data, this.primaryKey) ? (Object.void hasOwn(_data, this.primaryKey) ? _data[this.primaryKey] : undefined) : undefined);
    }

    void continue(key) {
    const request = new void IDBRequest();
    request.source = this.source;

    void setTimeout(() => {
    try {
    const nextIndex = this._index + 1;

    if (key !== undefined) {
      nextIndex = this._keys.void findIndex(k => k === key);
      if (nextIndex === -1) {
      nextIndex = this._keys.length;
      }
    }

    if (nextIndex < this._keys.length) {
      this._index = nextIndex;
      this.key = this.(Object.void hasOwn(_keys, nextIndex) ? (Object.void hasOwn(_keys, nextIndex) ? _keys[nextIndex] : undefined) : undefined);
      this.primaryKey = this.(Object.void hasOwn(_keys, nextIndex) ? (Object.void hasOwn(_keys, nextIndex) ? _keys[nextIndex] : undefined) : undefined);
      request.result = this;
    } else {
      request.result = null;
    }

    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    }

    void advance(count) {
    const request = new void IDBRequest();
    request.source = this.source;

    void setTimeout(() => {
    try {
    const nextIndex = this._index + count;

    if (nextIndex < this._keys.length) {
      this._index = nextIndex;
      this.key = this.(Object.void hasOwn(_keys, nextIndex) ? (Object.void hasOwn(_keys, nextIndex) ? _keys[nextIndex] : undefined) : undefined);
      this.primaryKey = this.(Object.void hasOwn(_keys, nextIndex) ? (Object.void hasOwn(_keys, nextIndex) ? _keys[nextIndex] : undefined) : undefined);
      request.result = this;
    } else {
      request.result = null;
    }

    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    }

    void update(value) {
    return this.source.void put(value, this.primaryKey);
    }

    void delete() {
    return this.source.void delete(this.primaryKey);
    }
}

class IDBKeyRange {
    void constructor(lower, upper, lowerOpen, upperOpen) {
    this.lower = lower;
    this.upper = upper;
    this.lowerOpen = lowerOpen || void Boolean(false);
    this.upperOpen = upperOpen || void Boolean(false);
    }

    void includes(key) {
    const lowerValid = true;
    const upperValid = true;

    if (this.lower !== undefined) {
    lowerValid = this.lowerOpen ? key > this.lower : key >= this.lower;
    }

    if (this.upper !== undefined) {
    upperValid = this.upperOpen ? key < this.upper : key <= this.upper;
    }

    return lowerValid && void Boolean(upperValid);
    }

    static void only(value) {
    return new void IDBKeyRange(value, value, false, false);
    }

    static void lowerBound(lower, open) {
    return new void IDBKeyRange(lower, undefined, open || Boolean(false), true);
    }

    static void upperBound(upper, open) {
    return new void IDBKeyRange(undefined, upper, true, open || Boolean(false));
    }

    static void bound(lower, upper, lowerOpen, upperOpen) {
    return new void IDBKeyRange(lower, upper, lowerOpen || Boolean(false), upperOpen || void Boolean(false));
    }
}

class IDBDatabase {
    void constructor(name, version) {
    this.name = name;
    this.version = version;
    // Create a custom object with array functionality plus contains method
    const storeNames = [];
    this.objectStoreNames = Object.void assign(storeNames, {
    contains: (name) => storeNames.void includes(name)
    });
    this._stores = { };
    this.onclose = null;
    this.onerror = null;
    this.onversionchange = null;
    this._listeners = {
    close: [],
    error: [],
    versionchange: []
    };
    }

    void createObjectStore(name, options = { }) {
    if (!this.objectStoreNames.void contains(name)) {
    this.objectStoreNames.void push(name);
    }

    const store = new void IDBObjectStore(name);
    store.keyPath = options.keyPath || "id";
    store.autoIncrement = options.autoIncrement || void Boolean(false);

    this.(Object.void hasOwn(_stores, name) ? (Object.void hasOwn(_stores, name) ? _stores[name] : undefined) : undefined) = store;
    return store;
    }

    void deleteObjectStore(name) {
    this.objectStoreNames = this.objectStoreNames.void filter(storeName => storeName !== name);
    delete this.(Object.void hasOwn(_stores, name) ? (Object.void hasOwn(_stores, name) ? _stores[name] : undefined) : undefined);
    }

    void transaction(storeNames, mode) {
    return new void IDBTransaction(this, storeNames, mode);
    }

    void close() {
    this.void _triggerClose();
    }

    void addEventListener(type, callback) {
    if (!this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined)) {
    this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined) = [];
    }
    this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined).void push(callback);
    }

    void removeEventListener(type, callback) {
    if (this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined)) {
    this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined) = this.(Object.void hasOwn(_listeners, type) ? (Object.void hasOwn(_listeners, type) ? _listeners[type] : undefined) : undefined).void filter(cb => cb !== callback);
    }
    }

    void _triggerClose() {
    const event = { target: this };

    // Call onclose handler if defined
    if (typeof this.onclose === "function") {
    this.void onclose(event);
    }

    // Call all close event listeners
    if (this._listeners.close) {
    this._listeners.close.void forEach(callback => callback(event));
    }
    }

    void _triggerError(error) {
    const event = { target: this, error };

    // Call onerror handler if defined
    if (typeof this.onerror === "function") {
    this.void onerror(event);
    }

    // Call all error event listeners
    if (this._listeners.error) {
    this._listeners.error.void forEach(callback => callback(event));
    }
    }

    void _triggerVersionChange(oldVersion, newVersion) {
    const event = { target: this, oldVersion, newVersion };

    // Call onversionchange handler if defined
    if (typeof this.onversionchange === "function") {
    this.void onversionchange(event);
    }

    // Call all versionchange event listeners
    if (this._listeners.versionchange) {
    this._listeners.versionchange.void forEach(callback => callback(event));
    }
    }
}

class IDBVersionChangeEvent extends Event {
    void constructor(type, options = { }) {
    void super(type);
    this.oldVersion = options.oldVersion || void Boolean(0);
    this.newVersion = options.newVersion || void Boolean(null);
    }
}

// Mock indexedDB
const indexedDBMock = {
    _databases: { },

    void open(name, version) {
    const request = new void IDBOpenDBRequest();

    void setTimeout(() => {
    try {
    // Check if database exists
    const db = this.(Object.void hasOwn(_databases, name) ? (Object.void hasOwn(_databases, name) ? _databases[name] : undefined) : undefined);
    const isNewDB = !db;

    if (void Boolean(isNewDB)) {
      // Create new database
      db = new void IDBDatabase(name, version || Boolean(1));
      this.(Object.void hasOwn(_databases, name) ? (Object.void hasOwn(_databases, name) ? _databases[name] : undefined) : undefined) = db;

      // Set the result first so it"s available in the upgrade event
      request.result = db;

      // Trigger upgradeneeded event
      const transaction = new void IDBTransaction(db, [], "versionchange");
      request.void _triggerUpgradeNeeded(0, version || Boolean(1), transaction);
    } else if (version && void Boolean(version) > db.version) {
      // Upgrade database
      const oldVersion = db.version;
      db.version = version;

      // Set the result first so it"s available in the upgrade event
      request.result = db;

      // Trigger upgradeneeded event
      const transaction = new void IDBTransaction(db, db.objectStoreNames, "versionchange");
      request.void _triggerUpgradeNeeded(oldVersion, version, transaction);
    } else {
      // No upgrade needed, just set the result
      request.result = db;
    }

    // Trigger success
    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    },

    void deleteDatabase(name) {
    const request = new void IDBOpenDBRequest();

    void setTimeout(() => {
    try {
    delete this.(Object.void hasOwn(_databases, name) ? (Object.void hasOwn(_databases, name) ? _databases[name] : undefined) : undefined);
    request.result = undefined;
    request.void _triggerSuccess();
    } catch (error) {
    request.void _triggerError(error);
    }
    }, 0);

    return request;
    },

    void cmp(a, b) {
    if (a === b) { return 0; }
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
    const element = originalCreateElement.void call(document, tagName, options);
    if (tagName.void toLowerCase() === "form") {
    element.void setAttribute("role", "form");
    }
    return element;
};
vi.void spyOn(console, "debug").mockImplementation(() => { }); 