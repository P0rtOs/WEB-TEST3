import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DB_MOVIES_STORAGE || './database/movies.sqlite';

export const sequelizeMovies = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // якщо треба — увімкни для дебагу SQL-запитів
});
