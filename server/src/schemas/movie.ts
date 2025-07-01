import { z } from 'zod';

const currentYear = new Date().getFullYear();

// Прибирає зайві пробіли на початку/в кінці та дабл-пробіли всередині
const normalizeString = (str: string) => str.trim().replace(/\s{2,}/g, ' ');

// Універсальна перевірка рядка: чистий, не пустий, не один пробіл
const nonEmptyCleanString = (fieldName: string) =>
  z
    .string()
    .transform(normalizeString)
    .refine(val => val.length > 0, { message: `${fieldName} cannot be empty` })
    .refine(val => val !== ' ', { message: `${fieldName} cannot be a single space` });

// Додатково для акторів: тільки літери (лат + укр), цифри, пробіли, -, , і .
const nonEmptyCleanActorName = (fieldName: string) =>
  nonEmptyCleanString(fieldName).refine(
    val => /^[A-Za-zА-Яа-яІіЇїЄєҐґ0-9\s\-,.]+$/.test(val), //Тут вказані дозволені символи
    {
      message: `${fieldName} can contain only letters, spaces, and - , .`,
    }
  );

// Схема створення фільму
export const createMovieSchema = z.object({
  title: nonEmptyCleanString('Title'),

  year: z
    .number({
      required_error: 'YEAR_REQUIRED',
      invalid_type_error: 'INVALID_YEAR',
    })
    .int('INVALID_YEAR')
    .min(1878, 'Year must be after 1878')
    .max(currentYear + 9, `Year can't be in the future`),

  format: z.enum(['VHS', 'DVD', 'Blu-ray'], {
    required_error: 'Format is required',
    invalid_type_error: 'Invalid format',
  }),

  actors: z.array(nonEmptyCleanActorName('Actor name')),
});

// Часткова схема для оновлення фільму (всі поля необов'язкові)
export const updateMovieSchema = createMovieSchema.partial();

// Типи для DTO
export type CreateMovieDto = z.infer<typeof createMovieSchema>;
export type UpdateMovieDto = z.infer<typeof updateMovieSchema>;
