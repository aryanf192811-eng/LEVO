export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFound = (message: string, code = 'NOT_FOUND') =>
  new AppError(message, 404, code);

export const conflict = (message: string, code = 'CONFLICT') =>
  new AppError(message, 409, code);

export const forbidden = (message: string, code = 'FORBIDDEN') =>
  new AppError(message, 403, code);

export const unauthorized = (message: string, code = 'UNAUTHORIZED') =>
  new AppError(message, 401, code);

export const badRequest = (message: string, code = 'VALIDATION_ERROR') =>
  new AppError(message, 400, code);
