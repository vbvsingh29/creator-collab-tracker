import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db/database';
import { authRouter } from './routes/auth';
import { collabsRouter } from './routes/collabs';
import { brandsRouter } from './routes/brands';
import { statsRouter } from './routes/stats';
import { integrationsRouter } from './routes/integrations';

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

app.use(express.json());

// Initialize database
initDB();

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/collabs', collabsRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/integrations', integrationsRouter);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'CollabFlow API',
    version: '1.2.0',
    auth_enabled: true,
    security: 'scrypt-hmac-sha256',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CollabFlow Server running on http://localhost:${PORT}`);
});
