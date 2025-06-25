import { Router } from 'express';
import controller from '../controllers/movies.controller';

import { validateCreateMovie, validateUpdateMovie } from '../validation/movie.validation';
//import { authMiddleware } from '../validation/auth.validation';
import multer from 'multer';

const upload = multer(); // для multipart/form-data
const router = Router();

//router.use(authMiddleware);

router.get('/', controller.getAllMovies);
router.get('/:id', controller.getMovieById);

router.get('/search', (req, res, next) => {
  if (req.query.title) return controller.searchMoviesByTitle(req, res, next);
  if (req.query.actor) return controller.searchMoviesByActor(req, res, next);
  res.status(400).json({ message: 'Missing query parameter' });
});

router.post('/', validateCreateMovie, controller.createMovie);
router.patch('/:id', validateUpdateMovie, controller.updateMovie);
router.delete('/:id', controller.deleteMovie);
//router.post('/import', upload.single('file'), controller.importMoviesFromFile);

export default router;
