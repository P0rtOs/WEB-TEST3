import { Movie, CreateMovieDTO, UpdateMovieDTO, SanitizedMovie } from '../types/movie';
import { MovieModel } from '../models/movie.model';
import { ActorModel } from '../models/actor.model';
import { parseMoviesFromText } from '../utils/parseMoviesFromText';
import { serviceLogger } from '../utils/logger';
import { arraysEqual } from '../utils/arraysEqual';


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
  // При перевірці не було помічено, але апдейт був незалежним від перевірки на дублікати
  // Тож тут це виправляю
  async updateMovie(id: number, data: UpdateMovieDTO) {
    serviceLogger.info(`${prefix} Updating movie ID ${id}`);

    const currentMovie = await MovieModel.getById(id);
    if (!currentMovie) {
      serviceLogger.warn(`${prefix} Movie not found for update. ID: ${id}`);
      return null;
    }

    // Підготувати повний новий стан фільму
    const newTitle = data.title ?? currentMovie.title;
    const newYear = data.year ?? currentMovie.year;
    const newFormat = data.format ?? currentMovie.format;
    const newActors = data.actors ?? (currentMovie.actors ? currentMovie.actors.map(a => a.name) : []); // якщо актори зв'язані

    const isDuplicate = await movieService.isExactMovieDuplicate(newTitle, newYear, newFormat, newActors);

    // Якщо знайшли такий дублікат, але з іншим ID — блокуємо
    if (isDuplicate) {
      const duplicates = await MovieModel.getAllByExactTitle(newTitle);
      const duplicate = duplicates.find(movie => {
        const movieActors = movie.actors ? movie.actors.map(a => a.name) : [];
        return movie.id !== id &&
          movie.year === newYear &&
          movie.format === newFormat &&
          arraysEqual(movieActors, newActors);
      });


      if (duplicate) {
        serviceLogger.warn(`${prefix} Duplicate movie detected on update. Skipping update.`);
        return null;
      }
    }

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

  async isExactMovieDuplicate(
    title: string,
    year: number,
    format: string,
    actors: string[]
  ): Promise<boolean> {
    // Локалізований collator для укр. мови
    const collator = new Intl.Collator('uk-UA', { sensitivity: 'base' });

    // Нормалізація рядка
    const normalize = (str: string) =>
      str.normalize('NFC').trim().replace(/\s{2,}/g, ' ');

    // Масиви акторів: нормалізація + сортування + порівняння
    const arraysEqual = (arr1: string[], arr2: string[]) => {
      if (arr1.length !== arr2.length) return false;
      const sorted1 = arr1.map(normalize).sort(collator.compare);
      const sorted2 = arr2.map(normalize).sort(collator.compare);
      return sorted1.every((val, i) => collator.compare(val, sorted2[i]) === 0);
    };

    // Отримуємо всі фільми з таким normalized title (перевірка вже всередині getAllByExactTitle)
    const movies = await MovieModel.getAllByExactTitle(title);

    return movies.some(movie => {
      const movieActors = movie.actors?.map(a => a.name) ?? [];
      return (
        movie.year === year &&
        movie.format === format &&
        arraysEqual(movieActors, actors)
      );
    });
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

    const parsedLimit = Math.max(0, parseInt(limit, 10) || 20);
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);
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

    const allMovies = await MovieModel.searchWithFilters();

    const normTitle = title?.toLocaleLowerCase('uk');
    const normActor = actor?.toLocaleLowerCase('uk');
    const normSearch = search?.toLocaleLowerCase('uk');

    const filtered = allMovies.filter(movie => {
      const movieTitle = movie.title.toLocaleLowerCase('uk');
      const movieActors = movie.actors?.map(a => a.name.toLocaleLowerCase('uk')) || [];

      if (normSearch) {
        return (
          movieTitle.includes(normSearch) ||
          movieActors.some(actorName => actorName.includes(normSearch))
        );
      }

      if (normTitle && !movieTitle.includes(normTitle)) {
        return false;
      }

      if (normActor && !movieActors.some(actorName => actorName.includes(normActor))) {
        return false;
      }

      return true;
    });

    const collator = new Intl.Collator('uk', { sensitivity: 'base' });

    filtered.sort((a, b) => {
      const valA = (a as any)[sort];
      const valB = (b as any)[sort];

      if (typeof valA === 'string' && typeof valB === 'string') {
        const cmp = collator.compare(valA, valB);
        return parsedOrder === 'DESC' ? -cmp : cmp;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return parsedOrder === 'DESC' ? valB - valA : valA - valB;
      }

      return 0;
    });

    const paginated = filtered.slice(parsedOffset, parsedOffset + parsedLimit);

    serviceLogger.info(`${prefix} Search result: ${filtered.length} movie(s) matched.`);

    return paginated.map(movie => ({
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
        const isDuplicate = await movieService.isExactMovieDuplicate(dto.title, dto.year, dto.format, dto.actors);
        if (isDuplicate) {
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