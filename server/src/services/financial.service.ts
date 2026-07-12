import { prisma } from '../config/prisma';
import { notFound, badRequest } from '../utils/errors';

const VALID_EXPENSE_TYPES = ['Toll', 'Parking', 'Fine', 'Loading', 'Unloading', 'Other'];

// ── createFuelLog ─────────────────────────────────────────────────────────────
export const createFuelLog = async (data: {
  vehicleId: number;
  tripId?: number;
  litres: number;
  costPerLitre: number;
  odometerReading: number;
  date: string | Date;
}) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw notFound('Vehicle not found');

  const totalCost = Math.round(data.litres * data.costPerLitre * 100) / 100;

  return prisma.fuelLog.create({
    data: {
      vehicleId:       data.vehicleId,
      tripId:          data.tripId,
      litres:          data.litres,
      costPerLitre:    data.costPerLitre,
      totalCost,
      odometerReading: data.odometerReading,
      date:            new Date(data.date),
    },
    include: {
      vehicle: { select: { name: true, regNumber: true } },
    },
  });
};

// ── listFuelLogs ──────────────────────────────────────────────────────────────
export const listFuelLogs = async (filters: {
  vehicleId?: number;
  tripId?: number;
}) => {
  const where: Record<string, unknown> = {};
  if (filters.vehicleId) where['vehicleId'] = filters.vehicleId;
  if (filters.tripId)    where['tripId']    = filters.tripId;

  return prisma.fuelLog.findMany({
    where,
    include: {
      vehicle: { select: { id: true, regNumber: true, name: true } },
      trip:    { select: { id: true, source: true, destination: true } },
    },
    orderBy: { date: 'desc' },
  });
};

// ── createExpense ─────────────────────────────────────────────────────────────
export const createExpense = async (data: {
  vehicleId: number;
  tripId?: number;
  type: string;
  amount: number;
  description?: string;
  date: string | Date;
}) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw notFound('Vehicle not found');

  if (!VALID_EXPENSE_TYPES.includes(data.type)) {
    throw badRequest(`type must be one of: ${VALID_EXPENSE_TYPES.join(', ')}`);
  }

  return prisma.expense.create({
    data: {
      vehicleId:   data.vehicleId,
      tripId:      data.tripId,
      type:        data.type,
      amount:      data.amount,
      description: data.description,
      date:        new Date(data.date),
    },
    include: {
      vehicle: { select: { name: true, regNumber: true } },
    },
  });
};

// ── listExpenses ──────────────────────────────────────────────────────────────
export const listExpenses = async (filters: {
  vehicleId?: number;
  tripId?: number;
  type?: string;
}) => {
  const where: Record<string, unknown> = {};
  if (filters.vehicleId) where['vehicleId'] = filters.vehicleId;
  if (filters.tripId)    where['tripId']    = filters.tripId;
  if (filters.type)      where['type']      = filters.type;

  return prisma.expense.findMany({
    where,
    include: {
      vehicle: { select: { id: true, regNumber: true, name: true } },
      trip:    { select: { id: true, source: true, destination: true } },
    },
    orderBy: { date: 'desc' },
  });
};

// ── getOperationalCostByVehicle ───────────────────────────────────────────────
export const getOperationalCostByVehicle = async (vehicleId: number) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw notFound('Vehicle not found');

  const [fuelAgg, maintenanceAgg, expenseAgg] = await Promise.all([
    prisma.fuelLog.aggregate({
      where: { vehicleId },
      _sum:  { totalCost: true },
    }),
    prisma.maintenanceLog.aggregate({
      where: { vehicleId },
      _sum:  { cost: true },
    }),
    prisma.expense.aggregate({
      where: { vehicleId },
      _sum:  { amount: true },
    }),
  ]);

  const totalFuelCost        = fuelAgg._sum.totalCost       ?? 0;
  const totalMaintenanceCost = maintenanceAgg._sum.cost     ?? 0;
  const totalOtherExpenses   = expenseAgg._sum.amount       ?? 0;
  const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalOtherExpenses;

  return {
    vehicleId,
    vehicleName: vehicle.name,
    regNumber:   vehicle.regNumber,
    totalFuelCost,
    totalMaintenanceCost,
    totalOtherExpenses,
    totalOperationalCost,
  };
};
