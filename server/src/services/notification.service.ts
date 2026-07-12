import { NotificationType } from '@prisma/client';
import { prisma } from '../config/prisma';

// ── createNotification ────────────────────────────────────────────────────────
export const createNotification = async (data: {
  userId?: number;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) => {
  return prisma.notification.create({ data });
};

// ── listNotifications ─────────────────────────────────────────────────────────
export const listNotifications = async (userId?: number) => {
  const where = userId != null
    ? { OR: [{ userId }, { userId: null }] }
    : {};

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
};

// ── markAsRead ────────────────────────────────────────────────────────────────
export const markAsRead = async (id: number) => {
  return prisma.notification.update({
    where: { id },
    data:  { isRead: true },
  });
};

// ── markAllAsRead ─────────────────────────────────────────────────────────────
export const markAllAsRead = async (userId: number) => {
  return prisma.notification.updateMany({
    where: {
      OR: [{ userId }, { userId: null }],
      isRead: false,
    },
    data: { isRead: true },
  });
};

// ── getUnreadCount ────────────────────────────────────────────────────────────
export const getUnreadCount = async (userId: number): Promise<number> => {
  return prisma.notification.count({
    where: {
      OR: [{ userId }, { userId: null }],
      isRead: false,
    },
  });
};
