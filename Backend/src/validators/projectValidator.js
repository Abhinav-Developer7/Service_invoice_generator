import { z } from 'zod';

export const createProjectSchema = z
  .object({
    projectCode: z
      .string({ required_error: 'Project code is required' })
      .trim()
      .toUpperCase()
      .min(2, 'Project code must be at least 2 characters')
      .max(20, 'Project code cannot exceed 20 characters')
      .regex(
        /^[A-Z0-9_-]+$/,
        'Project code can only contain uppercase letters, numbers, hyphens, and underscores'
      ),
    name: z
      .string({ required_error: 'Project name is required' })
      .trim()
      .min(2, 'Project name must be at least 2 characters')
      .max(150, 'Project name cannot exceed 150 characters'),
    clientName: z
      .string({ required_error: 'Client name is required' })
      .trim()
      .min(2, 'Client name must be at least 2 characters')
      .max(100, 'Client name cannot exceed 100 characters'),
    clientEmail: z
      .string({ required_error: 'Client email is required' })
      .transform((val) => val.trim().toLowerCase())
      .pipe(z.string().email('Please provide a valid client email address')),
    clientPhone: z
      .string()
      .trim()
      .refine((val) => !val || /^[0-9]{10}$/.test(val), {
        message: 'Client phone number must be exactly 10 digits',
      })
      .optional()
      .default(''),
    clientAddress: z.string().trim().optional().default(''),
    clientTaxId: z.string().trim().optional().default(''),
    description: z.string().trim().optional().default(''),
    serviceType: z.string().trim().optional().default('General Service'),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    status: z.enum(['planned', 'active', 'completed', 'on_hold', 'archived']).optional().default('active'),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(2).max(150).optional(),
    clientName: z.string().trim().min(2).max(100).optional(),
    clientEmail: z
      .string()
      .transform((val) => val.trim().toLowerCase())
      .pipe(z.string().email())
      .optional(),
    clientPhone: z
      .string()
      .trim()
      .refine((val) => !val || /^[0-9]{10}$/.test(val), {
        message: 'Client phone number must be exactly 10 digits',
      })
      .optional(),
    clientAddress: z.string().trim().optional(),
    clientTaxId: z.string().trim().optional(),
    description: z.string().trim().optional(),
    serviceType: z.string().trim().optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    status: z.enum(['planned', 'active', 'completed', 'on_hold', 'archived']).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
});

