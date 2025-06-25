import { Request, Response, NextFunction } from 'express';
import movieService from '../services/movies.service';

export default {
  async createMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newMovie = await movieService.createMovie(req.body);
      res.status(201).json(newMovie);
    } catch (error) {
      next(error);
    }
  },

  async updateMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedMovie = await movieService.updateMovie(req.params.id, req.body);
      if (!updatedMovie) {
        res.status(404).json({ error: 'Movie not found' });
        return;
      }
      res.json(updatedMovie);
    } catch (error) {
      next(error);
    }
  },

  async deleteMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await movieService.deleteMovie(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: 'Movie not found' });
        return;
      }
      res.status(200).json({
        "status": 1
      });
      } catch (error) {
        next(error);
      }
  },

  async getMovieById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movie = await movieService.getMovieById(req.params.id);
      if (!movie) {
        res.status(404).json({ error: 'Movie not found' });
        return;
      }
      res.json(movie);
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
      const title = String(req.query.title);
      const movies = await movieService.searchByTitle(title);

      if (!movies.length) {
        res.status(404).json({ error: 'No movies found with this title' });
        return;
      }

      res.json(movies);
    } catch (error) {
      next(error);
    }
  },

  async searchMoviesByActor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = String(req.query.actor);
      const movies = await movieService.searchByActor(actor);

      if (!movies.length) {
        res.status(404).json({ error: 'No movies found with this actor' });
        return;
      }

      res.json(movies);
    } catch (error) {
      next(error);
    }
  },

  /*async importMoviesFromFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const imported = await movieService.importFromTxt(file.buffer.toString('utf-8'));
      res.status(201).json({ importedCount: imported });
    } catch (error) {
      next(error);
    }
  },*/
};
