import { Sequelize } from 'sequelize';
import { DB_USERS_STORAGE } from "./index"
import { sequelizeLogger } from '../utils/logger';

export const sequelizeUsers = new Sequelize({
  dialect: 'sqlite',
  storage: DB_USERS_STORAGE,
  logging: (msg: string) => sequelizeLogger.debug(`[Sequelize-USERS] ${msg}`),
});
