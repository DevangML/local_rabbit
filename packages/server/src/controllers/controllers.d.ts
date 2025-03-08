import { Request, Response } from 'express';

// Types for diffController.js
interface DiffFile {
  path: string;
  content: string;
  additions: number;
  deletions: number;
  type: string;
}

// Types for repositoryController.js
interface RepositoryResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Create custom function signatures using JSDoc
declare global {
  /**
   * Controller function to set repository
   */
  interface SetRepositoryFunction {
    (req: Request, res: Response): Promise<Response | void>;
  }
  
  /**
   * Controller function to get branches
   */
  interface GetBranchesFunction {
    (req: Request, res: Response): Promise<Response | void>;
  }
} 