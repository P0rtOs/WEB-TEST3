import { Request, Response, NextFunction } from 'express';
import movieService from '../services/movies.service';


export default {
  async createMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, year, format, actors } = req.body;

      // Перевірка на унікальність
      const existing = await movieService.getMovieByTitle(title);
      if (existing) {
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
      const options = req.query; // Передаємо усі query як є, тип можна кастити у any чи відповідний тип

      const movies = await movieService.searchMovies(options as any);

      res.status(200).json({
        data: movies,
        meta: {
          total: movies.length,
        },
        status: 1
      });
    } catch (err) {
      next(err);
    }
  },


  async importMoviesFromFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({
          status: 0,
          error: {
            fields: { file: "REQUIRED" },
            code: "NO_FILE"
          }
        });
        return
      }

      const content = req.file.buffer.toString('utf-8');
      // Передаємо “чистий” текст у сервіс
      const { imported, total, movies, failed } = await movieService.importFromText(content);

      res.status(200).json({
        data: movies,
        meta: {
          imported,
          total,
          failed: failed.length > 0 ? failed : undefined
        },
        status: 1
      });
    } catch (err) {
      next(err);
    }
  }


};
