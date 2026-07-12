import { VehicleStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { notFound, conflict, badRequest } from '../utils/errors';

export type CreateVehicleInput = {
  regNumber: string;
  name: string;
  type: string;
  maxCapacityKg: number;
  currentOdometer?: number;
  acquisitionCost: number;
  region?: string;
  serviceIntervalKm?: number;
};

// ── listVehicles ──────────────────────────────────────────────────────────────
export const listVehicles = async (filters: {
  status?: string;
  type?: string;
  region?: string;
  search?: string;
}) => {
  const where: Record<string, unknown> = {};

  if (filters.status) where['status'] = filters.status as VehicleStatus;
  if (filters.type)   where['type']   = filters.type;
  if (filters.region) where['region'] = filters.region;
  if (filters.search) {
    where['OR'] = [
      { regNumber: { contains: filters.search, mode: 'insensitive' } },
      { name:      { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

// ── getVehicleById ────────────────────────────────────────────────────────────
export const getVehicleById = async (id: number) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      maintenanceLogs: { orderBy: { openedAt: 'desc' } },
      fuelLogs:        { orderBy: { date: 'desc' }, take: 20 },
      expenses:        { orderBy: { date: 'desc' }, take: 20 },
      trips: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { driver: { select: { name: true } } },
      },
    },
  });

  if (!vehicle) throw notFound('Vehicle not found');

  const totalFuelCost        = vehicle.fuelLogs.reduce((s, f) => s + f.totalCost, 0);
  const totalMaintenanceCost = vehicle.maintenanceLogs.reduce((s, m) => s + m.cost, 0);
  const totalRevenue         = vehicle.trips.reduce((s, t) => s + (t.revenue ?? 0), 0);
  const roi = vehicle.acquisitionCost > 0
    ? ((totalRevenue - totalMaintenanceCost - totalFuelCost) / vehicle.acquisitionCost) * 100
    : 0;

  const completedTrips  = vehicle.trips.filter((t) => t.status === 'COMPLETED');
  const totalDistanceKm = completedTrips.reduce((s, t) => s + (t.actualDistanceKm ?? 0), 0);
  const totalLitres     = vehicle.fuelLogs.reduce((s, f) => s + f.litres, 0);
  const fuelEfficiency  = totalLitres > 0 ? totalDistanceKm / totalLitres : null;

  return {
    ...vehicle,
    totalFuelCost,
    totalMaintenanceCost,
    totalRevenue,
    roi,
    fuelEfficiency,
  };
};

// ── createVehicle ─────────────────────────────────────────────────────────────
export const createVehicle = async (data: CreateVehicleInput) => {
  const existing = await prisma.vehicle.findUnique({
    where: { regNumber: data.regNumber },
  });
  if (existing) throw conflict('Registration number already in use', 'DUPLICATE_REG');

  return prisma.vehicle.create({ data });
};

// ── updateVehicle ─────────────────────────────────────────────────────────────
export const updateVehicle = async (
  id: number,
  data: Partial<CreateVehicleInput>,
) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw notFound('Vehicle not found');

  if (data.regNumber && data.regNumber !== vehicle.regNumber) {
    const conflict_ = await prisma.vehicle.findUnique({
      where: { regNumber: data.regNumber },
    });
    if (conflict_) throw conflict('Registration number already in use', 'DUPLICATE_REG');
  }

  return prisma.vehicle.update({ where: { id }, data });
};

// ── deleteVehicle ─────────────────────────────────────────────────────────────
export const deleteVehicle = async (id: number) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw notFound('Vehicle not found');

  const activeTrips = await prisma.trip.count({
    where: { vehicleId: id, status: 'DISPATCHED' },
  });
  if (activeTrips > 0) {
    throw conflict('Cannot delete vehicle with active trips', 'VEHICLE_IN_USE');
  }

  return prisma.vehicle.delete({ where: { id } });
};

// ── getDispatchableVehicles ───────────────────────────────────────────────────
export const getDispatchableVehicles = async () => {
  return prisma.vehicle.findMany({
    where: { status: 'AVAILABLE' },
    select: {
      id: true,
      regNumber: true,
      name: true,
      type: true,
      maxCapacityKg: true,
      currentOdometer: true,
      region: true,
    },
    orderBy: { name: 'asc' },
  });
};
