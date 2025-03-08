export function getRepositories(req: import('express').Request, res: import('express').Response): Promise<void>;
export function setRepository(req: import('express').Request, res: import('express').Response): Promise<import('express').Response | void>;
export function getBranches(req: import('express').Request, res: import('express').Response): Promise<import('express').Response | void>;
export function getRepositoryInfo(req: import('express').Request, res: import('express').Response): Promise<import("express").Response<any, Record<string, any>>>;
export type GitBranches = {
    /**
     * - All branches
     */
    all: string[];
};
export type GitServiceResult = {
    all?: string[] | undefined;
};
