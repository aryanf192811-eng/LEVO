import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getKPIs } from '../services/dashboard.service';
import {
  getFuelEfficiency,
  getOperationalCosts,
  getVehicleROI,
  getMonthlyRevenue,
  getVehicleStatusBreakdown,
} from '../services/analytics.service';
import { exportVehiclesCSV, exportTripsCSV, exportExpensesCSV } from '../utils/csvExport';
import { generateFleetSummaryPDF } from '../utils/pdfExport';
import { sendSuccess, sendError } from '../utils/response';
import { badRequest } from '../utils/errors';
import { prisma } from '../config/prisma';

const router = Router();

// ── KPIs ──────────────────────────────────────────────────────────────────────
router.get('/kpis', authenticate, async (req, res) => {
  try {
    sendSuccess(res, await getKPIs());
  } catch (err) { sendError(res, err); }
});

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get('/analytics/fuel-efficiency', authenticate, async (req, res) => {
  try { sendSuccess(res, await getFuelEfficiency()); } catch (err) { sendError(res, err); }
});

router.get('/analytics/costs', authenticate, async (req, res) => {
  try { sendSuccess(res, await getOperationalCosts()); } catch (err) { sendError(res, err); }
});

router.get('/analytics/roi', authenticate, async (req, res) => {
  try { sendSuccess(res, await getVehicleROI()); } catch (err) { sendError(res, err); }
});

router.get('/analytics/monthly-revenue', authenticate, async (req, res) => {
  try { sendSuccess(res, await getMonthlyRevenue()); } catch (err) { sendError(res, err); }
});

router.get('/analytics/vehicle-status', authenticate, async (req, res) => {
  try { sendSuccess(res, await getVehicleStatusBreakdown()); } catch (err) { sendError(res, err); }
});

// ── CSV Export ────────────────────────────────────────────────────────────────
router.get('/export/csv', authenticate, async (req, res) => {
  const type = req.query.type as string;

  try {
    let csvString = '';

    if (type === 'vehicles') {
      const vehicles = await prisma.vehicle.findMany({ orderBy: { name: 'asc' } });
      csvString = exportVehiclesCSV(vehicles);
    } else if (type === 'trips') {
      const trips = await prisma.trip.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: { select: { name: true } },
          driver:  { select: { name: true } },
        },
      });
      csvString = exportTripsCSV(trips as any[]);
    } else if (type === 'expenses') {
      const expenses = await prisma.expense.findMany({
        orderBy: { date: 'desc' },
        include: { vehicle: { select: { name: true } } },
      });
      csvString = exportExpensesCSV(expenses as any[]);
    } else {
      return sendError(res, badRequest("type must be 'vehicles', 'trips', or 'expenses'"));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transitops-${type}.csv"`);
    res.send(csvString);
  } catch (err) { sendError(res, err); }
});

// ── PDF Export ────────────────────────────────────────────────────────────────
router.get('/export/pdf', authenticate, async (req, res) => {
  try {
    const [kpis, roi, costs, fuelEfficiency] = await Promise.all([
      getKPIs(),
      getVehicleROI(),
      getOperationalCosts(),
      getFuelEfficiency(),
    ]);

    generateFleetSummaryPDF(res, { kpis, roi, costs, fuelEfficiency });
  } catch (err) { sendError(res, err); }
});

export default router;
