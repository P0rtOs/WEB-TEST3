import { Request, Response, NextFunction } from 'express';
import userService from '../services/users.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/index"

export default {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, name, password } = req.body;

      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        res.status(200).json({
          status: 0,
          error: {
            fields: {
              email: 'NOT_UNIQUE',
            },  
            code: 'EMAIL_NOT_UNIQUE',
          },
        });
        return;
      }

      const user = await userService.createUser({ email, name, password });

      // 🔐 Генеруємо токен після успішної реєстрації
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(200).json({ token, status: 1 });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await userService.getUserByEmail(email);
      if (!user) {
        res.status(200).json({
          status: 0,
          error: {
            fields: {
              email: 'AUTHENTICATION_FAILED',
              password: 'AUTHENTICATION_FAILED',
            },
            code: 'AUTHENTICATION_FAILED',
          },
        });
        return;
      }

      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        res.status(200).json({
          status: 0,
          error: {
            fields: {
              email: 'AUTHENTICATION_FAILED',
              password: 'AUTHENTICATION_FAILED',
            },
            code: 'AUTHENTICATION_FAILED',
          },
        });
        return;
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN  }
      );

      res.json({ token, status: 1 });
    } catch (error) {
      next(error);
    }
  },
};




