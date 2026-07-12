export const generateOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const getOTPExpiry = (): Date =>
  new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
