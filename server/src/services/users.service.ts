import bcrypt from 'bcrypt';
import { CreateUserSafeDTO } from '../types/user';
import { UserModel } from '../models/users.model';
import { serviceLogger } from '../utils/logger';

const SALT_ROUNDS = 10;
const prefix = '[UserService]';

const userService = {
  async createUser(data: CreateUserSafeDTO) {
    serviceLogger.info(`${prefix} Creating user with email: ${data.email}`);

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await UserModel.create({
      email: data.email,
      name: data.name,
      passwordHash,
    });

    serviceLogger.info(`${prefix} User "${data.email}" created successfully.`);

    return user;
  },

  async getUserByEmail(email: string) {
    serviceLogger.debug(`${prefix} Looking up user by email: ${email}`);
    const user = await UserModel.findByEmail(email);

    if (user) {
      serviceLogger.info(`${prefix} User found: ${email}`);
    } else {
      serviceLogger.warn(`${prefix} User not found: ${email}`);
    }

    return user;
  },

  // Тут будуть інші CRUD операції: наприклад оновлення, видалення
  // Але по ТЗ цього немає
};

export default userService;
