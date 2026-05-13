import jwt from 'jsonwebtoken';
import type { Response, NextFunction } from 'express';

const DEFAULT_SECRET = 'dragonz-secret-key-change-in-production';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: JWT_SECRET must be set in production. Refusing to use default.');
      process.exit(1);
    }
    console.warn('[WARN] JWT_SECRET not set — using default. Set JWT_SECRET in production!');
  }
  return secret || DEFAULT_SECRET;
}

export function authMiddleware(req: any, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.admin = jwt.verify(token, getJwtSecret());
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function generateToken(payload: object) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '24h' });
}
