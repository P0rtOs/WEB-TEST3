import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { DB_MOVIES_STORAGE } from "./index"

export const sequelizeMovies = new Sequelize({
  dialect: 'sqlite',
  storage: DB_MOVIES_STORAGE,
  logging: false, // якщо треба — увімкни для дебагу SQL-запитів
});
