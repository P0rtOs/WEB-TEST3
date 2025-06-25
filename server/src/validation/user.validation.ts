import { Request, Response, NextFunction } from 'express';
import { registerUserSchema, loginUserSchema } from '../schemas/user';

export function validateRegisterUser(req: Request, res: Response, next: NextFunction): void {
  const result = registerUserSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.errors });
    return;
  }

  const { confirmPassword, ...cleanData } = result.data;  // видаляємо confirmPassword, бо далі він ен потрібен

  req.body = cleanData;
  next();
}


export function validateLoginUser(req: Request, res: Response, next: NextFunction): void {
  const result = loginUserSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.errors });
    return;
  }

  req.body = result.data;
  next();
}
