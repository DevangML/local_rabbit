export let nodeEnv: string;
export namespace logging {
    let level: string;
    let directory: string;
}
export namespace cors {
    let origin: string | string[];
    let methods: string[];
    let allowedHeaders: string[];
    let credentials: boolean;
}
export namespace git {
    let statePath: string;
    let defaultBranch: string;
    let maxDiffSize: number;
}
