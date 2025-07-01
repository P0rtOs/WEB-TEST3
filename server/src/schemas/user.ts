import { z } from 'zod';

// Нормалізує рядок: трім і заміна дабл-пробілів
const normalizeString = (str: string) => str.trim().replace(/\s{2,}/g, ' ');

// Перевірка на непусті строки з очищенням
const nonEmptyCleanString = (fieldName: string) =>
  z
    .string()
    .refine(val => val.trim().replace(/\s{2,}/g, ' ').length > 0, {
      message: `${fieldName} is required`,
    })
    .refine(val => val.trim() !== ' ', {
      message: `${fieldName} cannot be a single space`,
    })
    .transform(normalizeString);

// Пароль — без пробілів, мінімум 6 символів
const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .refine(val => !/\s/.test(val), { message: 'Password cannot contain spaces' });

// Email — валідний формат, очищення після перевірки
const emailSchema = z
  .string()
  .email('Invalid email address')
  .transform(normalizeString);

// Схема реєстрації
export const registerUserSchema = z
  .object({
    email: emailSchema,
    name: nonEmptyCleanString('Name'),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// 🔐 Схема логіну
export const loginUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
