export = SecureGitService;
declare class SecureGitService {
    static findRepositories(): Promise<any[]>;
    static searchDirectory(dir: any, repos: any, depth?: number): Promise<void>;
    currentRepoPath: string | null;
    allowedDirectories: string[];
    setRepositoryPath(repoPath: any): boolean;
    getRepositoryPath(): string | null;
    isPathAllowed(pathToCheck: any): boolean;
    isValidRepo(repoPath: any): Promise<boolean>;
    getBranches(): Promise<any>;
    getDiff(fromBranch: any, toBranch: any): Promise<any>;
}
//# sourceMappingURL=SecureGitService.d.ts.map