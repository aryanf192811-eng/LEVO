import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import {
  listMaintenance,
  getMaintenanceById,
  createMaintenance,
  closeMaintenance,
} from '../services/maintenance.service';
import { sendSuccess, sendError } from '../utils/response';
import { badRequest } from '../utils/errors';

const router = Router();

// GET /api/maintenance
router.get('/', authenticate, async (req, res) => {
  try {
    const logs = await listMaintenance({
      vehicleId: req.query.vehicleId ? Number(req.query.vehicleId) : undefined,
      status:    req.query.status as string | undefined,
    });
    sendSuccess(res, logs);
  } catch (err) { sendError(res, err); }
});

// POST /api/maintenance
router.post(
  '/',
  authenticate,
  requireRole('FLEET_MANAGER'),
  [
    body('vehicleId').isInt().withMessage('vehicleId must be an integer'),
    body('type').notEmpty().withMessage('type required'),
    body('description').notEmpty().withMessage('description required'),
    body('cost').optional().isFloat({ min: 0 }).withMessage('cost must be >= 0'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, badRequest(errors.array()[0].msg));
    try {
      const result = await createMaintenance(req.body);
      sendSuccess(res, result, 'Maintenance record created', 201);
    } catch (err) { sendError(res, err); }
  },
);

// GET /api/maintenance/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const log = await getMaintenanceById(Number(req.params.id));
    sendSuccess(res, log);
  } catch (err) { sendError(res, err); }
});

// PATCH /api/maintenance/:id/close
router.patch('/:id/close', authenticate, requireRole('FLEET_MANAGER'), async (req, res) => {
  try {
    const result = await closeMaintenance(Number(req.params.id));
    sendSuccess(res, result, 'Maintenance closed — vehicle returned to service');
  } catch (err) { sendError(res, err); }
});

export default router;
