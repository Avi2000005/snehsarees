import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';

interface AttemptRecord {
  count: number;
  resetTime: number;
}

const loginAttempts = new Map<string, AttemptRecord>();

export const loginRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const clientIp = Array.isArray(ip) ? ip[0] : String(ip);

  const windowMs = ENV.LOGIN_LIMIT_WINDOW_MS;
  const maxAttempts = ENV.LOGIN_LIMIT_MAX;

  const now = Date.now();
  const record = loginAttempts.get(clientIp);

  if (!record) {
    loginAttempts.set(clientIp, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (now > record.resetTime) {
    loginAttempts.set(clientIp, { count: 1, resetTime: now + windowMs });
    return next();
  }

  record.count += 1;

  if (record.count > maxAttempts) {
    const secondsLeft = Math.ceil((record.resetTime - now) / 1000);
    return res.status(429).json({
      error: `Too many login attempts from this IP. Please try again after ${secondsLeft} seconds.`
    });
  }

  next();
};
