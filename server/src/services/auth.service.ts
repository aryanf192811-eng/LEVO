import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { unauthorized, badRequest, notFound, conflict } from '../utils/errors';
import { generateOTP, getOTPExpiry } from '../utils/otp';
import { UserRole } from '@prisma/client';

export type SafeUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt?: Date;
};

// ── register ──────────────────────────────────────────────────────────────────
export const register = async (
  name: string,
  email: string,
  password: string,
  role: string
): Promise<{ step: 'OTP_REQUIRED'; email: string; devOtp?: string }> => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw conflict('Email already registered', 'EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, email, passwordHash, role: role as UserRole }
  });

  const code = generateOTP();
  const expiresAt = getOTPExpiry();

  await prisma.oTP.upsert({
    where: { email },
    update: { code, expiresAt },
    create: { email, code, expiresAt },
  });

  console.log(`\n[DEV] OTP for ${email} (Signup): ${code}\n`);

  const response: any = { step: 'OTP_REQUIRED', email };
  if (process.env.NODE_ENV !== 'production') {
    response.devOtp = code;
  }
  return response;
};

// ── login ─────────────────────────────────────────────────────────────────────
export const login = async (
  email: string,
  password: string,
): Promise<{ step: 'OTP_REQUIRED'; email: string; devOtp?: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw unauthorized('Invalid email or password');

  const code = generateOTP();
  const expiresAt = getOTPExpiry();

  await prisma.oTP.upsert({
    where: { email },
    update: { code, expiresAt },
    create: { email, code, expiresAt },
  });

  // CRITICAL: OTP is ONLY exposed here — never returned in the HTTP response
  console.log(`\n[DEV] OTP for ${email}: ${code}\n`);

  const response: any = { step: 'OTP_REQUIRED', email };
  if (process.env.NODE_ENV !== 'production') {
    response.devOtp = code;
  }
  return response;
};

// ── forgotPassword ──────────────────────────────────────────────────────────
export const forgotPassword = async (
  email: string,
): Promise<{ step: 'OTP_REQUIRED'; email: string; devOtp?: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw notFound('User not found');

  const code = generateOTP();
  const expiresAt = getOTPExpiry();

  await prisma.oTP.upsert({
    where: { email },
    update: { code, expiresAt },
    create: { email, code, expiresAt },
  });

  const response: any = { step: 'OTP_REQUIRED', email };
  if (process.env.NODE_ENV !== 'production') {
    response.devOtp = code;
  }
  return response;
};

// ── verifyOTP ─────────────────────────────────────────────────────────────────
export const verifyOTP = async (
  email: string,
  code: string,
): Promise<{ user: SafeUser; token: string }> => {
  const otp = await prisma.oTP.findUnique({ where: { email } });
  if (!otp) throw badRequest('No OTP requested for this email', 'OTP_INVALID');

  if (otp.expiresAt < new Date()) {
    throw badRequest('OTP has expired. Please login again.', 'OTP_EXPIRED');
  }

  if (otp.code !== code) {
    throw badRequest('Invalid OTP', 'OTP_INVALID');
  }

  await prisma.oTP.delete({ where: { email } });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw unauthorized('User not found');

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN as any },
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
};

// ── getMe ─────────────────────────────────────────────────────────────────────
export const getMe = async (userId: number): Promise<SafeUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!user) throw notFound('User not found');
  return user;
};
