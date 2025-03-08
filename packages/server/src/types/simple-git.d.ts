declare module 'simple-git' {
  export interface SimpleGit {
    init(): Promise<any>;
    add(files: string | string[]): Promise<any>;
    commit(message: string): Promise<any>;
    status(): Promise<any>;
    checkout(branch: string): Promise<any>;
    branch(): Promise<any>;
    diff(options?: string[]): Promise<string>;
    diffSummary(options?: string[]): Promise<any>;
    fetch(): Promise<any>;
    pull(): Promise<any>;
    push(): Promise<any>;
    remote(): Promise<any>;
    reset(options?: string[]): Promise<any>;
    show(options?: string[]): Promise<any>;
  }

  export default function simpleGit(baseDir?: string, options?: any): SimpleGit;
} 