import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import {
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getDispatchableVehicles,
} from '../services/vehicle.service';
import { sendSuccess, sendError } from '../utils/response';
import { badRequest } from '../utils/errors';

const router = Router();

const vehicleBodyValidators = [
  body('regNumber').notEmpty().isLength({ max: 20 }).withMessage('regNumber required (max 20 chars)'),
  body('name').notEmpty().withMessage('name required'),
  body('type').notEmpty().withMessage('type required'),
  body('maxCapacityKg').isFloat({ min: 1 }).withMessage('maxCapacityKg must be a positive number'),
  body('acquisitionCost').isFloat({ min: 0 }).withMessage('acquisitionCost must be >= 0'),
  body('currentOdometer').optional().isFloat({ min: 0 }).withMessage('currentOdometer must be >= 0'),
];

// GET /api/vehicles
router.get('/', authenticate, async (req, res) => {
  try {
    const vehicles = await listVehicles({
      status: req.query.status as string | undefined,
      type:   req.query.type   as string | undefined,
      region: req.query.region as string | undefined,
      search: req.query.search as string | undefined,
    });
    sendSuccess(res, vehicles);
  } catch (err) {
    sendError(res, err);
  }
});

// GET /api/vehicles/dispatchable  (before /:id to avoid param capture)
router.get('/dispatchable', authenticate, async (_req, res) => {
  try {
    const vehicles = await getDispatchableVehicles();
    sendSuccess(res, vehicles);
  } catch (err) {
    sendError(res, err);
  }
});

// GET /api/vehicles/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const vehicle = await getVehicleById(Number(req.params.id));
    sendSuccess(res, vehicle);
  } catch (err) {
    sendError(res, err);
  }
});

// POST /api/vehicles
router.post(
  '/',
  authenticate,
  requireRole('FLEET_MANAGER'),
  vehicleBodyValidators,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, badRequest(errors.array()[0].msg));
    try {
      const vehicle = await createVehicle(req.body);
      sendSuccess(res, vehicle, 'Vehicle created', 201);
    } catch (err) {
      sendError(res, err);
    }
  },
);

// PUT /api/vehicles/:id
router.put(
  '/:id',
  authenticate,
  requireRole('FLEET_MANAGER'),
  vehicleBodyValidators.map((v) => v.optional()),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, badRequest(errors.array()[0].msg));
    try {
      const vehicle = await updateVehicle(Number(req.params.id), req.body);
      sendSuccess(res, vehicle, 'Vehicle updated');
    } catch (err) {
      sendError(res, err);
    }
  },
);

// DELETE /api/vehicles/:id
router.delete('/:id', authenticate, requireRole('FLEET_MANAGER'), async (req, res) => {
  try {
    await deleteVehicle(Number(req.params.id));
    sendSuccess(res, null, 'Vehicle deleted');
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
