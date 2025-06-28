import { Sequelize } from 'sequelize';
import { DB_MOVIES_STORAGE } from "./index";
import { sequelizeLogger } from '../utils/logger';

export const sequelizeMovies = new Sequelize({
  dialect: 'sqlite',
  storage: DB_MOVIES_STORAGE,
  logging: (msg: string) => sequelizeLogger.debug(`[Sequelize-MOVIES] ${msg}`),
});
