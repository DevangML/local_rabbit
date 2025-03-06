export = ValidationUtils;
declare class ValidationUtils {
    static isValidPath(filePath: any): any;
    static isValidBranchName(branchName: any): boolean;
    static sanitizePath(filePath: any): string;
    static validateRepositoryRequest(req: any): string[];
    static validateDiffRequest(req: any): string[];
    static isValidGitOperation(operation: any): boolean;
}
//# sourceMappingURL=validation.d.ts.map