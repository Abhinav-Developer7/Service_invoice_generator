import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedAdminIfEmpty } from './services/authService.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Attempt DB connection
    await connectDB();
    // Seed initial admin if database is empty
    await seedAdminIfEmpty();
  } catch (error) {
    console.warn('[Warning] Starting server without active MongoDB connection (DB will retry on query):', error.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`[Server] Invoice Generator Backend listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Graceful shutdown handling
  const shutdown = (signal) => {
    console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();

