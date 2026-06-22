import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { prisma } from '../lib/prisma';

export const userRouter = Router();

/**
 * POST /api/users/session
 * Create or retrieve a guest user by sessionId (stored in client localStorage).
 */
userRouter.post(
  '/session',
  asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.body as { sessionId?: string };

    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).json({ error: 'sessionId is required' });
      return;
    }

    const user = await prisma.user.upsert({
      where: { sessionId },
      update: {},
      create: { sessionId },
    });

    res.json({ user });
  }),
);

import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * POST /api/users/signup
 * Register a user or link current anonymous session to an email and password.
 */
userRouter.post(
  '/signup',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, sessionId } = req.body as { email?: string; password?: string; sessionId?: string };

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = hashPassword(password);

    // Check if email already registered
    const existing = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (existing) {
      res.status(400).json({ error: 'Email is already registered' });
      return;
    }

    let user: any;

    if (sessionId) {
      // Find guest user and upgrade to registered
      const guest = await prisma.user.findUnique({
        where: { sessionId },
      });

      if (guest && !(guest as any).email) {
        user = await prisma.user.update({
          where: { sessionId },
          data: {
            email: normalizedEmail,
            password: hashedPassword,
          } as any,
        });
      }
    }

    if (!user) {
      // Create new registered user
      const newSessionId = 'sess_' + crypto.randomBytes(16).toString('hex');
      user = await prisma.user.create({
        data: {
          sessionId: newSessionId,
          email: normalizedEmail,
          password: hashedPassword,
        } as any,
      });
    }

    res.json({
      message: 'Signup successful',
      user: {
        id: user.id,
        sessionId: user.sessionId,
        email: user.email,
      },
    });
  }),
);

/**
 * POST /api/users/login
 * Authenticate user and return their sessionId to sync the client.
 */
userRouter.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = hashPassword(password);

    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        password: hashedPassword,
      } as any,
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        sessionId: user.sessionId,
        email: (user as any).email,
      },
    });
  }),
);
