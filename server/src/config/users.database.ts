import { Sequelize } from 'sequelize';
import { DB_USERS_STORAGE } from "./index"

export const sequelizeUsers = new Sequelize({
  dialect: 'sqlite',
  storage: DB_USERS_STORAGE,
  logging: false, // або true, якщо хочеш логи запитів
});
