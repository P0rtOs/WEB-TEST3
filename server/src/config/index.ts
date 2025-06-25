import dotenv from 'dotenv';
dotenv.config();

export const APP_PORT = process.env.APP_PORT!;
export const JWT_SECRET = process.env.JWT_SECRET! as string;
export const DB_STORAGE = process.env.DB_STORAGE!;
export const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN!);