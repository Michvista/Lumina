import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Reuse the same instance in dev to avoid connection pool exhaustion on hot reload
export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

const RETRY_DELAY_MS = 3000;
let isConnected = false;

/**
 * Attempts to connect to the database, logging clearly on success/failure.
 * If it fails (e.g. network drop, Neon cold start), keeps retrying quietly
 * in the background every RETRY_DELAY_MS until it succeeds.
 */
export async function connectWithRetry(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    isConnected = true;
    console.log('✅ Database connected\n');
  } catch (err: any) {
    isConnected = false;
    console.error(`❌ Database connection failed: ${err.message?.split('\n')[0] ?? err.message}`);
    console.log(`   Retrying in ${RETRY_DELAY_MS / 1000}s...\n`);

    setTimeout(connectWithRetry, RETRY_DELAY_MS);
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}