/**
 * otp.store.ts — In-memory OTP store with auto-expiry
 * Stores email → { otp, expiresAt } mappings for 10 minutes.
 */

interface OtpEntry {
  otp: string;
  expiresAt: number; // Unix timestamp in ms
}

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const store = new Map<string, OtpEntry>();

/** Generate a 6-digit numeric OTP and persist it for the given email */
export function generateAndStoreOtp(email: string): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  store.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
  return otp;
}

/** Verify OTP for an email. Returns true and clears entry on success. */
export function verifyOtp(email: string, otp: string): boolean {
  const entry = store.get(email.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(email.toLowerCase());
    return false;
  }
  if (entry.otp !== otp.trim()) return false;
  store.delete(email.toLowerCase()); // Single-use
  return true;
}

/** Check if OTP is currently pending for an email (without consuming it) */
export function hasOtp(email: string): boolean {
  const entry = store.get(email.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(email.toLowerCase());
    return false;
  }
  return true;
}

/** Manually clear OTP for an email */
export function clearOtp(email: string): void {
  store.delete(email.toLowerCase());
}
