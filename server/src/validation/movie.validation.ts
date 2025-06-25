import { Request, Response, NextFunction } from 'express';
import { createMovieSchema, updateMovieSchema } from '../schemas/movie';

export function validateCreateMovie(req: Request, res: Response, next: NextFunction): void {
  const result = createMovieSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.errors });
    return;
  }

  req.body = result.data;
  next();
}

export function validateUpdateMovie(req: Request, res: Response, next: NextFunction): void {
  const result = updateMovieSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.errors });
    return;
  }

  req.body = result.data;
  next();
}
