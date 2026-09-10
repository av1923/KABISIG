import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import programRoutes from './routes/program.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import documentRoutes from './routes/document.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import barangayRoutes from './routes/barangay.routes.js';
import { supabase } from './services/supabase.service.js';
import { sendError, sendSuccess } from './utils/response.js';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Root Endpoint
app.get('/', (req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      service: 'KABISIG Backend API',
      status: 'active',
      endpoints: {
        health: '/api/health',
        dbCheck: '/api/db-check',
        auth: '/api/auth',
        barangays: '/api/barangays',
        programs: '/api/programs',
        budget: '/api/budget',
        feedback: '/api/feedback',
        documents: '/api/documents',
        analytics: '/api/analytics',
      },
    },
    'KABISIG: API Server'
  );
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/barangays', barangayRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check Routes
app.get('/api/health', (req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      service: 'KABISIG Backend API',
      status: 'healthy',
      uptime: process.uptime(),
      version: '1.0.0',
    },
    'KABISIG Backend API is operational.'
  );
});

// Database Connection Health Check
app.get('/api/db-check', async (req: Request, res: Response) => {
  const { error, count } = await supabase
    .from('barangay')
    .select('*', { count: 'exact', head: true });

  if (error) {
    sendError(
      res,
      'Failed to connect to Supabase PostgreSQL database',
      500,
      { error: error.message }
    );
    return;
  }

  sendSuccess(
    res,
    {
      total_count: count,
    },
    'Successfully connected to Supabase PostgreSQL database!'
  );
});

// 404 Fallback Route
app.use((req: Request, res: Response) => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found.`, 404);
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  sendError(res, message, status, err.details || null);
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`KABISIG Backend Server running on http://localhost:${PORT}`);
  console.log(`=======================================================`);
});

export default app;