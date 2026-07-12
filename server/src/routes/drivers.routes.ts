import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import {
  listDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  getDispatchableDrivers,
  addSafetyEvent,
} from '../services/driver.service';
import { sendSuccess, sendError } from '../utils/response';
import { badRequest } from '../utils/errors';

const router = Router();

// GET /api/drivers
router.get('/', authenticate, async (req: any, res: any) => {
  try {
    const drivers = await listDrivers({
      status:          req.query.status          as string | undefined,
      licenseCategory: req.query.licenseCategory as string | undefined,
      search:          req.query.search          as string | undefined,
      expiringDays:    req.query.expiringDays
        ? Number(req.query.expiringDays)
        : undefined,
    });
    sendSuccess(res, drivers);
  } catch (err) {
    sendError(res, err);
  }
});

// GET /api/drivers/dispatchable  (before /:id)
router.get('/dispatchable', authenticate, async (_req, res) => {
  try {
    const drivers = await getDispatchableDrivers();
    sendSuccess(res, drivers);
  } catch (err) {
    sendError(res, err);
  }
});

// GET /api/drivers/expiring — Safety Officer compliance view (expiring within 30 days)
router.get('/expiring', authenticate, async (_req, res) => {
  try {
    const drivers = await listDrivers({ expiringDays: 30 });
    sendSuccess(res, drivers);
  } catch (err) {
    sendError(res, err);
  }
});

// GET /api/drivers/:id
router.get('/:id', authenticate, async (req: any, res: any) => {
  try {
    const driver = await getDriverById(Number(req.params.id));
    sendSuccess(res, driver);
  } catch (err) {
    sendError(res, err);
  }
});

// POST /api/drivers
router.post(
  '/',
  authenticate,
  requireRole('FLEET_MANAGER', 'SAFETY_OFFICER'),
  [
    body('name').notEmpty().withMessage('name required'),
    body('licenseNumber').notEmpty().withMessage('licenseNumber required'),
    body('licenseCategory').notEmpty().withMessage('licenseCategory required'),
    body('licenseExpiry').isISO8601().withMessage('licenseExpiry must be a valid date'),
    body('contactNumber').notEmpty().withMessage('contactNumber required'),
    body('safetyScore').optional().isFloat({ min: 0, max: 100 }),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, badRequest(errors.array()[0].msg));
    try {
      const driver = await createDriver(req.body);
      sendSuccess(res, driver, 'Driver created', 201);
    } catch (err) {
      sendError(res, err);
    }
  },
);

// PUT /api/drivers/:id
router.put(
  '/:id',
  authenticate,
  requireRole('FLEET_MANAGER', 'SAFETY_OFFICER'),
  [
    body('name').optional().notEmpty(),
    body('licenseNumber').optional().notEmpty(),
    body('licenseCategory').optional().notEmpty(),
    body('licenseExpiry').optional().isISO8601(),
    body('contactNumber').optional().notEmpty(),
    body('safetyScore').optional().isFloat({ min: 0, max: 100 }),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, badRequest(errors.array()[0].msg));
    try {
      const driver = await updateDriver(Number(req.params.id), req.body);
      sendSuccess(res, driver, 'Driver updated');
    } catch (err) {
      sendError(res, err);
    }
  },
);

// POST /api/drivers/:id/safety-event
router.post(
  '/:id/safety-event',
  authenticate,
  requireRole('SAFETY_OFFICER'),
  [
    body('delta')
      .isFloat({ min: -100, max: 100 })
      .withMessage('delta must be between -100 and 100'),
    body('reason').notEmpty().withMessage('reason required'),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, badRequest(errors.array()[0].msg));
    try {
      const driver = await addSafetyEvent(
        Number(req.params.id),
        Number(req.body.delta),
        req.body.reason,
      );
      sendSuccess(res, driver, 'Safety event recorded');
    } catch (err) {
      sendError(res, err);
    }
  },
);

export default router;
