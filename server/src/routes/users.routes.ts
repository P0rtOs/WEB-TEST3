import { Router } from 'express';
import controller from '../controllers/users.controller';
import { validateRegisterUser, validateLoginUser } from '../validation/user.validation';

const router = Router();

// POST /api/v1/users/register — перевірка валідності даних реєстрації
router.post('/users', validateRegisterUser, controller.register);

// POST /api/v1/users/login — перевірка валідності даних для логіну
router.post('/sessions', validateLoginUser, controller.login);

export default router;
