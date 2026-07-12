import { DriverStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { notFound, conflict, badRequest } from '../utils/errors';

export type CreateDriverInput = {
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: Date | string;
  contactNumber: string;
  safetyScore?: number;
};

// ── listDrivers ───────────────────────────────────────────────────────────────
export const listDrivers = async (filters: {
  status?: string;
  licenseCategory?: string;
  search?: string;
  expiringDays?: number;
}) => {
  const where: Record<string, unknown> = {};

  if (filters.status)          where['status']          = filters.status as DriverStatus;
  if (filters.licenseCategory) where['licenseCategory'] = filters.licenseCategory;
  if (filters.search) {
    where['OR'] = [
      { name:          { contains: filters.search, mode: 'insensitive' } },
      { licenseNumber: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.expiringDays !== undefined) {
    where['licenseExpiry'] = {
      lte: new Date(Date.now() + filters.expiringDays * 86400000),
    };
  }

  return prisma.driver.findMany({ where, orderBy: { createdAt: 'desc' } });
};

// ── getDriverById ─────────────────────────────────────────────────────────────
export const getDriverById = async (id: number) => {
  const driver = await prisma.driver.findUnique({
    where: { id },
    include: {
      trips: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { vehicle: { select: { name: true, regNumber: true } } },
      },
      safetyEvents: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!driver) throw notFound('Driver not found');
  return driver;
};

// ── createDriver ──────────────────────────────────────────────────────────────
export const createDriver = async (data: CreateDriverInput) => {
  const existing = await prisma.driver.findUnique({
    where: { licenseNumber: data.licenseNumber },
  });
  if (existing) throw conflict('License number already registered', 'DUPLICATE_LICENSE');

  const expiry = new Date(data.licenseExpiry);
  if (expiry <= new Date()) {
    throw badRequest('License expiry date must be in the future');
  }

  return prisma.driver.create({
    data: {
      ...data,
      licenseExpiry: expiry,
    },
  });
};

// ── updateDriver ──────────────────────────────────────────────────────────────
export const updateDriver = async (
  id: number,
  data: Partial<CreateDriverInput>,
) => {
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) throw notFound('Driver not found');

  if (data.licenseNumber && data.licenseNumber !== driver.licenseNumber) {
    const dup = await prisma.driver.findUnique({
      where: { licenseNumber: data.licenseNumber },
    });
    if (dup) throw conflict('License number already registered', 'DUPLICATE_LICENSE');
  }

  return prisma.driver.update({
    where: { id },
    data: {
      ...data,
      licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : undefined,
    },
  });
};

// ── getDispatchableDrivers ────────────────────────────────────────────────────
export const getDispatchableDrivers = async () => {
  return prisma.driver.findMany({
    where: {
      status: 'AVAILABLE',
      licenseExpiry: { gt: new Date() },
    },
    select: {
      id: true,
      name: true,
      licenseNumber: true,
      licenseCategory: true,
      licenseExpiry: true,
      safetyScore: true,
    },
    orderBy: { name: 'asc' },
  });
};

// ── addSafetyEvent ────────────────────────────────────────────────────────────
export const addSafetyEvent = async (
  driverId: number,
  delta: number,
  reason: string,
) => {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) throw notFound('Driver not found');

  await prisma.safetyEvent.create({ data: { driverId, delta, reason } });

  const newScore = Math.min(100, Math.max(0, driver.safetyScore + delta));
  return prisma.driver.update({
    where: { id: driverId },
    data: { safetyScore: newScore },
  });
};
