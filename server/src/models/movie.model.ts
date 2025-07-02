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
  // Тепер тут пошук всіх фільмів за тайтлом для перевірки на дублікати в сервісі
  async searchByTitle(title: string) {
    return Movie.findAll({
      include: [{ model: Actor, as: 'actors' }],
      where: { title: { [Op.like]: `%${title}%` } },
      order: [['title', 'ASC']],
    });
  },

async getAllByExactTitle(title: string): Promise<Movie[]> {
  // Витягуємо всі фільми з акторами
  const allMovies = await Movie.findAll({
    include: [{
      model: Actor,
      as: 'actors',
      through: { attributes: [] }
    }]
  });

  // Нормалізуємо вхідний title (прибираємо пробіли, аперкейс, для кирилиці з урахуванням локалі)
  const normalize = (str: string) =>
    str.normalize('NFKC').toLocaleUpperCase('uk-UA').trim();

  const normalizedInput = normalize(title);

  // Фільтруємо фільми, де нормалізований title збігається з нормалізованим вхідним
  return allMovies.filter(movie => normalize(movie.title) === normalizedInput);
},

// Нова функція для фільтрів. Нічого не робить, 
// бо в SQlite кирилиця повністю ламає будь-які спроби щось фільтрувати
// Особливо взагалі ніяк не виходило додати пошук не чутливий до регістру
async searchWithFilters(): Promise<Movie[]> {
  return Movie.findAll({
    include: [{
      model: Actor,
      as: 'actors',
      through: { attributes: [] },
    }],
    distinct: true,
  } as any);
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


//Стара функція пошуку за атрибутами
//Не працює через обмеження SQLITE

/*async searchWithFilters(options: {
    title?: string;
    actor?: string;
    search?: string;
    limit: number;
    offset: number;
  }) {
    const { title, actor, search, limit, offset } = options;

    const where: any = {};

    // Включення зв’язаної таблиці Actor через зв’язок many-to-many
    const include: any[] = [{
      model: Actor,
      as: 'actors',
      through: { attributes: [] },
    }];

    // Якщо є сьорч він перезатирає інші поля пошуку
    if (search) {
      // Тут логічне додавання
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        sequelizeMovies.literal(`EXISTS (
        SELECT 1 FROM MovieActors AS ma
        JOIN Actors AS a ON a.id = ma.actorId
        WHERE ma.movieId = "Movie"."id" AND a.name LIKE '%${search}%'
      )`)
      ];
    } else {
      // Думаю тут очікується логічне множення
      if (title) {
        where.title = { [Op.like]: `%${title}%` };
      }
      if (actor) {
        include[0].where = { name: { [Op.like]: `%${actor}%` } };
      }
    }

    return Movie.findAll({
      where,         // фільтр по таблиці Movie
      include,       // фільтр по зв’язаній таблиці Actor (через include)
      limit,         // пагінація
      offset,        // зсув для пагінації
      distinct: true // забезпечує коректну пагінацію при JOIN'ах (уникає дублікатів)
    } as any);
  }*/