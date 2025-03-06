export * from './types';
export * from './utils';
export * from './components/ErrorBoundary';
export interface User {
    id: string;
    name: string;
    email: string;
}
export declare function formatDate(date: Date): string;
export declare const API_ENDPOINTS: {
    readonly AUTH: "/api/auth";
    readonly USERS: "/api/users";
};
export declare const ENV: {
    readonly isDevelopment: boolean;
    readonly isProduction: boolean;
    readonly isTest: boolean;
};
//# sourceMappingURL=index.d.ts.map