/**
 * Type declarations for GitService
 */

import { SimpleGit } from 'simple-git';

/**
 * Repository validation function
 */
export function validatePath(filePath: string, allowedPaths?: string[]): boolean;

/**
 * Git Service class for interacting with git repositories
 */
export class GitService {
  repoPath: string;
  git: SimpleGit;

  constructor(repoPath?: string);
  
  setRepoPath(repoPath: string): void;
  
  isValidRepo(): Promise<boolean>;
  
  getBranches(): Promise<{ all: string[], current: string }>;
  
  getCurrentBranch(): Promise<string>;
  
  getDiff(fromBranch: string, toBranch: string): Promise<string>;
  
  getDiffBetweenBranches(repoPath: string, baseBranch: string, headBranch: string): Promise<string>;
  
  loadState(): Promise<string | null>;
  
  saveState(): Promise<void>;
  
  static findRepositories(): Promise<string[]>;
  
  isGitRepository(dirPath: string): Promise<boolean>;
  
  getFileContent(filePath: string, ref?: string): Promise<string>;
  
  getCommitHistory(branch: string, maxCount?: number): Promise<any[]>;
  
  getStatus(): Promise<any>;
} 