import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/TokenFunctions';
import userService from '../services/users.service';

export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.headers['authorization']?.toString() || null;

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
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(200).json({
      status: 0,
      error: {
        fields: {
          token: "INVALID"
        },
        code: "INVALID_TOKEN"
      }
    });
    return;
  }

  try {
    const existingUser = await userService.getUserByEmail(decoded.email);
    if (!existingUser) {
      res.status(200).json({
        status: 0,
        error: {
          fields: {
            token: "INVALID"
          },
          code: "INVALID_TOKEN"
        }
      });
      return;
    }

    // Можна додати user у req для подальшого використання
    // req.user = existingUser;

    next();
  } catch (err) {
    res.status(200).json({
      status: 0,
      error: {
        fields: {
          token: "INVALID"
        },
        code: "INVALID_TOKEN"
      }
    });
  }
}
