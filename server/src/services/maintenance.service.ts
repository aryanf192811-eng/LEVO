import { MaintenanceStatus, VehicleStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { notFound, conflict } from '../utils/errors';

// ── createMaintenance ─────────────────────────────────────────────────────────
export const createMaintenance = async (data: {
  vehicleId: number;
  type: string;
  description: string;
  cost?: number;
  odometerAtService?: number;
}) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw notFound('Vehicle not found');
  if (vehicle.status === 'RETIRED') {
    throw conflict('Retired vehicles cannot have maintenance records', 'VEHICLE_RETIRED');
  }

  const [maintenanceLog, updatedVehicle] = await prisma.$transaction([
    prisma.maintenanceLog.create({
      data: {
        vehicleId:        data.vehicleId,
        type:             data.type,
        description:      data.description,
        cost:             data.cost ?? 0,
        odometerAtService: data.odometerAtService,
        status:           MaintenanceStatus.ACTIVE,
        isAutoTriggered:  false,
      },
    }),
    prisma.vehicle.update({
      where: { id: data.vehicleId },
      data:  { status: VehicleStatus.IN_SHOP },
    }),
  ]);

  return { maintenanceLog, vehicle: updatedVehicle };
};

// ── closeMaintenance ──────────────────────────────────────────────────────────
export const closeMaintenance = async (maintenanceId: number) => {
  const log = await prisma.maintenanceLog.findUnique({
    where:   { id: maintenanceId },
    include: { vehicle: true },
  });
  if (!log) throw notFound('Maintenance record not found');
  if (log.status === 'CLOSED') throw conflict('Maintenance record is already closed');

  const [updatedLog, updatedVehicle] = await prisma.$transaction([
    prisma.maintenanceLog.update({
      where: { id: maintenanceId },
      data:  { status: MaintenanceStatus.CLOSED, closedAt: new Date() },
    }),
    prisma.vehicle.update({
      where: { id: log.vehicleId },
      data: {
        // Keep RETIRED if it was retired before maintenance, otherwise set AVAILABLE
        status: log.vehicle.status === 'RETIRED' ? VehicleStatus.RETIRED : VehicleStatus.AVAILABLE,
      },
    }),
  ]);

  return { maintenanceLog: updatedLog, vehicle: updatedVehicle };
};

// ── listMaintenance ───────────────────────────────────────────────────────────
export const listMaintenance = async (filters: {
  vehicleId?: number;
  status?: string;
}) => {
  const where: Record<string, unknown> = {};
  if (filters.vehicleId) where['vehicleId'] = filters.vehicleId;
  if (filters.status)    where['status']    = filters.status as MaintenanceStatus;

  return prisma.maintenanceLog.findMany({
    where,
    include: {
      vehicle: { select: { id: true, regNumber: true, name: true, status: true } },
    },
    orderBy: { openedAt: 'desc' },
  });
};

// ── getMaintenanceById ────────────────────────────────────────────────────────
export const getMaintenanceById = async (id: number) => {
  const log = await prisma.maintenanceLog.findUnique({
    where:   { id },
    include: { vehicle: true },
  });
  if (!log) throw notFound('Maintenance record not found');
  return log;
};
