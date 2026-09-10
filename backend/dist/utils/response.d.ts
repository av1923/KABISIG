import type { Response } from 'express';
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    details?: unknown;
    timestamp: string;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
    pagination: PaginationMeta;
}
export declare function sendSuccess<T>(res: Response, data: T, message?: string, statusCode?: number): Response;
export declare function sendCreated<T>(res: Response, data: T, message?: string): Response;
export declare function sendError(res: Response, message?: string, statusCode?: number, details?: unknown): Response;
export declare function sendPaginated<T>(res: Response, data: T[], pagination: {
    page: number;
    limit: number;
    total: number;
}, message?: string): Response;
//# sourceMappingURL=response.d.ts.map