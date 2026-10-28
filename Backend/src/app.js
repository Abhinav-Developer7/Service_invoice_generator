import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { sendSuccess } from './utils/response.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
const clientUrl = process.env.CLIENT_URL?.replace(/\/+$/, '');

const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Allow any local port (localhost or 127.0.0.1) or whitelisted origin
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocalhost || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked request from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


// Request body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Request logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint (for Phase 0 validation & monitoring)
app.get('/api/health', (req, res) => {
  return sendSuccess(res, 'Server is healthy and running', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Authentication routes (Phase 1)
app.use('/api/auth', authRoutes);

// Project management routes (Phase 2)
app.use('/api/projects', projectRoutes);

// Invoice routes (Phase 3)
app.use('/api/invoices', invoiceRoutes);

// Dashboard routes (Phase 7)
app.use('/api/dashboard', dashboardRoutes);

// Centralized 404 & error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;

