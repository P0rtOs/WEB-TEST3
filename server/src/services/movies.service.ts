import { Movie, CreateMovieDTO, UpdateMovieDTO, SanitizedMovie } from '../types/movie';
import { MovieModel } from '../models/movie.model';
import { ActorModel } from '../models/actor.model';
import { parseMoviesFromText } from '../utils/parseMoviesFromText'

const movieService = {
  async createMovie(data: CreateMovieDTO) {
    // 1. Створюємо сам фільм
    const movie = await MovieModel.create({
      title: data.title,
      year: data.year,
      format: data.format,
    });

    // 2. Розв’язуємо акторів: шукаємо + створюємо відсутніх
    const actors = await ActorModel.resolveActors(data.actors);

    // 3. Прив’язуємо акторів до фільму
    await MovieModel.addActors(movie, actors);

    // 4. Повертаємо фільм із заповненими акторами
    return MovieModel.getById(movie.id);
  },

  async updateMovie(id: number, data: UpdateMovieDTO) {
    // 1. Оновлюємо поля фільму (назва, рік, формат)
    const updated = await MovieModel.update(id, data);
    if (!updated) return null;

    // 2. Якщо є новий список actors — робимо ту ж саму логіку
    if (data.actors) {
      const actors = await ActorModel.resolveActors(data.actors);
      await MovieModel.setActors(updated, actors);
    }

    // 3. Повертаємо оновлений фільм із акторами
    return MovieModel.getById(id);
  },

  async deleteMovie(id: number) {
    return MovieModel.delete(id);
  },

  async getMovieById(id: number) {
    return MovieModel.getById(id);
  },

  async getAllMoviesSorted() {
    return MovieModel.getAllSorted();
  },

  async searchByTitle(title: string) {
    return MovieModel.searchByTitle(title);
  },

  async getMovieByTitle(title: string) {
    return MovieModel.getByExactTitle(title);
  },

  async searchMovies(query: any): Promise<Movie[]> {
  const {
    title,
    search,
    sort = 'id',
    order = 'ASC',
    limit = '20',
    offset = '0',
  } = query;

  // Приведення типів та дефолтів
  const parsedLimit = parseInt(limit, 10);
  const parsedOffset = parseInt(offset, 10);
  const parsedOrder = (order as string).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  // Вибір відповідної логіки моделі
  const movies = await MovieModel.searchWithFilters({
    title: title || undefined,
    actor: search || undefined,
    sort: sort || 'id',
    order: parsedOrder || 'DESC',
    limit: isNaN(parsedLimit) ? 20 : parsedLimit,
    offset: isNaN(parsedOffset) ? 0 : parsedOffset,
  });
      return movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        year: movie.year,
        format: movie.format,
        createdAt: movie.createdAt,
        updatedAt: movie.updatedAt,
      }));
},

  async searchByActor(actor: string) {
    return MovieModel.searchByActor(actor);
  },

  async importFromText(content: string) {
    const parsedMovies = parseMoviesFromText(content); // повертає масив CreateMovieDTO
    const createdMovies: SanitizedMovie[] = [];

    const failedTitles: string[] = [];

    for (const dto of parsedMovies) {
      try {
        const existing = await MovieModel.getByExactTitle(dto.title);
        if (existing) {
          failedTitles.push(dto.title);
          continue;
        }

        const movie = await movieService.createMovie(dto);
        if (!movie) {
          failedTitles.push(dto.title);
          continue;
        }

        const { id, title, year, format, createdAt, updatedAt } = movie;
        createdMovies.push({
          id,
          title,
          year,
          format,
          createdAt,
          updatedAt,
        });
      } catch (err) {
        failedTitles.push(dto.title);
      }
    }

    return {
      movies: createdMovies,
      imported: createdMovies.length,
      total: parsedMovies.length,
      failed: failedTitles,
    };
  }
};

export default movieService;
