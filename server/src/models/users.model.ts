import { DataTypes, Model } from 'sequelize';
import { sequelizeUsers } from '../config/users.database';

export class User extends Model {
  public id!: number;
  public email!: string;
  public passwordHash!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeUsers,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

// При бажанні можна додати методи для моделі тут
// Наприклад, для пошуку користувача за email

export const UserModel = {
  async create(data: { email: string; name: string; passwordHash: string }) {
    return User.create(data);
  },

  async findByEmail(email: string) {
    return User.findOne({ where: { email } });
  },

  async getById(id: number) {
    return User.findByPk(id);
  },

  async update(id: number, data: Partial<{ email: string; passwordHash: string }>) {
    const [updatedCount] = await User.update(data, { where: { id } });
    if (updatedCount === 0) return null;
    return this.getById(id);
  },

  async delete(id: number) {
    const deletedCount = await User.destroy({ where: { id } });
    return deletedCount > 0;
  },
};
