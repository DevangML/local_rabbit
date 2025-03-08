/* eslint-disable no-unused-vars */
import * as Comlink from "comlink";

interface GroupedData<T> {
        [key: string]: T[];
}

interface Change {
        type: "add" | "remove";
}

interface DiffFile {
        path: string;
        status: "added" | "modified" | "removed";
        changes: Change[];
}

interface DiffData {
        files: DiffFile[];
}

interface DiffAnalysis {
        summary: string;
        complexity: {
        overall: number;
        filesIncreased: number;
        filesDecreased: number;
        };
        impactedAreas: Set<string>;
        riskScore: number;
}

class Calculator {
        // Example heavy computation
        async fibonacci(n: number): Promise<number> {
        if (n <= 1) { return n; }
        const [a, b] = await Promise.all([
        this.fibonacci(n - 1),
        this.fibonacci(n - 2)
        ]);
        return a + b;
        }

        // Data processing with filtering, mapping, and sorting
         
        async processArrayData<T, R = T>(data: T[], options: {
        filterFn?: (item: T) => boolean;
        mapFn?: (item: T) => R;
        sortFn?: (a: T, b: T) => number;
        groupFn?: (item: T) => string | number;
        }): Promise<R[] | GroupedData<R>> {
        let result = [...data] as unknown as R[];

        // Apply filter
        if (options.filterFn) {
        result = (result as unknown as T[]).filter(options.filterFn) as unknown as R[];
        }

        // Apply map
        if (options.mapFn) {
        result = (result as unknown as T[]).map(options.mapFn);
        }

        // Apply sort
        if (options.sortFn) {
        result = result.sort((a, b) => options.sortFn!(a as unknown as T, b as unknown as T));
        }

        // Apply grouping
        if (options.groupFn) {
        const grouped: GroupedData<R> = { };
        for (const item of result) {
        const key = options.groupFn((item as unknown as T)).toString();
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
        async processImage(imageData: ImageData, operations: {
        invert?: boolean;
        grayscale?: boolean;
        blur?: boolean;
        brightness?: number;
        } = { }): Promise<ImageData> {
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
        const kernel = [1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9];
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
        async analyzeDiff(diffData: DiffData): Promise<DiffAnalysis> {
        const analysis: DiffAnalysis = {
        summary: "",
        complexity: {
        overall: 0,
        filesIncreased: 0,
        filesDecreased: 0
        },
        impactedAreas: new Set<string>(),
        riskScore: 0
        };

        let totalComplexityChange = 0;
        const processedFiles = new Set<string>();

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

        private calculateFileComplexity(file: DiffFile): number {
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

        private calculateRiskScore(diffData: DiffData, processedFiles: Set<string>): number {
        let risk = 0;
        
        // More files changed = higher risk
        risk += processedFiles.size * 2;
        
        // Changes to critical paths increase risk
        const criticalPaths = ["src/core", "src/auth", "src/api"];
        for (const file of processedFiles) {
        if (criticalPaths.some(path => file.includes(path))) {
        risk += 5;
        }
        }
        
        return Math.min(100, risk);
        }

        private generateSummary(analysis: DiffAnalysis): string {
        return `Analysis found changes affecting ${analysis.impactedAreas.size} areas with a risk score of ${analysis.riskScore}. ` +
           `Complexity ${analysis.complexity.overall > 0 ? "increased" : "decreased"} in ${Math.abs(analysis.complexity.overall)} units.`;
        }
}

Comlink.expose(Calculator); 