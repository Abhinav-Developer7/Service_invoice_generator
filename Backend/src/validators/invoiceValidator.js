import { z } from 'zod';

const itemSchema = z.object({
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(1, 'Description cannot be empty'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0').default(1),
  unitPrice: z.coerce.number().min(0, 'Unit price cannot be negative').default(0),
});

const clientSnapshotSchema = z.object({
  name: z.string({ required_error: 'Client name is required' }).trim().min(1),
  email: z
    .string({ required_error: 'Client email is required' })
    .transform((val) => val.trim().toLowerCase())
    .pipe(z.string().email('Please enter a valid client email')),
  phone: z.string().trim().optional().default(''),
  address: z.string().trim().optional().default(''),
  taxId: z.string().trim().optional().default(''),
});

const companySnapshotSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  taxId: z.string().trim().optional(),
  currency: z.string().trim().optional().default('INR'),
});

export const createInvoiceSchema = z.object({
  projectId: z.string().optional().nullable(),
  projectName: z.string().trim().optional(),
  client: clientSnapshotSchema,
  company: companySnapshotSchema.optional(),
  items: z.array(itemSchema).min(1, 'At least one line item is required'),
  discount: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).default(0),
  currency: z.string().trim().default('INR'),
  status: z.enum(['draft', 'issued']).optional().default('issued'),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().trim().optional().default(''),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['draft', 'issued', 'paid', 'overdue', 'cancelled'], {
    required_error: 'Status is required',
  }),
});

export const listInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
});

