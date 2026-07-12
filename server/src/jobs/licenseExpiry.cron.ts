import cron from 'node-cron';
import { prisma } from '../config/prisma';

const handler = async () => {
  try {
    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 86400000);

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const drivers = await prisma.driver.findMany({
      where: {
        licenseExpiry: { lte: in30Days },
        status: { not: 'SUSPENDED' },
      },
    });

    let flagged = 0;
    for (const driver of drivers) {
      const daysLeft = Math.ceil(
        (driver.licenseExpiry.getTime() - Date.now()) / 86400000,
      );

      // Avoid duplicate notifications on the same day
      const existingToday = await prisma.notification.findFirst({
        where: {
          type: 'LICENSE_EXPIRY',
          metadata: { path: ['driverId'], equals: driver.id },
          createdAt: { gte: startOfToday },
        },
      });

      if (!existingToday) {
        await prisma.notification.create({
          data: {
            type:    'LICENSE_EXPIRY',
            title:   `License Expiring: ${driver.name}`,
            message: `${driver.name}'s ${driver.licenseCategory} license expires in ${daysLeft} day(s). Renew immediately.`,
            metadata: {
              driverId:   driver.id,
              driverName: driver.name,
              daysLeft,
              expiryDate: driver.licenseExpiry.toISOString(),
            },
          },
        });
        flagged++;
      }
    }

    console.log(`[Cron] License expiry check: ${drivers.length} drivers checked, ${flagged} flagged`);
  } catch (err: any) {
    console.error('[Cron] licenseExpiry error:', err.message);
  }
};

export const startLicenseExpiryCron = () => {
  cron.schedule('0 8 * * *', handler);
  console.log('[Cron] License expiry cron started (daily at 08:00)');
};
