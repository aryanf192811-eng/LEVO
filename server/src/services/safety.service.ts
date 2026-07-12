import { DriverStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { notFound, conflict } from '../utils/errors';

// ── addSafetyEvent ────────────────────────────────────────────────────────────
export const addSafetyEvent = async (
  driverId: number,
  delta: number,
  reason: string,
) => {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) throw notFound('Driver not found');

  const newScore = Math.min(100, Math.max(0, driver.safetyScore + delta));

  const [safetyEvent, updatedDriver] = await prisma.$transaction([
    prisma.safetyEvent.create({ data: { driverId, delta, reason } }),
    prisma.driver.update({
      where: { id: driverId },
      data:  { safetyScore: newScore },
      select: { id: true, name: true, safetyScore: true },
    }),
  ]);

  return { safetyEvent, driver: updatedDriver };
};

// ── getSafetyHistory ──────────────────────────────────────────────────────────
export const getSafetyHistory = async (driverId: number) => {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    select: { id: true, name: true, safetyScore: true },
  });
  if (!driver) throw notFound('Driver not found');

  const events = await prisma.safetyEvent.findMany({
    where:   { driverId },
    orderBy: { createdAt: 'desc' },
  });

  return { driver, events };
};

// ── suspendDriver ─────────────────────────────────────────────────────────────
export const suspendDriver = async (driverId: number, reason: string) => {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) throw notFound('Driver not found');

  if (driver.status === 'SUSPENDED') {
    throw conflict('Driver is already suspended');
  }
  if (driver.status === 'ON_TRIP') {
    throw conflict(
      'Cannot suspend driver with active trip. Complete or cancel trip first.',
      'DRIVER_ON_TRIP',
    );
  }

  const [updatedDriver] = await prisma.$transaction([
    prisma.driver.update({
      where: { id: driverId },
      data:  { status: DriverStatus.SUSPENDED },
    }),
    prisma.safetyEvent.create({
      data: { driverId, delta: -20, reason: `Suspended: ${reason}` },
    }),
  ]);

  return updatedDriver;
};

// ── reinstateDriver ───────────────────────────────────────────────────────────
export const reinstateDriver = async (driverId: number) => {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) throw notFound('Driver not found');

  if (driver.status !== 'SUSPENDED') {
    throw conflict('Driver is not suspended');
  }

  const [updatedDriver] = await prisma.$transaction([
    prisma.driver.update({
      where: { id: driverId },
      data:  { status: DriverStatus.AVAILABLE },
    }),
    prisma.safetyEvent.create({
      data: { driverId, delta: 0, reason: 'Reinstated by Safety Officer' },
    }),
  ]);

  return updatedDriver;
};
