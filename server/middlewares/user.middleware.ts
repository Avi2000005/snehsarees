import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';
import jwt from 'jsonwebtoken';

export interface UserRequest extends Request {
  user?: {
    id: number;
    phone: string;
    role?: string;
  };
}

export const userMiddleware = (req: UserRequest, res: Response, next: NextFunction) => {
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

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in to place orders.' });
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
    if (decoded && (decoded.userId || decoded.role === 'admin')) {
      req.user = {
        id: decoded.userId || 0,
        phone: decoded.phone || '',
        role: decoded.role || 'user',
      };
      return next();
    }
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  return res.status(401).json({ error: 'Authentication required. Please sign in to place orders.' });
};

export const optionalUserMiddleware = (req: UserRequest, res: Response, next: NextFunction) => {
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
      if (decoded && decoded.userId) {
        req.user = {
          id: decoded.userId,
          phone: decoded.phone,
        };
      }
    } catch {
      // Ignored for optional middleware
    }
  }

  return next();
};
