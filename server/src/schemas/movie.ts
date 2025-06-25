import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const createMovieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  year: z
    .number({
      required_error: 'Year is required',
      invalid_type_error: 'Year must be a number',
    })
    .int('Year must be an integer')
    .min(1878, 'Year must be after 1878') // перший фільм — 1878
    .max(currentYear, `Year can't be in the future`),
  format: z.enum(['VHS', 'DVD', 'Blu-ray'], {
    required_error: 'Format is required',
    invalid_type_error: 'Invalid format',
  }),
  actors: z
    .array(z.string().min(1, 'Actor name cannot be empty'))
    .min(1, 'At least one actor is required'),
});

export const updateMovieSchema = createMovieSchema.partial();

export type CreateMovieDto = z.infer<typeof createMovieSchema>;
export type UpdateMovieDto = z.infer<typeof updateMovieSchema>;
