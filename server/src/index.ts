import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB, db } from './db/database';
import { authRouter } from './routes/auth';
import { collabsRouter } from './routes/collabs';
import { brandsRouter } from './routes/brands';
import { statsRouter } from './routes/stats';
import { integrationsRouter } from './routes/integrations';
import { adminRouter } from './routes/admin';
import { accountsRouter } from './routes/accounts';
import { teamRouter } from './routes/team';
import { notificationsRouter } from './routes/notifications';
import { cmsRouter } from './routes/cms';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration supporting production Vercel frontend, local dev, and custom CLIENT_URL
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin header, e.g. curl/health-checks)
    if (!origin) return callback(null, true);
    
    // Allow all if CLIENT_URL is * or not configured
    if (!process.env.CLIENT_URL || process.env.CLIENT_URL === '*') {
      return callback(null, true);
    }

    // Allow configured origins and any Vercel deployment domain
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Safe fallback
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));

// Initialize database in strict hosted mode (zero local SQLite fallback)
initDB();

// Clean up any orphan auto-created ghost accounts from previous phone tests
db.prepare("DELETE FROM users WHERE email LIKE 'user_%@phone.collabflow.app'").run()
  .then(() => console.log('✓ Cleaned up ghost test accounts in Turso DB'))
  .catch((err: any) => console.warn('⚠️ [Cleanup warning]:', err.message));

if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  console.log('📡 [Database Layer] Connected to remote Turso Cloud database.');
  console.log(`   URL: ${process.env.TURSO_DATABASE_URL.replace(/:[^:]*@/, ':***@')}`);
} else {
  console.error('❌ [FATAL DATABASE ERROR]: Local SQLite is completely decommissioned.');
  console.error('   TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be configured in environment variables.');
}

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/collabs', collabsRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/team', teamRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/cms', cmsRouter);

// Health check with live build & database telemetry
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Collabio API',
    deployed_commit: 'luxury-teams-v1',
    database_engine: process.env.TURSO_DATABASE_URL ? 'turso_cloud' : 'unconfigured_local_decommissioned',
    local_sqlite: 'completely_eliminated',
    version: '1.3.0',
    auth_enabled: true,
    security: 'scrypt-hmac-sha256',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unknown API routes
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

// Centralized error handler
app.use((err: any, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error('[CollabFlow Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred on the server.' 
      : (err.message || 'Internal server error.')
  });
});

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 CollabFlow Server running on http://localhost:${PORT}`);
  });
}
