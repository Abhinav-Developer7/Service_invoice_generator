import { Router } from 'express';
import { getSummary } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Protect dashboard endpoints
router.use(requireAuth);

router.get('/summary', getSummary);

export default router;

