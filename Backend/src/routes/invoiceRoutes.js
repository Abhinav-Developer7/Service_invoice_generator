import { Router } from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoice,
  updateStatus,
  deleteInvoice,
} from '../controllers/invoiceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createInvoiceSchema,
  updateInvoiceStatusSchema,
  listInvoicesQuerySchema,
} from '../validators/invoiceValidator.js';

const router = Router();

// Protect all invoice endpoints
router.use(requireAuth);

router.post('/', validateRequest(createInvoiceSchema), createInvoice);
router.get('/', validateRequest(listInvoicesQuerySchema, 'query'), getInvoices);
router.get('/:id', getInvoice);
router.patch('/:id/status', validateRequest(updateInvoiceStatusSchema), updateStatus);
router.delete('/:id', deleteInvoice);

export default router;

