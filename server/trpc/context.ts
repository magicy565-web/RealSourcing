import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { prisma } from '../shared/prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const createContext = async ({ req, res }: CreateExpressContextOptions) => {
  // Extract user from JWT token
  let user = null;
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, role: true },
      });
    } catch (error) {
      // Invalid token, user remains null
    }
  }

  return {
    req,
    res,
    prisma,
    user,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
