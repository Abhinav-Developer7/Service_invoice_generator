import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .transform((val) => val.trim().toLowerCase())
    .pipe(z.string().email('Please provide a valid email address')),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
});

export const createUserSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).trim().min(2),
  email: z
    .string({ required_error: 'Email is required' })
    .transform((val) => val.trim().toLowerCase())
    .pipe(z.string().email('Please provide a valid email address')),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'manager', 'viewer']).optional(),
});

