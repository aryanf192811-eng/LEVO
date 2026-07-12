import { Response } from 'express';
import { AppError } from './errors';

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = 'Success',
  statusCode = 200,
) => {
  res.status(statusCode).json({ success: true, data, message });
};

export const sendError = (res: Response, error: unknown) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  const err = error as Error;

  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      success: false,
      error: err.message,
      code: 'INTERNAL_ERROR',
      stack: err.stack,
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};
