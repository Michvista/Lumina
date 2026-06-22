import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { reportRouter } from './routes/reports';
import { markerRouter } from './routes/markers';
import { userRouter } from './routes/users';
import { audioRouter } from './routes/audio';
import { connectWithRetry, isDbConnected } from './lib/prisma';

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  const dbStatus = isDbConnected() ? 'connected' : 'disconnected';
  res.status(isDbConnected() ? 200 : 503).json({
    status: isDbConnected() ? 'ok' : 'degraded',
    service: 'lumina-api',
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/users', userRouter);
app.use('/api/reports', reportRouter);
app.use('/api/markers', markerRouter);
app.use('/api/audio', audioRouter);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`\n🌸 Lumina API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);

  // Test DB connection on startup; retries quietly in the background if it fails
  connectWithRetry();
});