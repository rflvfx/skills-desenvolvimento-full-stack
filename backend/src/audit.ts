import { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma';
import jwt from 'jsonwebtoken';

export async function audit(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  res.send = function (body: any) {
    res.send = originalSend;
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        userId = decoded.userId;
      } catch { }
    }
    if (!['GET', 'OPTIONS'].includes(req.method)) {
      prisma.auditLog.create({
        data: {
          action: req.method,
          resource: req.originalUrl,
          userId,
          ip: req.ip,
          metadata: JSON.stringify({ body: req.body })
        }
      }).catch(() => null);
    }
    return res.send(body);
  };
  next();
}
