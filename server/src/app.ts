import express from 'express';
import { APP_PORT } from './config';
import { sequelizeMovies } from './config/movies.database';
import { sequelizeUsers } from './config/users.database';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/notFound.middleware';

import userRoutes from './routes/users.routes';
import movieRoutes from './routes/movies.routes';

import { associateModels } from './models/associateModels';
(async () => {
  associateModels();
  await sequelizeMovies.sync();
  await sequelizeUsers.sync();
})();

const app = express();


app.use(express.json());

app.use('/api/v1', userRoutes);
app.use('/api/v1/movies', movieRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

(async () => {
  try {
    await sequelizeMovies.authenticate();
    console.log('DB connection established for movies');
    await sequelizeUsers.authenticate();
    console.log('DB connection established for users');

    app.listen(APP_PORT, () => {
      console.log(`Server is running on port ${APP_PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
