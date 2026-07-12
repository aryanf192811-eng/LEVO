import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorized } from '../utils/errors';

// Extend Express Request with typed user payload
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: string; name: string };
    }
  }
}

export const authenticate: RequestHandler = (req, _res, next) => {
  try {
    // Try cookie first, fallback to Authorization header (Postman)
    const token =
      req.cookies?.token ??
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw unauthorized('Authentication required');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      email: string;
      role: string;
      name: string;
    };

    req.user = { id: payload.id, email: payload.email, role: payload.role, name: payload.name };
    next();
  } catch (err) {
    next(err);
  }
};
