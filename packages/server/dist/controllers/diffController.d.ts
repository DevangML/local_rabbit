export function getDiff(req: import('express').Request, res: import('express').Response): Promise<import("express").Response<any, Record<string, any>>>;
export function analyzeDiff(req: import('express').Request, res: import('express').Response): Promise<import("express").Response<any, Record<string, any>>>;
export type DiffFile = {
    path: string;
    content: string;
};
