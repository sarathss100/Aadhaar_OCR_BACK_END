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
