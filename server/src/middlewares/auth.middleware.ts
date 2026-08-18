import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from "@prisma/client";
import { config } from "@/config";


export interface UserJwtPayload {
  id: string;
  email: string;
}

const prisma = new PrismaClient();

const validateJWT = (token: string) => {
  if (!token) {
    return { success: false, message: 'Auth Token Not Provided' };
  }
  try {
    const payload = jwt.verify(token, config.auth.jwtSecret) as UserJwtPayload;
    return { success: true, payload };
  } catch (ex) {
    return { success: false, message: 'Invalid or expired token' };
  }
}

export const verifyUser = (...roles: (UserRole | 'ALL')[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let token;
    // if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    // }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Auth Token Not Provided' });
    }
    const payloadObj = validateJWT(token);
    if (!payloadObj.success) {
      return res.status(401).json({ success: false, message: payloadObj.message });
    }
    if (!payloadObj.payload) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const userId = payloadObj.payload.id;
    req.user = payloadObj.payload;

    // Role checks 
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Please contact support.' });
    }

    let hasRole = false;

    // Check if 'ALL' is in the roles
    if (roles.includes('ALL')) {
      hasRole = true;
    } else {
      // Check if user's role matches any of the provided roles
      hasRole = roles.includes(user.role as UserRole);
    }

    if (!hasRole) {
      console.log(hasRole);
      return res.status(403).json({ success: false, message: 'User Verification Failed' });
    }

    return next();
  }
}

/**
 * Optional auth: populates req.user if a valid Bearer token is present,
 * but never blocks the request if the token is absent or invalid.
 */
export const optionalAuth: RequestHandler = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payloadObj = validateJWT(token);
    if (payloadObj.success && payloadObj.payload) {
      const user = await prisma.user.findUnique({ where: { id: payloadObj.payload.id } });
      if (user && !user.isBlocked) {
        req.user = payloadObj.payload;
        (req as any).userRole = user.role;
      }
    }
  }
  return next();
}