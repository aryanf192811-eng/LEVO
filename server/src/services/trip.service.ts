import { TripStatus, VehicleStatus, DriverStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { notFound, conflict, badRequest } from '../utils/errors';

// ── Business Rules R1-R9 ──────────────────────────────────────────────────────
async function validateForDispatch(
  vehicleId: number,
  driverId: number,
  cargoWeightKg: number,
) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw notFound('Vehicle not found');                                                           // R1
  if (vehicle.status === 'RETIRED')  throw conflict('Vehicle is retired and cannot be dispatched', 'VEHICLE_RETIRED');   // R2
  if (vehicle.status === 'IN_SHOP')  throw conflict('Vehicle is currently in maintenance and unavailable', 'VEHICLE_IN_SHOP'); // R3
  if (vehicle.status === 'ON_TRIP')  throw conflict('Vehicle is already assigned to an active trip', 'VEHICLE_ON_TRIP'); // R4

  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) throw notFound('Driver not found');                                                            // R5
  if (driver.status === 'SUSPENDED') throw conflict('Driver is suspended and cannot be assigned', 'DRIVER_SUSPENDED');  // R6
  if (driver.status === 'ON_TRIP')   throw conflict('Driver is already on an active trip', 'DRIVER_ON_TRIP');            // R7
  if (driver.licenseExpiry < new Date()) throw conflict('Driver license has expired. Renew before dispatch.', 'LICENSE_EXPIRED'); // R8

  if (cargoWeightKg > vehicle.maxCapacityKg) {                                                               // R9
    const excess = (cargoWeightKg - vehicle.maxCapacityKg).toFixed(1);
    throw conflict(
      `Cargo ${cargoWeightKg}kg exceeds vehicle capacity of ${vehicle.maxCapacityKg}kg (excess: ${excess}kg)`,
      'CARGO_OVERWEIGHT',
    );
  }

  return { vehicle, driver };
}

// ── createTrip ────────────────────────────────────────────────────────────────
export const createTrip = async (
  data: {
    vehicleId: number;
    driverId: number;
    source: string;
    destination: string;
    cargoWeightKg: number;
    plannedDistanceKm: number;
    notes?: string;
    weatherRiskLevel?: string;
    weatherRec?: string;
  },
  userId: number,
) => {
  await validateForDispatch(data.vehicleId, data.driverId, data.cargoWeightKg);

  return prisma.trip.create({
    data: { ...data, status: TripStatus.DRAFT, createdById: userId },
    include: { vehicle: true, driver: true },
  });
};

// ── dispatchTrip ──────────────────────────────────────────────────────────────
export const dispatchTrip = async (tripId: number, userId: number) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { vehicle: true, driver: true },
  });
  if (!trip) throw notFound('Trip not found');
  if (trip.status !== TripStatus.DRAFT) {
    throw conflict(`Trip cannot be dispatched from ${trip.status} status`, 'INVALID_STATUS_TRANSITION');
  }

  await validateForDispatch(trip.vehicleId, trip.driverId, trip.cargoWeightKg);

  const [updatedTrip] = await prisma.$transaction([
    prisma.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.DISPATCHED,
        dispatchedAt: new Date(),
        startOdometer: trip.vehicle.currentOdometer,
      },
      include: { vehicle: true, driver: true },
    }),
    prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: VehicleStatus.ON_TRIP },
    }),
    prisma.driver.update({
      where: { id: trip.driverId },
      data: { status: DriverStatus.ON_TRIP },
    }),
    prisma.tripEvent.create({
      data: {
        tripId,
        actorId: userId,
        fromStatus: TripStatus.DRAFT,
        toStatus: TripStatus.DISPATCHED,
      },
    }),
  ]);

  return updatedTrip;
};

// ── completeTrip ──────────────────────────────────────────────────────────────
export const completeTrip = async (
  tripId: number,
  data: { endOdometer: number; revenue: number },
  userId: number,
) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { vehicle: true },
  });
  if (!trip) throw notFound('Trip not found');
  if (trip.status !== TripStatus.DISPATCHED) {
    throw conflict('Only dispatched trips can be completed', 'INVALID_STATUS_TRANSITION');
  }
  if (data.endOdometer <= (trip.startOdometer ?? 0)) {
    throw badRequest('End odometer must be greater than start odometer');
  }

  const { vehicle } = trip;
  const actualDistanceKm = data.endOdometer - (trip.startOdometer ?? vehicle.currentOdometer);
  const kmSinceService   = data.endOdometer - vehicle.lastServiceOdometer;
  const needsMaintenance = vehicle.serviceIntervalKm != null && kmSinceService >= vehicle.serviceIntervalKm;

  const updatedTrip = await prisma.$transaction(async (tx) => {
    const t = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.COMPLETED,
        endOdometer: data.endOdometer,
        actualDistanceKm,
        revenue: data.revenue,
        completedAt: new Date(),
      },
    });

    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: {
        currentOdometer: data.endOdometer,
        status: needsMaintenance ? VehicleStatus.IN_SHOP : VehicleStatus.AVAILABLE,
        lastServiceOdometer: needsMaintenance ? data.endOdometer : vehicle.lastServiceOdometer,
      },
    });

    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: DriverStatus.AVAILABLE },
    });

    await tx.tripEvent.create({
      data: {
        tripId,
        actorId: userId,
        fromStatus: TripStatus.DISPATCHED,
        toStatus: TripStatus.COMPLETED,
        notes: needsMaintenance
          ? `Auto-maintenance triggered at ${data.endOdometer}km`
          : undefined,
      },
    });

    if (needsMaintenance) {
      await tx.maintenanceLog.create({
        data: {
          vehicleId: trip.vehicleId,
          type: 'Scheduled Service',
          description: `Auto-triggered at ${data.endOdometer}km (interval: ${vehicle.serviceIntervalKm}km)`,
          status: 'ACTIVE',
          odometerAtService: data.endOdometer,
          isAutoTriggered: true,
        },
      });

      await tx.notification.create({
        data: {
          type: 'MAINTENANCE_DUE',
          title: `Auto-Maintenance: ${vehicle.name}`,
          message: `${vehicle.name} has been sent for scheduled service. Travelled ${kmSinceService.toFixed(0)}km since last service.`,
          metadata: {
            vehicleId: trip.vehicleId,
            vehicleName: vehicle.name,
            odometerAtService: data.endOdometer,
          },
        },
      });
    }

    return t;
  });

  return { trip: updatedTrip, maintenanceTriggered: needsMaintenance };
};

// ── cancelTrip ────────────────────────────────────────────────────────────────
export const cancelTrip = async (tripId: number, userId: number) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw notFound('Trip not found');

  if (trip.status === TripStatus.COMPLETED) {
    throw conflict('Completed trips cannot be cancelled', 'INVALID_STATUS_TRANSITION');
  }
  if (trip.status === TripStatus.CANCELLED) {
    throw conflict('Trip is already cancelled', 'ALREADY_CANCELLED');
  }

  const wasDispatched = trip.status === TripStatus.DISPATCHED;
  const fromStatus    = trip.status;

  await prisma.$transaction(async (tx) => {
    await tx.trip.update({
      where: { id: tripId },
      data: { status: TripStatus.CANCELLED },
    });

    if (wasDispatched) {
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.AVAILABLE },
      });
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.AVAILABLE },
      });
    }

    await tx.tripEvent.create({
      data: {
        tripId,
        actorId: userId,
        fromStatus,
        toStatus: TripStatus.CANCELLED,
      },
    });
  });

  return prisma.trip.findUnique({
    where: { id: tripId },
    include: { vehicle: true, driver: true },
  });
};

// ── listTrips ─────────────────────────────────────────────────────────────────
export const listTrips = async (filters: {
  status?: string;
  vehicleId?: number;
  driverId?: number;
  search?: string;
}) => {
  const where: Record<string, unknown> = {};
  if (filters.status)    where['status']    = filters.status as TripStatus;
  if (filters.vehicleId) where['vehicleId'] = filters.vehicleId;
  if (filters.driverId)  where['driverId']  = filters.driverId;
  if (filters.search) {
    where['OR'] = [
      { source:      { contains: filters.search, mode: 'insensitive' } },
      { destination: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.trip.findMany({
    where,
    include: {
      vehicle: { select: { id: true, regNumber: true, name: true, type: true } },
      driver:  { select: { id: true, name: true, licenseNumber: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// ── getTripById ───────────────────────────────────────────────────────────────
export const getTripById = async (id: number) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle:   true,
      driver:    true,
      events: {
        include: { actor: { select: { name: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
      fuelLogs:  true,
      expenses:  true,
      createdBy: { select: { name: true, role: true } },
    },
  });
  if (!trip) throw notFound('Trip not found');
  return trip;
};
