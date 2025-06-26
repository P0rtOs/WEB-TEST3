import { Request, Response, NextFunction } from 'express';
import { registerUserSchema, loginUserSchema } from '../schemas/user';

export function validateRegisterUser(req: Request, res: Response, next: NextFunction): void {
  const result = registerUserSchema.safeParse(req.body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      if (err.path && err.path.length > 0) {
        fields[err.path[0]] = err.message;
      }
    });

    res.status(200).json({
      status: 0,
      error: {
        fields,
        code: result.error.errors[0]?.code || "VALIDATION_ERROR"
      }
    });
    return;
  }

  const { confirmPassword, ...cleanData } = result.data;
  req.body = cleanData;
  next();
}

export function validateLoginUser(req: Request, res: Response, next: NextFunction): void {
  const result = loginUserSchema.safeParse(req.body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      if (err.path && err.path.length > 0) {
        fields[err.path[0]] = err.message;
      }
    });
    res.status(200).json({
      status: 0,
      error: {
        fields,
        code: result.error.errors[0]?.code || "VALIDATION_ERROR"
      }
    });
    return;
  }

  req.body = result.data;
  next();
}
