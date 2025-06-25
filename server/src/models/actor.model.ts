import { DataTypes, Model } from 'sequelize';
import { sequelizeMovies } from '../config/movies.database';

// Основна модель
export class Actor extends Model {
  public id!: number;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Ініціалізація
Actor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // важливо: ім’я актора має бути унікальне
    },
  },
  {
    sequelize: sequelizeMovies,
    modelName: 'Actor',
    tableName: 'actors',
    timestamps: true, // потрібні для завдання
  }
);


// Обгортка ActorModel з утилітами
export const ActorModel = {
  /**
   * Приймає список імен акторів і повертає об'єкти Actor
   * Якщо якогось актора немає — створює його
   */
  async resolveActors(names: string[]): Promise<Actor[]> {
    const result: Actor[] = [];

    for (const name of names) {
      let actor = await Actor.findOne({ where: { name } });
      if (!actor) {
        actor = await Actor.create({ name });
      }
      result.push(actor);
    }

    return result;
  },
};
