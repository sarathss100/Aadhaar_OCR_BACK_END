import { SuccessResponse } from '../types/ResponseTypes'; 
import { Response } from 'express';

export const sendSuccessResponse = <T extends Record<string, unknown>>(
    res: Response,
    statusCode: number,
    message: string,
    data: T | null = null
): Response => {
    const response: SuccessResponse<T> = {
        success: true,
        message,
        data
    }
    return res.status(statusCode).json(response);
};

export const sendErrorResponse = (
    res: Response,
    statusCode: number,
    message: string,
    details: Array<string> | string | null = null
): Response => {
    return res.status(statusCode).json({
        success: false,
        message,
        details
    });
};
