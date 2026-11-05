import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/security';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userHandle?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken<{
      userId: string;
      email: string;
      handle: string;
    }>(token);

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userHandle = decoded.handle;
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token. Please log in again.'
    });
  }
}
