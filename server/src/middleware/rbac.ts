import { RequestHandler } from 'express';
import { forbidden, unauthorized } from '../utils/errors';

/**
 * Role-based access control middleware.
 *
 * Usage:
 *   router.post('/', authenticate, requireRole('FLEET_MANAGER', 'DISPATCHER'), handler)
 */
export const requireRole = (...roles: string[]): RequestHandler =>
  (req, _res, next) => {
    try {
      if (!req.user) {
        throw unauthorized('Authentication required');
      }
      if (!roles.includes(req.user.role)) {
        throw forbidden(
          `Role ${req.user.role} cannot access this resource`,
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
