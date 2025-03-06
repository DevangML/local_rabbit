export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}
export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}
export interface ErrorResponse {
    error: string;
    status: number;
    details?: unknown;
}
//# sourceMappingURL=types.d.ts.map