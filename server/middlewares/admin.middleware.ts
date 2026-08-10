import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';
import jwt from 'jsonwebtoken';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. Support direct CLI testing via header key
  const adminKey = req.headers['x-admin-key'];
  if (adminKey && adminKey === ENV.ADMIN_SECRET) {
    return next();
  }

  // 2. Support JWT session token (Cookie first, fallback to Auth Header)
  let token: string | undefined = undefined;

  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc: any, c) => {
      const [name, val] = c.trim().split('=');
      if (name && val) acc[name] = decodeURIComponent(val);
      return acc;
    }, {});
    if (cookies.token) {
      token = cookies.token;
    }
  }

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
      if (decoded && decoded.role === 'admin') {
        return next();
      }
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized. Invalid or expired admin token.' });
    }
  }

  return res.status(401).json({ error: 'Unauthorized. Admin credentials invalid or missing.' });
};
