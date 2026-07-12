import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { sendSuccess, sendError } from './utils/response';
import { notFound } from './utils/errors';
import authRouter from './routes/auth.routes';         // B4
import vehiclesRouter from './routes/vehicles.routes'; // B5
import driversRouter from './routes/drivers.routes';   // B5

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRouter);     // B4
app.use('/api/vehicles', vehiclesRouter); // B5
app.use('/api/drivers',  driversRouter);  // B5
// app.use('/api/trips',         tripsRouter)        ← B6
// app.use('/api/maintenance',   maintenanceRouter)  ← B6
// app.use('/api/financial',     financialRouter)    ← B7
// app.use('/api/weather',       weatherRouter)      ← B8
// app.use('/api/notifications', notificationRouter) ← B8
// app.use('/api/dashboard',     dashboardRouter)    ← B9

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  sendSuccess(res, { status: 'ok', timestamp: new Date() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  sendError(res, notFound('Route not found'));
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  sendError(res, err);
});

export default app;
