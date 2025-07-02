import { Request, Response, NextFunction } from 'express';
import movieService from '../services/movies.service';


export default {
  async createMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, year, format, actors } = req.body;

      const isDuplicate = await movieService.isExactMovieDuplicate(title, year, format, actors);
      if (isDuplicate) {
        res.status(200).json({
          status: 0,
          error: {
            fields: {
              title: 'NOT_UNIQUE',
            },
            code: 'MOVIE_EXISTS',
          },
        });
        return;
      }

      // Створення фільму
      const newMovie = await movieService.createMovie({ title, year, format, actors });

      res.status(200).json({
        data: newMovie,
        status: 1,
      });

    } catch (error) {
      next(error);
    }
  },


  async updateMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedMovie = await movieService.updateMovie(Number(req.params.id), req.body);
      if (!updatedMovie) {
        res.status(200).json(
          {
            "status": 0,
            "error": {
              "fields": {
                "id": req.params.id
              },
              "code": "MOVIE_NOT_FOUND"
            }
          });
        return;
      }
      res.status(200).json({
        data: updatedMovie,
        status: 1,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await movieService.deleteMovie(Number(req.params.id));

      if (!deleted) {
        res.status(200).json({
          status: 0,
          error: {
            fields: {
              id: req.params.id,
            },
            code: 'MOVIE_NOT_FOUND',
          },
        });
        return;
      }

      res.status(200).json({ status: 1 });
    } catch (error) {
      next(error);
    }
  },

  async getMovieById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movie = await movieService.getMovieById(Number(req.params.id));
      if (!movie) {
        res.status(200).json({
          status: 0,
          error: {
            fields: {
              id: req.params.id,
            },
            code: 'MOVIE_NOT_FOUND',
          },
        });
        return;
      }
      res.status(200).json({
        data: movie,
        status: 1,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllMovies(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movies = await movieService.getAllMoviesSorted();
      res.json(movies);
    } catch (error) {
      next(error);
    }
  },

  async searchMoviesByTitle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movies = await movieService.searchByTitle(String(req.query.title));

      if (!movies.length) {
        res.status(200).json({
          status: 0,
          error: {
            fields: {
              title: req.query.title,
            },
            code: 'MOVIE_NOT_FOUND',
          },
        });
        return;
      }

      res.json(movies);
    } catch (error) {
      next(error);
    }
  },

  async searchMoviesByActor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movies = await movieService.searchByActor(String(req.query.actor));

      if (!movies.length) {
        res.status(200).json({
          status: 0,
          error: {
            fields: {
              actor: req.query.actor,
            },
            code: 'ACTOR_NOT_FOUND',
          },
        });
        return;
      }

      res.json(movies);
    } catch (error) {
      next(error);
    }
  },

  async searchMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const options = req.query; // query залишаємо any

      const movies = await movieService.searchMovies(options as any);

      const hasFilters = !!(options.title || options.actor || options.search);

      if (!movies.length) {
        res.status(200).json({
          status: 0,
          error: {
            code: hasFilters ? 'NO_MATCHES_FOUND' : 'NO_MOVIES',
            message: hasFilters
              ? 'No movies found matching your filters.'
              : 'No movies found. Please try again later.',
          },
        });
        return;
      }

      res.status(200).json({
        data: movies,
        meta: {
          total: movies.length,
        },
        status: 1,
      });
    } catch (err) {
      next(err);
    }
  },

  async importMoviesFromFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(200).json({
          status: 0,
          error: {
            fields: { file: "REQUIRED" },
            code: "NO_FILE"
          }
        });
        return;
      }

      if (req.file.mimetype !== 'text/plain') {
        res.status(415).json({
          status: 0,
          error: {
            code: "UNSUPPORTED_MEDIA_TYPE",
            fields: { file: "Only .txt files (text/plain) are supported for import." }
          }
        });
        return;
      }

      const content = req.file.buffer.toString('utf-8');
      const { imported, total, movies, failed } = await movieService.importFromText(content);

      res.status(200).json({
        data: movies,
        meta: {
          imported,
          total,
          failed
        },
        status: 1
      });
    } catch (err) {
      next(err);
    }
  }



};
