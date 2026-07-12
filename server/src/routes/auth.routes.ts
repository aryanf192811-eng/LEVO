import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { login, verifyOTP, getMe } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { badRequest } from '../utils/errors';

const router = Router();

// ── POST /login ───────────────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, badRequest(errors.array()[0].msg));
    }
    try {
      const result = await login(req.body.email, req.body.password);
      sendSuccess(res, result, 'OTP sent to registered email. Check server console.');
    } catch (err) {
      sendError(res, err);
    }
  },
);

// ── POST /verify-otp ──────────────────────────────────────────────────────────
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('code')
      .isString()
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('OTP must be a 6-digit code'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, badRequest(errors.array()[0].msg));
    }
    try {
      const { user, token } = await verifyOTP(req.body.email, req.body.code);

      // httpOnly cookie for browser clients
      res.cookie('token', token, {
        httpOnly: true,
        secure: false,        // set true behind HTTPS in prod
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Raw header for Postman testing without cookie support
      res.setHeader('X-Auth-Token', token);

      sendSuccess(res, { user }, 'Login successful');
    } catch (err) {
      sendError(res, err);
    }
  },
);

// ── POST /logout ──────────────────────────────────────────────────────────────
router.post('/logout', authenticate, (_req, res) => {
  res.clearCookie('token');
  sendSuccess(res, null, 'Logged out successfully');
});

// ── GET /me ───────────────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await getMe(req.user!.id);
    sendSuccess(res, user);
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
