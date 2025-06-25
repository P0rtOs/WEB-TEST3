import { Sequelize } from 'sequelize';

const dbPath = process.env.DB_USERS_STORAGE || './database/users.sqlite';

export const sequelizeUsers = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // або true, якщо хочеш логи запитів
});
