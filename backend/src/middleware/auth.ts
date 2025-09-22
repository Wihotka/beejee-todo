import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { AuthUser } from '../types';

interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number; username: string };
    
    // Verify admin user still exists
    const result = await pool.query('SELECT id FROM admin_users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    req.user = { id: decoded.userId, username: decoded.username };
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
