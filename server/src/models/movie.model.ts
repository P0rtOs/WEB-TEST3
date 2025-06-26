import { DataTypes, Model, Op, BelongsToManyAddAssociationsMixin, BelongsToManySetAssociationsMixin, fn, col, where } from 'sequelize';
import { sequelizeMovies } from '../config/movies.database';
import { Actor } from './actor.model';
//import parseMoviesFromTxt from '../utils/fileParser';

// Sequelize Movie model
export class Movie extends Model {
  public id!: string;
  public title!: string;
  public year!: number;
  public format!: 'VHS' | 'DVD' | 'Blu-ray';

  public addActors!: BelongsToManyAddAssociationsMixin<Actor, number>;
  public setActors!: BelongsToManySetAssociationsMixin<Actor, number>;

  public actors?: Actor[]; // асоційовані актори (через .include)
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  // без createdAt/updatedAt
}

// Ініціалізація таблиці
Movie.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    format: {
      type: DataTypes.ENUM('VHS', 'DVD', 'Blu-ray'),
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeMovies,
    modelName: 'Movie',
    tableName: 'movies',
    timestamps: true,
  }
);


// Методи для Movie через обгортку
export const MovieModel = {
  async create(data: { title: string; year: number; format: string }) {
    return Movie.create(data);
  },

  async delete(id: string) {
    const deleted = await Movie.destroy({ where: { id } });
    return deleted > 0;
  },

  async getById(id: string) {
    return Movie.findByPk(id, {
      include: [{ model: Actor, as: 'actors', through: { attributes: [] } }],
    });
  },


  async getAllSorted() {
    return Movie.findAll({
      include: [{ model: Actor, as: 'actors' }],
      order: [['title', 'ASC']],
    });
  },

  async searchByTitle(title: string) {
    return Movie.findAll({
      include: [{ model: Actor, as: 'actors' }],
      where: { title: { [Op.like]: `%${title}%` } },
      order: [['title', 'ASC']],
    });
  },

  async getByExactTitle(title: string) {
    return Movie.findOne({
      where: where(fn('lower', col('title')), fn('lower', title)),
    });
  },

  async searchByActor(actorName: string) {
    return Movie.findAll({
      include: [{
        model: Actor,
        as: 'actors',
        where: { name: { [Op.like]: `%${actorName}%` } },
      }],
      order: [['title', 'ASC']],
    });
  },

  async update(id: string, data: Partial<{ title: string; year: number; format: string }>) {
    const [updated] = await Movie.update(data, { where: { id } });
    return updated ? this.getById(id) : null;
  },

  async addActors(movie: Movie, actors: Actor[]) {
    return movie.addActors(actors);
  },

  async setActors(movie: Movie, actors: Actor[]) {
    return movie.setActors(actors);
  },

  /*async importFromTxt(content: string) {
    const movies = parseMoviesFromTxt(content);
    let count = 0;
    for (const m of movies) {
      const movie = await this.create({ title: m.title, year: m.year, format: m.format });
      const actors = await ActorModel.resolveActors(m.actors);
      await movie.addActors(actors);
      count++;
    }
    return count;
  },*/
};
