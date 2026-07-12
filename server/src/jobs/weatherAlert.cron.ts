import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { assessTripWeather } from '../services/weather.service';

const handler = async () => {
  try {
    const dispatched = await prisma.trip.findMany({
      where: { status: 'DISPATCHED' },
    });

    for (const trip of dispatched) {
      if (!trip.source || !trip.destination) continue;

      // Weather assessment is fully optional — never crashes the cron
      const weather = await assessTripWeather(trip.source, trip.destination);
      if (!weather.available || !(weather as any).risk) continue;

      const risk = (weather as any).risk;

      if (risk.risk_level === 'HIGH') {
        await prisma.trip.update({
          where: { id: trip.id },
          data: {
            weatherRiskLevel: 'HIGH',
            weatherRec:       risk.recommendation,
          },
        });

        // Avoid spamming — check for HIGH alert in last 4 hours
        const fourHoursAgo = new Date(Date.now() - 4 * 3600000);
        const recentAlert = await prisma.notification.findFirst({
          where: {
            type:      'WEATHER_ALERT',
            metadata:  { path: ['tripId'], equals: trip.id },
            createdAt: { gte: fourHoursAgo },
          },
        });

        if (!recentAlert) {
          await prisma.notification.create({
            data: {
              type:    'WEATHER_ALERT',
              title:   `⚠ High Weather Risk: Trip ${trip.id}`,
              message: `${trip.source} → ${trip.destination}: ${risk.recommendation}. Est. delay: ${risk.estimated_delay_hours}h.`,
              metadata: {
                tripId:    trip.id,
                source:    trip.source,
                destination: trip.destination,
                riskLevel: 'HIGH',
              },
            },
          });
        }
      } else {
        // LOW or MEDIUM — just update trip metadata, no notification
        await prisma.trip.update({
          where: { id: trip.id },
          data: {
            weatherRiskLevel: risk.risk_level,
            weatherRec:       risk.recommendation,
          },
        });
      }
    }

    console.log(`[Cron] Weather alert check: ${dispatched.length} active trips assessed`);
  } catch (err: any) {
    console.error('[Cron] weatherAlert error:', err.message);
  }
};

export const startWeatherAlertCron = () => {
  cron.schedule('0 * * * *', handler);
  console.log('[Cron] Weather alert cron started (hourly)');
};
