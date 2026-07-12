import { prisma } from '../config/prisma';

// ── getFuelEfficiency ─────────────────────────────────────────────────────────
export async function getFuelEfficiency() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      trips:    { where: { status: 'COMPLETED' }, select: { actualDistanceKm: true } },
      fuelLogs: { select: { litres: true } },
    },
  });

  return vehicles
    .filter((v) => v.trips.length > 0 && v.fuelLogs.length > 0)
    .map((v) => {
      const totalDistanceKm = v.trips.reduce(
        (sum, t) => sum + (t.actualDistanceKm ?? 0),
        0,
      );
      const totalLitres = v.fuelLogs.reduce((sum, f) => sum + f.litres, 0);
      const efficiencyKmPerLitre =
        totalLitres > 0 ? Math.round((totalDistanceKm / totalLitres) * 100) / 100 : 0;

      return {
        vehicleId: v.id,
        vehicleName: v.name,
        regNumber: v.regNumber,
        totalDistanceKm,
        totalLitres,
        efficiencyKmPerLitre,
      };
    })
    .sort((a, b) => b.efficiencyKmPerLitre - a.efficiencyKmPerLitre);
}

// ── getOperationalCosts ───────────────────────────────────────────────────────
export async function getOperationalCosts() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      fuelLogs:        { select: { totalCost: true } },
      maintenanceLogs: { select: { cost: true } },
      expenses:        { select: { amount: true } },
    },
  });

  return vehicles
    .map((v) => {
      const fuelCost        = v.fuelLogs.reduce((s, f) => s + f.totalCost, 0);
      const maintenanceCost = v.maintenanceLogs.reduce((s, m) => s + m.cost, 0);
      const otherExpenses   = v.expenses.reduce((s, e) => s + e.amount, 0);
      const totalCost       = fuelCost + maintenanceCost + otherExpenses;
      return {
        vehicleId: v.id,
        vehicleName: v.name,
        regNumber: v.regNumber,
        fuelCost,
        maintenanceCost,
        otherExpenses,
        totalCost,
      };
    })
    .sort((a, b) => b.totalCost - a.totalCost);
}

// ── getVehicleROI ─────────────────────────────────────────────────────────────
export async function getVehicleROI() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      trips:           { where: { status: 'COMPLETED' }, select: { revenue: true } },
      fuelLogs:        { select: { totalCost: true } },
      maintenanceLogs: { select: { cost: true } },
    },
  });

  return vehicles
    .map((v) => {
      const totalRevenue    = v.trips.reduce((s, t) => s + (t.revenue ?? 0), 0);
      const fuelCost        = v.fuelLogs.reduce((s, f) => s + f.totalCost, 0);
      const maintenanceCost = v.maintenanceLogs.reduce((s, m) => s + m.cost, 0);
      const totalCost       = fuelCost + maintenanceCost;
      const roi             =
        v.acquisitionCost > 0
          ? Math.round(((totalRevenue - totalCost) / v.acquisitionCost) * 100 * 100) / 100
          : 0;

      return {
        vehicleId: v.id,
        vehicleName: v.name,
        regNumber: v.regNumber,
        acquisitionCost: v.acquisitionCost,
        totalRevenue,
        totalCost,
        roi,
      };
    })
    .sort((a, b) => b.roi - a.roi);
}

// ── getMonthlyRevenue ─────────────────────────────────────────────────────────
export async function getMonthlyRevenue() {
  const rows = await prisma.$queryRaw<
    Array<{ month: Date; revenue: number; tripCount: bigint }>
  >`
    SELECT
      DATE_TRUNC('month', "completedAt") AS month,
      SUM(revenue)                       AS revenue,
      COUNT(*)                           AS "tripCount"
    FROM "Trip"
    WHERE status = 'COMPLETED'
      AND revenue IS NOT NULL
      AND "completedAt" IS NOT NULL
    GROUP BY DATE_TRUNC('month', "completedAt")
    ORDER BY month ASC
    LIMIT 12
  `;

  return rows.map((r) => ({
    month:     new Date(r.month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    revenue:   Number(r.revenue),
    tripCount: Number(r.tripCount),
  }));
}

// ── getVehicleStatusBreakdown ─────────────────────────────────────────────────
export async function getVehicleStatusBreakdown() {
  const [available, onTrip, inShop, retired] = await Promise.all([
    prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { status: 'ON_TRIP' } }),
    prisma.vehicle.count({ where: { status: 'IN_SHOP' } }),
    prisma.vehicle.count({ where: { status: 'RETIRED' } }),
  ]);

  return { AVAILABLE: available, ON_TRIP: onTrip, IN_SHOP: inShop, RETIRED: retired };
}
