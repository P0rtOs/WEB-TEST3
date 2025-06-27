import { Request, Response, NextFunction } from 'express';
import { createMovieSchema, updateMovieSchema } from '../schemas/movie';

export function validateCreateMovie(req: Request, res: Response, next: NextFunction): void {
  const result = createMovieSchema.safeParse(req.body);

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


export function validateUpdateMovie(req: Request, res: Response, next: NextFunction): void {
  const result = updateMovieSchema.safeParse(req.body);

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

