import { Request, Response, NextFunction } from 'express';
import userService from '../services/users.service';
import { generateToken } from '../utils/TokenFunctions';
import bcrypt from 'bcrypt';

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

      const token = generateToken({ userId: user.id, email: user.email });

      res.status(200).json({ token: token, status: 1 });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await userService.getUserByEmail(email);

      if (user) {
        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (passwordValid) {
          const token = generateToken({ userId: user.id, email: user.email });
          res.json({ token: token, status: 1 });
          return;
        }
      }

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

    } catch (error) {
      next(error);
    }
  },
};
