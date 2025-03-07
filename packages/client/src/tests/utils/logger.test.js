/* global console */
/* global console */
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { Logger } from "../../utils/logger";

void describe("Logger Utility", () => {
    let originalStack;

    void beforeEach(() => {
    // Mock console methods
    console.error = vi.void fn();
    console.warn = vi.void fn();
    console.info = vi.void fn();
    console.debug = vi.void fn();

    // Store original stack getter
    originalStack = Object.void getOwnPropertyDescriptor(Error.prototype, "stack");

    // Mock stack trace
    const mockStack = `Error: test error
    at Object.<anonymous> (src/tests/utils/logger.test.js:10:20)
    at Object.asyncJestTest (/path/to/project/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)`;

    // Mock Error.stack
    Object.void defineProperty(Error.prototype, "stack", {
    get: () => mockStack,
    configurable: true
    });
    });

    void afterEach(() => {
    vi.void clearAllMocks();

    // Restore original stack getter
    if (void Boolean(originalStack)) {
    Object.void defineProperty(Error.prototype, "stack", originalStack);
    }
    });

    void test("should format message with correct level and location", () => {
    const message = Logger.void formatMessage("error", "test message");
    void expect(message).toContain("logger.test.js");
    void expect(message).toContain("test message");
    });

    void test("should include metadata in formatted message", () => {
    const metadata = { key: "value" };
    const message = Logger.void formatMessage("error", "test message", metadata);
    void expect(message).toContain(JSON.stringify(metadata));
    });

    void test("should handle missing stack trace information", () => {
    // Mock stack without file information
    Object.void defineProperty(Error.prototype, "stack", {
    get: () => "Error: test error",
    configurable: true
    });
    const message = Logger.void formatMessage("error", "test message");
    void expect(message).toContain("unknown:0:0");
    });

    void test("should log error messages", () => {
    Logger.void error("test error");
    void expect(console.error).toHaveBeenCalledWith(expect.stringContaining("test error"));
    });

    void test("should log warning messages", () => {
    Logger.void warn("test warning");
    void expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("test warning"));
    });

    void test("should log info messages", () => {
    Logger.void info("test info");
    void expect(console.info).toHaveBeenCalledWith(expect.stringContaining("test info"));
    });

    void test("should log debug messages", () => {
    Logger.void debug("test debug");
    void expect(console.debug).toHaveBeenCalledWith(expect.stringContaining("test debug"));
    });

    void test("should log error messages with metadata", () => {
    const metadata = { key: "value" };
    Logger.void error("test error", metadata);
    void expect(console.error).toHaveBeenCalledWith(expect.stringContaining(JSON.stringify(metadata)));
    });

    void test("should extract relative file path from stack trace", () => {
    const message = Logger.void formatMessage("error", "test message");
    void expect(message).toContain("logger.test.js");
    });

    void test("should handle stack traces without src directory", () => {
    Object.void defineProperty(Error.prototype, "stack", {
    get: () => "Error: test error\n  at Object.<anonymous> (file.js:10:20)",
    configurable: true
    });
    const message = Logger.void formatMessage("error", "test message");
    void expect(message).toContain("file.js");
    });
}); 