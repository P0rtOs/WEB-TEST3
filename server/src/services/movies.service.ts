import { Movie, CreateMovieDTO, UpdateMovieDTO, SanitizedMovie } from '../types/movie';
import { MovieModel } from '../models/movie.model';
import { ActorModel } from '../models/actor.model';
import { parseMoviesFromText } from '../utils/parseMoviesFromText';
import { serviceLogger } from '../utils/logger';

const prefix = '[MovieService]';

const movieService = {
  async createMovie(data: CreateMovieDTO) {
    serviceLogger.info(`${prefix} Creating movie: "${data.title}" (${data.year})`);

    const movie = await MovieModel.create({
      title: data.title,
      year: data.year,
      format: data.format,
    });

    serviceLogger.debug(`${prefix} Movie "${data.title}" created. Resolving actors: ${JSON.stringify(data.actors)}`);
    const actors = await ActorModel.resolveActors(data.actors);
    await MovieModel.addActors(movie, actors);

    serviceLogger.info(`${prefix} Movie "${data.title}" saved with ${actors.length} actors.`);

    return MovieModel.getById(movie.id);
  },

  async updateMovie(id: number, data: UpdateMovieDTO) {
    serviceLogger.info(`${prefix} Updating movie ID ${id}`);

    const updated = await MovieModel.update(id, data);
    if (!updated) {
      serviceLogger.warn(`${prefix} Movie not found for update. ID: ${id}`);
      return null;
    }

    if (data.actors) {
      serviceLogger.debug(`${prefix} Updating actors for movie ID ${id}: ${JSON.stringify(data.actors)}`);
      const actors = await ActorModel.resolveActors(data.actors);
      await MovieModel.setActors(updated, actors);
    }

    serviceLogger.info(`${prefix} Movie ID ${id} updated successfully.`);
    return MovieModel.getById(id);
  },

  async deleteMovie(id: number) {
    serviceLogger.info(`${prefix} Deleting movie ID ${id}`);
    const deleted = await MovieModel.delete(id);

    if (!deleted) {
      serviceLogger.warn(`${prefix} Movie not found for deletion. ID: ${id}`);
    } else {
      serviceLogger.info(`${prefix} Movie ID ${id} deleted.`);
    }

    return deleted;
  },

  async getMovieById(id: number) {
    serviceLogger.debug(`${prefix} Fetching movie by ID ${id}`);
    return MovieModel.getById(id);
  },

  async getAllMoviesSorted() {
    serviceLogger.info(`${prefix} Fetching all movies sorted`);
    return MovieModel.getAllSorted();
  },

  async searchByTitle(title: string) {
    serviceLogger.debug(`${prefix} Searching movies by title: "${title}"`);
    return MovieModel.searchByTitle(title);
  },

  async getMovieByTitle(title: string) {
    return MovieModel.getByExactTitle(title);
  },

  async searchMovies(query: any): Promise<Movie[]> {
    const {
      title,
      search,
      actor,
      sort = 'id',
      order = 'ASC',
      limit = '20',
      offset = '0',
    } = query;

    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);
    const parsedOrder = (order as string).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    serviceLogger.debug(`${prefix} Searching movies with filters: ${JSON.stringify({
      title,
      search,
      actor,
      sort,
      order: parsedOrder,
      limit: parsedLimit,
      offset: parsedOffset,
    })}`);

    const movies = await MovieModel.searchWithFilters({
      title: title || undefined,
      actor: actor || undefined,
      search: search || undefined,
      sort: sort || 'id',
      order: parsedOrder,
      limit: isNaN(parsedLimit) ? 20 : parsedLimit,
      offset: isNaN(parsedOffset) ? 0 : parsedOffset,
    });

    serviceLogger.info(`${prefix} Search result: ${movies.length} movie(s) found.`);

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
    serviceLogger.debug(`${prefix} Searching movies by actor: "${actor}"`);
    return MovieModel.searchByActor(actor);
  },

  async importFromText(content: string) {
    const parsedMovies = parseMoviesFromText(content);
    serviceLogger.info(`${prefix} Starting import. Parsed movies: ${parsedMovies.length}`);

    const createdMovies: SanitizedMovie[] = [];
    const failedTitles: string[] = [];

    for (const dto of parsedMovies) {
      try {
        const existing = await MovieModel.getByExactTitle(dto.title);
        if (existing) {
          serviceLogger.warn(`${prefix} Duplicate movie skipped during import: "${dto.title}"`);
          failedTitles.push(dto.title);
          continue;
        }

        const movie = await movieService.createMovie(dto);
        if (!movie) {
          serviceLogger.error(`${prefix} Failed to create movie during import: "${dto.title}"`);
          failedTitles.push(dto.title);
          continue;
        }

        const { id, title, year, format, createdAt, updatedAt } = movie;
        createdMovies.push({ id, title, year, format, createdAt, updatedAt });
      } catch (err) {
        serviceLogger.error(`${prefix} Unhandled error during import for movie "${dto.title}": ${(err as Error).message}`);
        failedTitles.push(dto.title);
      }
    }

    serviceLogger.info(`${prefix} Import finished. Imported: ${createdMovies.length}, Failed: ${failedTitles.length}`);

    return {
      movies: createdMovies,
      imported: createdMovies.length,
      total: parsedMovies.length,
      failed: failedTitles.length ? failedTitles : undefined,
    };
  },
};

export default movieService;
