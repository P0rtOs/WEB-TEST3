import { z } from 'zod';

const passwordPattern = /^[a-zA-Z0-9]+$/;

export const registerUserSchema = z.object({
  email: z.string()
    .email('Invalid email address'),
  name: z.string()
    .min(1, 'Name is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
    .min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const loginUserSchema = z.object({
  email: z.string()
    .email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
});
