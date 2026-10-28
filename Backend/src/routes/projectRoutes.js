import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
} from '../validators/projectValidator.js';

const router = Router();

// Protect all project endpoints
router.use(requireAuth);

router.post('/', validateRequest(createProjectSchema), createProject);
router.get('/', validateRequest(listProjectsQuerySchema, 'query'), getProjects);
router.get('/:id', getProject);
router.patch('/:id', validateRequest(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

export default router;

