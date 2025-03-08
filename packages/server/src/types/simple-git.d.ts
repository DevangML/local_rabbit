declare module 'simple-git' {
  interface SimpleGit {
    status(): Promise<any>;
    checkout(branch: string): Promise<any>;
    branch(): Promise<any>;
    diff(options?: string[]): Promise<string>;
    raw(args: string[]): Promise<string>;
    checkIsRepo(): Promise<boolean>;
    show(options: string[]): Promise<string>;
    log(options: any): Promise<any>;
    // Add other methods as needed
  }

  function simpleGit(baseDir?: string): SimpleGit;
  
  export = simpleGit;
} 