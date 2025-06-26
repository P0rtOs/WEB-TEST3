import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config/index"

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader ? authHeader.toString() : null;  // беремо весь заголовок як токен

  if (!token) {
    res.status(200).json({
      status: 0,
      error: {
        fields: {
          token: "REQUIRED"
        },
        code: "FORMAT_ERROR"
      }
    });
    return
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
        res.status(200).json({
        status: 0,
        error: {
          fields: {
            token: "INVALID"
          },
          code: "INVALID_TOKEN"
        }
      });
      return
    }
    // Передавання даних про юзера далі — наразі не потрібно
    // req.user = user;

    next();
  });
}
