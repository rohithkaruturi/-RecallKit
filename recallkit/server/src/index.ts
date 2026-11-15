import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import studyRoutes from './routes/studyRoutes';
import { studyRateLimiter } from './middleware/rateLimiter';
import { requestTimeout } from './middleware/timeout';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Security Headers via Helmet
app.use(helmet());

// 2. Cross-Origin Resource Sharing
const rawClientUrl = process.env.CLIENT_URL;
const allowedOrigins = rawClientUrl
  ? rawClientUrl.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Request-size limit (50kb prevents memory exhaustion)
app.use(express.json({ limit: '50kb' }));

// Root welcome endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    name: 'RecallKit API Server',
    status: 'running',
    healthCheck: '/api/health',
    endpoints: {
      health: 'GET /api/health',
      generate: 'POST /api/study/generate',
    },
  });
});

// 4. Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 5. Study Generator Endpoints (with rate limiting and timeout)
app.use('/api/study', studyRateLimiter, requestTimeout(45000), studyRoutes);

// 6. 404 Route Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    ok: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested API endpoint does not exist',
      retryable: false,
    },
  });
});

// 7. Standardized Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    ok: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred',
      retryable: true,
    },
  });
});

// Start listening only when run directly (allows supertest in tests)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 RecallKit server running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
