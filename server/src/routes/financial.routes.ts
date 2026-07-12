import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import {
  createFuelLog,
  listFuelLogs,
  createExpense,
  listExpenses,
  getOperationalCostByVehicle,
} from '../services/financial.service';
import {
  addSafetyEvent,
  getSafetyHistory,
  suspendDriver,
  reinstateDriver,
} from '../services/safety.service';
import { sendSuccess, sendError } from '../utils/response';
import { badRequest } from '../utils/errors';

const router = Router();

// ── Fuel Logs ─────────────────────────────────────────────────────────────────

// POST /api/financial/fuel
router.post(
  '/fuel',
  authenticate,
  requireRole('FLEET_MANAGER', 'DISPATCHER'),
  [
    body('vehicleId').isInt().withMessage('vehicleId must be an integer'),
    body('litres').isFloat({ min: 0.1 }).withMessage('litres must be > 0'),
    body('costPerLitre').isFloat({ min: 0.1 }).withMessage('costPerLitre must be > 0'),
    body('odometerReading').isFloat({ min: 0 }).withMessage('odometerReading must be >= 0'),
    body('date').notEmpty().withMessage('date required'),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, badRequest(errors.array()[0].msg));
    try {
      const log = await createFuelLog(req.body);
      sendSuccess(res, log, 'Fuel log created', 201);
    } catch (err) { sendError(res, err); }
  },
);

// GET /api/financial/fuel
router.get('/fuel', authenticate, async (req: any, res: any) => {
  try {
    const logs = await listFuelLogs({
      vehicleId: req.query.vehicleId ? Number(req.query.vehicleId) : undefined,
      tripId:    req.query.tripId    ? Number(req.query.tripId)    : undefined,
    });
    sendSuccess(res, logs);
  } catch (err) { sendError(res, err); }
});

// ── Expenses ──────────────────────────────────────────────────────────────────

// POST /api/financial/expenses
router.post(
  '/expenses',
  authenticate,
  requireRole('FLEET_MANAGER', 'DISPATCHER'),
  [
    body('vehicleId').isInt().withMessage('vehicleId must be an integer'),
    body('type').notEmpty().withMessage('type required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('amount must be > 0'),
    body('date').notEmpty().withMessage('date required'),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, badRequest(errors.array()[0].msg));
    try {
      const expense = await createExpense(req.body);
      sendSuccess(res, expense, 'Expense recorded', 201);
    } catch (err) { sendError(res, err); }
  },
);

// GET /api/financial/expenses
router.get('/expenses', authenticate, async (req: any, res: any) => {
  try {
    const expenses = await listExpenses({
      vehicleId: req.query.vehicleId ? Number(req.query.vehicleId) : undefined,
      tripId:    req.query.tripId    ? Number(req.query.tripId)    : undefined,
      type:      req.query.type      as string | undefined,
    });
    sendSuccess(res, expenses);
  } catch (err) { sendError(res, err); }
});

// GET /api/financial/costs/:vehicleId
router.get('/costs/:vehicleId', authenticate, async (req: any, res: any) => {
  try {
    const data = await getOperationalCostByVehicle(Number(req.params.vehicleId));
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
});

// ── Safety Events ─────────────────────────────────────────────────────────────

// POST /api/financial/safety-events
router.post(
  '/safety-events',
  authenticate,
  requireRole('SAFETY_OFFICER'),
  [
    body('driverId').isInt().withMessage('driverId must be an integer'),
    body('delta').isFloat({ min: -100, max: 100 }).withMessage('delta must be between -100 and 100'),
    body('reason').notEmpty().withMessage('reason required'),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, badRequest(errors.array()[0].msg));
    try {
      const result = await addSafetyEvent(
        Number(req.body.driverId),
        Number(req.body.delta),
        req.body.reason,
      );
      sendSuccess(res, result, 'Safety event recorded');
    } catch (err) { sendError(res, err); }
  },
);

// GET /api/financial/safety-events?driverId=<id>
router.get(
  '/safety-events',
  authenticate,
  [query('driverId').isInt().withMessage('driverId query param required')],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, badRequest(errors.array()[0].msg));
    try {
      const data = await getSafetyHistory(Number(req.query.driverId));
      sendSuccess(res, data);
    } catch (err) { sendError(res, err); }
  },
);

// ── Driver Suspend / Reinstate ────────────────────────────────────────────────

// POST /api/financial/drivers/:driverId/suspend
router.post(
  '/drivers/:driverId/suspend',
  authenticate,
  requireRole('SAFETY_OFFICER'),
  [body('reason').notEmpty().withMessage('reason required')],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, badRequest(errors.array()[0].msg));
    try {
      const driver = await suspendDriver(Number(req.params.driverId), req.body.reason);
      sendSuccess(res, driver, 'Driver suspended');
    } catch (err) { sendError(res, err); }
  },
);

// POST /api/financial/drivers/:driverId/reinstate
router.post(
  '/drivers/:driverId/reinstate',
  authenticate,
  requireRole('SAFETY_OFFICER'),
  async (req: any, res: any) => {
    try {
      const driver = await reinstateDriver(Number(req.params.driverId));
      sendSuccess(res, driver, 'Driver reinstated');
    } catch (err) { sendError(res, err); }
  },
);

export default router;
