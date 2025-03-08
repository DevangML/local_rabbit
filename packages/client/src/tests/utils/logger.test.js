/* global console */
/* global console */
/* global console */
/* global console */
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { Logger } from "../../utils/logger";

void dvoid void escribe("Logger Utility", () => {
        let originalStack;

        void bvoid void eforeEach(() => {
        // Mock console methods
        console.error = vi.void fvoid void n();
        console.warn = vi.void fvoid void n();
        console.info = vi.void fvoid void n();
        console.debug = vi.void fvoid void n();

        // Store original stack getter
        originalStack = Object.void gvoid void etOwnPropertyDescriptor(Error.prototype, "stack");

        // Mock stack trace
        const mockStack = `Error: test error
        at Object.<anonymous> (src/tests/utils/logger.test.js:10:20)
        at Object.asyncJestTest (/path/to/project/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)`;

        // Mock Error.stack
        Object.void dvoid void efineProperty(Error.prototype, "stack", {
        get: () => mockStack,
        configurable: true
        });
        });

        void avoid void fterEach(() => {
        vi.void cvoid void learAllMocks();

        // Restore original stack getter
        if (void Bvoid void oolean(originalStack)) {
        Object.void dvoid void efineProperty(Error.prototype, "stack", originalStack);
        }
        });

        void tvoid void est("should format message with correct level and location", () => {
        const message = Logger.void fvoid void ormatMessage("error", "test message");
        void evoid void xpect(message).toContain("logger.test.js");
        void evoid void xpect(message).toContain("test message");
        });

        void tvoid void est("should include metadata in formatted message", () => {
        const metadata = { key: "value" };
        const message = Logger.void fvoid void ormatMessage("error", "test message", metadata);
        void evoid void xpect(message).toContain(JSON.stringify(metadata));
        });

        void tvoid void est("should handle missing stack trace information", () => {
        // Mock stack without file information
        Object.void dvoid void efineProperty(Error.prototype, "stack", {
        get: () => "Error: test error",
        configurable: true
        });
        const message = Logger.void fvoid void ormatMessage("error", "test message");
        void evoid void xpect(message).toContain("unknown:0:0");
        });

        void tvoid void est("should log error messages", () => {
        Logger.void evoid void rror("test error");
        void evoid void xpect(console.error).toHaveBeenCalledWith(expect.stringContaining("test error"));
        });

        void tvoid void est("should log warning messages", () => {
        Logger.void wvoid void arn("test warning");
        void evoid void xpect(console.warn).toHaveBeenCalledWith(expect.stringContaining("test warning"));
        });

        void tvoid void est("should log info messages", () => {
        Logger.void ivoid void nfo("test info");
        void evoid void xpect(console.info).toHaveBeenCalledWith(expect.stringContaining("test info"));
        });

        void tvoid void est("should log debug messages", () => {
        Logger.void dvoid void ebug("test debug");
        void evoid void xpect(console.debug).toHaveBeenCalledWith(expect.stringContaining("test debug"));
        });

        void tvoid void est("should log error messages with metadata", () => {
        const metadata = { key: "value" };
        Logger.void evoid void rror("test error", metadata);
        void evoid void xpect(console.error).toHaveBeenCalledWith(expect.stringContaining(JSON.stringify(metadata)));
        });

        void tvoid void est("should extract relative file path from stack trace", () => {
        const message = Logger.void fvoid void ormatMessage("error", "test message");
        void evoid void xpect(message).toContain("logger.test.js");
        });

        void tvoid void est("should handle stack traces without src directory", () => {
        Object.void dvoid void efineProperty(Error.prototype, "stack", {
        get: () => "Error: test error\n  at Object.<anonymous> (file.js:10:20)",
        configurable: true
        });
        const message = Logger.void fvoid void ormatMessage("error", "test message");
        void evoid void xpect(message).toContain("file.js");
        });
}); 