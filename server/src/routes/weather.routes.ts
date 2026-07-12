import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { assessTripWeather } from '../services/weather.service';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../services/notification.service';
import { sendSuccess, sendError } from '../utils/response';
import { badRequest } from '../utils/errors';

// ── Weather Router ────────────────────────────────────────────────────────────
export const weatherRouter = Router();

// GET /api/weather/assess?source=Mumbai&destination=Delhi
weatherRouter.get('/assess', authenticate, async (req, res) => {
  const { source, destination } = req.query as { source?: string; destination?: string };

  if (!source || !destination) {
    return sendError(res, badRequest('source and destination query params are required'));
  }

  try {
    const result = await assessTripWeather(source, destination);
    // Always 200 — weather is optional data, never break the caller
    sendSuccess(
      res,
      result,
      (result as any).available ? 'Weather data retrieved' : 'Weather service unavailable',
    );
  } catch (err) {
    // Belt-and-suspenders: even unexpected errors return 200 with unavailable
    sendSuccess(res, { available: false, reason: 'Weather service error' }, 'Weather service unavailable');
  }
});

// ── Notification Router ───────────────────────────────────────────────────────
export const notificationRouter = Router();

// GET /api/notifications
notificationRouter.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await listNotifications(req.user!.id);
    sendSuccess(res, notifications);
  } catch (err) { sendError(res, err); }
});

// GET /api/notifications/unread-count  (before /:id to avoid capture)
notificationRouter.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await getUnreadCount(req.user!.id);
    sendSuccess(res, { count });
  } catch (err) { sendError(res, err); }
});

// PATCH /api/notifications/read-all  (before /:id/read to avoid capture)
notificationRouter.patch('/read-all', authenticate, async (req, res) => {
  try {
    await markAllAsRead(req.user!.id);
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) { sendError(res, err); }
});

// PATCH /api/notifications/:id/read
notificationRouter.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await markAsRead(Number(req.params.id));
    sendSuccess(res, notification, 'Notification marked as read');
  } catch (err) { sendError(res, err); }
});

export default weatherRouter;
