import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';

interface TokenPayload {
  userId: number;
  email: string;
}

//Генерує JWT токен на основі payload
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

//Перевіряє токен і повертає payload
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

//Декодує токен
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token);
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'email' in decoded) {
      return decoded as TokenPayload;
    }
    return null;
  } catch (err) {
    return null;
  }
}
