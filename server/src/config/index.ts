import dotenv from 'dotenv';
dotenv.config();

export const APP_PORT = process.env.APP_PORT!;

export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN!);

export const DB_MOVIES_STORAGE = process.env.DB_MOVIES_STORAGE!;
export const DB_USERS_STORAGE = process.env.DB_USERS_STORAGE!;

export const IS_EXPRESS_LOGGER_ON = process.env.IS_EXPRESS_LOGGER_ON!;
export const EXPRESS_LOG_TO_CONSOLE = process.env.EXPRESS_LOG_TO_CONSOLE!;

export const IS_SEQUELIZE_LOGGER_ON = process.env.IS_SEQUELIZE_LOGGER_ON!;
export const SEQUELIZE_LOG_TO_CONSOLE = process.env.SEQUELIZE_LOG_TO_CONSOLE!;

export const IS_SERVICE_LOGGER_ON = process.env.IS_SERVICE_LOGGER_ON!;
export const SERVICE_LOG_TO_CONSOLE = process.env.SERVICE_LOG_TO_CONSOLE!;
