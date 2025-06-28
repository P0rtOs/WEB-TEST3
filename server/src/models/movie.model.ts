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
    search?: string;
    sort: string;
    order: 'ASC' | 'DESC';
    limit: number;
    offset: number;
  }) {
    const { title, actor, search, sort, order, limit, offset } = options;

    const where: any = {};
    const include: any[] = [{
      model: Actor,
      as: 'actors',
      through: { attributes: [] },
    }];

    if (search) {
      // Якщо є search — ігноруємо title та actor, шукаємо або по title або по actor.name
      // Використав literal, бо не виходило зробити через ORM
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        sequelizeMovies.literal(`EXISTS (
        SELECT 1 FROM MovieActors AS ma
        JOIN Actors AS a ON a.id = ma.actorId
        WHERE ma.movieId = "Movie"."id" AND a.name LIKE '%${search}%'
      )`)
      ];
    } else {
      // Якщо немає search — обробляємо title + actor як AND
      if (title) {
        where.title = { [Op.like]: `%${title}%` };
      }

      if (actor) {
        include[0].where = { name: { [Op.like]: `%${actor}%` } };
      }
    }

    return Movie.findAll({
      where,
      include,
      order: [[sort, order]],
      limit,
      offset,
      distinct: true,
    } as any);
  },


  async addActors(movie: Movie, actors: Actor[]) {
    return movie.addActors(actors);
  },

  async setActors(movie: Movie, actors: Actor[]) {
    return movie.setActors(actors);
  },
  async getExistingTitles(titles: string[]): Promise<Set<string>> {
    const existingMovies = await Movie.findAll({
      where: {
        title: {
          [Op.in]: titles
        }
      },
      attributes: ['title']
    });

    return new Set(existingMovies.map(movie => movie.title));
  }
};
