import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import {
  listTrips,
  getTripById,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} from '../services/trip.service';
import { sendSuccess, sendError } from '../utils/response';
import { badRequest } from '../utils/errors';

const router = Router();

// GET /api/trips
router.get('/', authenticate, async (req, res) => {
  try {
    const trips = await listTrips({
      status:    req.query.status    as string | undefined,
      vehicleId: req.query.vehicleId ? Number(req.query.vehicleId) : undefined,
      driverId:  req.query.driverId  ? Number(req.query.driverId)  : undefined,
      search:    req.query.search    as string | undefined,
    });
    sendSuccess(res, trips);
  } catch (err) { sendError(res, err); }
});

// POST /api/trips
router.post(
  '/',
  authenticate,
  requireRole('FLEET_MANAGER', 'DISPATCHER'),
  [
    body('vehicleId').isInt().withMessage('vehicleId must be an integer'),
    body('driverId').isInt().withMessage('driverId must be an integer'),
    body('source').notEmpty().withMessage('source required'),
    body('destination').notEmpty().withMessage('destination required'),
    body('cargoWeightKg').isFloat({ min: 0.1 }).withMessage('cargoWeightKg must be > 0'),
    body('plannedDistanceKm').isFloat({ min: 0.1 }).withMessage('plannedDistanceKm must be > 0'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, badRequest(errors.array()[0].msg));
    try {
      const trip = await createTrip(req.body, req.user!.id);
      sendSuccess(res, trip, 'Trip created', 201);
    } catch (err) { sendError(res, err); }
  },
);

// GET /api/trips/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const trip = await getTripById(Number(req.params.id));
    sendSuccess(res, trip);
  } catch (err) { sendError(res, err); }
});

// PATCH /api/trips/:id/dispatch
router.patch(
  '/:id/dispatch',
  authenticate,
  requireRole('FLEET_MANAGER', 'DISPATCHER'),
  async (req, res) => {
    try {
      const trip = await dispatchTrip(Number(req.params.id), req.user!.id);
      sendSuccess(res, trip, 'Trip dispatched successfully');
    } catch (err) { sendError(res, err); }
  },
);

// PATCH /api/trips/:id/complete
router.patch(
  '/:id/complete',
  authenticate,
  requireRole('FLEET_MANAGER', 'DISPATCHER'),
  [
    body('endOdometer').isFloat({ min: 0 }).withMessage('endOdometer must be >= 0'),
    body('revenue').isFloat({ min: 0 }).withMessage('revenue must be >= 0'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, badRequest(errors.array()[0].msg));
    try {
      const result = await completeTrip(
        Number(req.params.id),
        { endOdometer: Number(req.body.endOdometer), revenue: Number(req.body.revenue) },
        req.user!.id,
      );
      const message = result.maintenanceTriggered
        ? 'Trip completed. Auto-maintenance triggered — vehicle sent to shop.'
        : 'Trip completed successfully';
      sendSuccess(res, result, message);
    } catch (err) { sendError(res, err); }
  },
);

// PATCH /api/trips/:id/cancel
router.patch(
  '/:id/cancel',
  authenticate,
  requireRole('FLEET_MANAGER', 'DISPATCHER'),
  async (req, res) => {
    try {
      const trip = await cancelTrip(Number(req.params.id), req.user!.id);
      sendSuccess(res, trip, 'Trip cancelled');
    } catch (err) { sendError(res, err); }
  },
);

export default router;
