export let port: string | number;
export let nodeEnv: string;
export namespace cors {
    let origin: string[];
    let methods: string[];
    let allowedHeaders: string[];
    let credentials: boolean;
}
export namespace db {
    let path: string;
}
export namespace git {
    let statePath: string;
    let allowedDirs: string[];
}
export namespace logging {
    let level: string;
    let dir: string;
}
export namespace ai {
    let geminiApiKey: string;
    let enableAiFeatures: true;
}
export namespace security {
    let maxFileSize: string;
    namespace rateLimit {
        let windowMs: number;
        let max: number;
    }
}
//# sourceMappingURL=index.d.ts.map