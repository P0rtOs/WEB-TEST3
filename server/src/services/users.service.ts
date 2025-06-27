import bcrypt from 'bcrypt';
import { CreateUserSafeDTO } from '../types/user';
import { UserModel } from '../models/users.model';

const SALT_ROUNDS = 10;

const userService = {
  async createUser(data: CreateUserSafeDTO) {
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await UserModel.create({
      email: data.email,
      name: data.name,
      passwordHash,
    });
    return user;
  },

  async getUserByEmail(email: string) {
    return UserModel.findByEmail(email);
  },

  // Тут будуть інші CRUD операції: наприклад оновлення, видалення
  // Але по ТЗ цього немає
};

export default userService;
