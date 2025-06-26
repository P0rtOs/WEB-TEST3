import dotenv from 'dotenv';
dotenv.config();

export const APP_PORT = process.env.APP_PORT!;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN!);
export const DB_MOVIES_STORAGE = process.env.DB_MOVIES_STORAGE!;
export const DB_USERS_STORAGE = process.env.DB_USERS_STORAGE!;