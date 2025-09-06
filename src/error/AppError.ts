import { ErrorMessages } from "../constants/errorMessages";
import { StatusCodes } from "../constants/statusCodes";
import { sendErrorResponse } from "../utils/responseHandler";
import { Response } from "express";

// Base error class
export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, statusCode: number = 400) {
        super(message, statusCode);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class ServerError extends AppError {
    constructor(message: string = `An unexpected server error occurred`, statusCode: number = 500) {
        super(message, statusCode);
        Object.setPrototypeOf(this, ServerError.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'The requested resource was not found.', statusCode: number = 404) {
        super(message, statusCode);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'A conflict occurred with the current state of the resource.', statusCode: number = 409) {
        super(message, statusCode);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export class ServiceUnavailableError extends AppError {
    constructor(message: string = 'The service is currently unavailable. Please try again later.', statusCode: number = 503) {
        super(message, statusCode);
        Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
    }
}

export function wrapServiceError(error: unknown): Error {
  // Case: Already an Error instance → return as-is
  if (error instanceof Error) return error;

  // Case: Array of error messages
  if (Array.isArray(error)) {
    return new Error(error.join("; "));
  }

  // Case: Object with a message field
  if (typeof error === "object" && error !== null) {
    const maybeMessage = (error as { message?: string }).message;
    if (maybeMessage) return new Error(maybeMessage);
  }

  // Fallback
  return new Error(String(error) || "Unknown service error");
}

export function handleControllerError(response: Response, error: unknown): void {
    if (error instanceof AppError) {
        sendErrorResponse(response, error.statusCode, error.message);
    } else {
        sendErrorResponse(response, StatusCodes.INTERNAL_SERVER_ERROR, ErrorMessages.INTERNAL_SERVER_ERROR);
    }
}