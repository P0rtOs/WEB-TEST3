import { DataTypes, Model, Op, BelongsToManyAddAssociationsMixin, BelongsToManySetAssociationsMixin, fn, col, where } from 'sequelize';
import { sequelizeMovies } from '../config/movies.database';
import { Actor } from './actor.model';

export class Movie extends Model {
  public id!: number;
  public title!: string;
  public year!: number;
  public format!: 'VHS' | 'DVD' | 'Blu-ray';

  public addActors!: BelongsToManyAddAssociationsMixin<Actor, number>;
  public setActors!: BelongsToManySetAssociationsMixin<Actor, number>;

  public actors?: Actor[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

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

export const MovieModel = {
  async create(data: { title: string; year: number; format: string }) {
    return Movie.create(data);
  },

  async delete(id: number) {
    const deleted = await Movie.destroy({ where: { id } });
    return deleted > 0;
  },

  async getById(id: number) {
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

  async update(id: number, data: Partial<{ title: string; year: number; format: string }>) {
    const [updated] = await Movie.update(data, { where: { id } });
    return updated ? this.getById(id) : null;
  },

  async searchWithFilters(options: {
    title?: string;
    actor?: string;
    sort: string;
    order: 'ASC' | 'DESC';
    limit: number;
    offset: number;
  }) {
    const { title, actor, sort, order, limit, offset } = options;

    const where: any = {};
    if (title) {
      where.title = { [Op.like]: `%${title}%` };
    }

    const include = [{
      model: Actor,
      as: 'actors',
      through: { attributes: [] },
      ...(actor ? {
        where: {
          name: { [Op.like]: `%${actor}%` }
        }
      } : {})
    }];


    return Movie.findAll({
      where,
      include,
      order: [[sort, order]],
      limit,
      offset
    });
  },

  async addActors(movie: Movie, actors: Actor[]) {
    return movie.addActors(actors);
  },

  async setActors(movie: Movie, actors: Actor[]) {
    return movie.setActors(actors);
  },
};
