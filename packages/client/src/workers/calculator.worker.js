/* eslint-disable no-unused-vars */
import * as Comlink from "comlink";

class Calculator {
    // Example heavy computation
    async fibonacci(n) {
        if (n <= 1) { return n; }
        const [a, b] = await Promise.all([
            this.fibonacci(n - 1),
            this.fibonacci(n - 2)
        ]);
        return a + b;
    }

    // Data processing with filtering, mapping, and sorting
    async processArrayData(data, options) {
        let result = [...data];

        // Apply filter
        if (options.filterFn) {
            result = result.filter(options.filterFn);
        }

        // Apply map
        if (options.mapFn) {
            result = result.map(options.mapFn);
        }

        // Apply sort
        if (options.sortFn) {
            result = result.sort((a, b) => options.sortFn(a, b));
        }

        // Apply grouping
        if (options.groupFn) {
            const grouped = {};
            for (const item of result) {
                const key = options.groupFn(item).toString();
                if (!grouped[key]) {
                    grouped[key] = [];
                }
                grouped[key].push(item);
            }
            return grouped;
        }

        return result;
    }

    // Image processing with various operations
    async processImage(imageData, operations = {}) {
        const data = new Uint8ClampedArray(imageData.data);

        if (operations.invert) {
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - (data[i] || 0);      // red
                data[i + 1] = 255 - (data[i + 1] || 0); // green
                data[i + 2] = 255 - (data[i + 2] || 0); // blue
            }
        }

        if (operations.grayscale) {
            for (let i = 0; i < data.length; i += 4) {
                const avg = ((data[i] || 0) + (data[i + 1] || 0) + (data[i + 2] || 0)) / 3;
                data[i] = avg;     // red
                data[i + 1] = avg; // green
                data[i + 2] = avg; // blue
            }
        }

        if (operations.blur) {
            // Simple box blur
            const width = imageData.width;
            const height = imageData.height;
            const kernel = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];
            const tempData = new Uint8ClampedArray(data);

            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    for (let c = 0; c < 3; c++) {
                        let sum = 0;
                        for (let ky = -1; ky <= 1; ky++) {
                            for (let kx = -1; kx <= 1; kx++) {
                                const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                                sum += (tempData[idx] || 0) * (kernel[(ky + 1) * 3 + (kx + 1)] || 0);
                            }
                        }
                        data[(y * width + x) * 4 + c] = sum;
                    }
                }
            }
        }

        if (operations.brightness !== undefined) {
            const factor = Math.max(-1, Math.min(1, operations.brightness));
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, (data[i] || 0) * (1 + factor));
                data[i + 1] = Math.min(255, (data[i + 1] || 0) * (1 + factor));
                data[i + 2] = Math.min(255, (data[i + 2] || 0) * (1 + factor));
            }
        }

        return new ImageData(data, imageData.width, imageData.height);
    }

    // Diff analysis
    async analyzeDiff(diffData) {
        const analysis = {
            summary: "",
            complexity: {
                overall: 0,
                filesIncreased: 0,
                filesDecreased: 0
            },
            impactedAreas: new Set(),
            riskScore: 0
        };

        let totalComplexityChange = 0;
        const processedFiles = new Set();

        for (const file of diffData.files || []) {
            const fileComplexity = this.calculateFileComplexity(file);
            totalComplexityChange += fileComplexity;

            if (fileComplexity > 0) { analysis.complexity.filesIncreased++; }
            if (fileComplexity < 0) { analysis.complexity.filesDecreased++; }

            const fileDir = file.path.split("/").slice(0, -1).join("/");
            analysis.impactedAreas.add(fileDir);

            processedFiles.add(file.path);
        }

        analysis.complexity.overall = totalComplexityChange;
        analysis.riskScore = this.calculateRiskScore(diffData, processedFiles);
        analysis.summary = this.generateSummary(analysis);

        return analysis;
    }

    calculateFileComplexity(file) {
        // Simple complexity calculation based on changes
        let complexity = 0;

        // Count added/removed lines
        const addedLines = (file.changes || []).filter(c => c.type === "add").length;
        const removedLines = (file.changes || []).filter(c => c.type === "remove").length;

        // More changes = higher complexity
        complexity += (addedLines + removedLines) * 0.1;

        // New files have higher complexity
        if (file.status === "added") { complexity += 5; }

        // Modifications to existing files have medium complexity
        if (file.status === "modified") { complexity += 2; }

        return complexity;
    }

    calculateRiskScore(diffData, processedFiles) {
        let risk = 0;

        // More files changed = higher risk
        risk += Math.min(50, (diffData.files || []).length * 2);

        // Check for critical paths
        const criticalPaths = ["security", "auth", "payment", "core", "config"];
        for (const file of processedFiles) {
            if (criticalPaths.some(path => file.includes(path))) {
                risk += 10;
            }
        }

        return Math.min(100, risk);
    }

    generateSummary(analysis) {
        const filesChanged = analysis.complexity.filesIncreased + analysis.complexity.filesDecreased;
        const areasChanged = analysis.impactedAreas.size;

        let summary = `This change affects ${filesChanged} files across ${areasChanged} areas. `;

        if (analysis.riskScore > 70) {
            summary += "This is a high-risk change with significant impact.";
        } else if (analysis.riskScore > 40) {
            summary += "This is a medium-risk change with moderate impact.";
        } else {
            summary += "This is a low-risk change with minimal impact.";
        }

        return summary;
    }
}

Comlink.expose(new Calculator());

/* eslint-env worker */
/* global self */

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

self.onmessage = (e) => {
    try {
        const result = fibonacci(e.data);
        self.postMessage({ result });
    } catch (error) {
        self.postMessage({ error: error.message });
    }
};