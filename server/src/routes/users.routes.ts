import { Router } from 'express';
import controller from '../controllers/users.controller';
import { validateRegisterUser, validateLoginUser } from '../validation/user.validation';

const router = Router();

router.post('/users', validateRegisterUser, controller.register);

router.post('/sessions', validateLoginUser, controller.login);

export default router;
