import { Router } from 'express';
import { login, logout, getMe, setupSeed } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { loginSchema } from '../validators/authValidator.js';

const router = Router();

// Public routes
router.post('/login', validateRequest(loginSchema), login);
router.post('/seed', setupSeed); // Helper to seed initial admin on first run

// Protected routes
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);

export default router;

