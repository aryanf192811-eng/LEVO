import { prisma } from '../config/prisma';

export async function getKPIs() {
  const [
    totalVehicles,
    availableVehicles,
    onTripVehicles,
    inShopVehicles,
    retiredVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    totalDrivers,
    expiring30Days,
    suspendedDrivers,
    recentTrips,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { status: 'ON_TRIP' } }),
    prisma.vehicle.count({ where: { status: 'IN_SHOP' } }),
    prisma.vehicle.count({ where: { status: 'RETIRED' } }),
    prisma.trip.count({ where: { status: 'DISPATCHED' } }),
    prisma.trip.count({ where: { status: 'DRAFT' } }),
    prisma.driver.count({ where: { status: 'ON_TRIP' } }),
    prisma.driver.count(),
    prisma.driver.count({
      where: {
        licenseExpiry: { lte: new Date(Date.now() + 30 * 86400000) },
        status: { not: 'SUSPENDED' },
      },
    }),
    prisma.driver.count({ where: { status: 'SUSPENDED' } }),
    prisma.trip.findMany({
      where: { status: { in: ['DISPATCHED', 'DRAFT'] } },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: { select: { name: true, regNumber: true } },
        driver:  { select: { name: true } },
      },
    }),
  ]);

  const fleetUtilization =
    totalVehicles > 0
      ? Math.round((onTripVehicles / (totalVehicles - retiredVehicles)) * 100)
      : 0;

  return {
    totalVehicles,
    availableVehicles,
    onTripVehicles,
    inShopVehicles,
    retiredVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    totalDrivers,
    expiring30Days,
    suspendedDrivers,
    fleetUtilization,
    recentTrips,
  };
}
