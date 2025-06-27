// Потрібно для пов'язання таблиць/моделей
import { Actor } from './actor.model';
import { Movie } from './movie.model';

export function associateModels() {
  Actor.belongsToMany(Movie, {
    through: 'MovieActors',
    foreignKey: 'actorId',
  });

  Movie.belongsToMany(Actor, {
    through: 'MovieActors',
    as: 'actors',
    foreignKey: 'movieId',
  });
}
