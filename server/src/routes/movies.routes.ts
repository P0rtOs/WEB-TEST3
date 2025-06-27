import { Router } from 'express';
import controller from '../controllers/movies.controller';

import { validateCreateMovie, validateUpdateMovie } from '../validation/movie.validation';
import { authenticateToken } from '../validation/token.validation';
import multer from 'multer';

const upload = multer(); // для multipart/form-data
const router = Router();

router.use(authenticateToken);

//router.get('/', controller.getAllMovies);
router.get('/:id', controller.getMovieById);

router.get('/', controller.searchMovies);


router.post('/', validateCreateMovie, controller.createMovie);
router.patch('/:id', validateUpdateMovie, controller.updateMovie);
router.delete('/:id', controller.deleteMovie);
router.post('/import', upload.single('movies'), controller.importMoviesFromFile);

export default router;
