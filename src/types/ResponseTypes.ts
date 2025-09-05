export interface SuccessResponse<T = Record<string, unknown>> {
    success: true;
    message: string;
    data: T | null;
}

export interface ErrorResponse {
    success: false;
    message: string;
    details: Array<string> | string | null;
}
