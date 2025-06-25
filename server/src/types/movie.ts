import { Actor } from './actor';

// Основний тип Movie — як він зберігається у БД
export interface Movie {
  id: string; // UUID
  title: string;
  year: number;
  format: 'VHS' | 'DVD' | 'Blu-ray';
  actors: Actor[];
  createdAt: string;
  updatedAt: string;
}

// Для створення фільму — без id, timestamps, але з іменами акторів
export type CreateMovieDTO = Omit<Movie, 'id' | 'actors' | 'createdAt' | 'updatedAt'> & {
  actors: string[]; // при створенні актори — імена
};

// Для оновлення — все опціонально
export type UpdateMovieDTO = Partial<CreateMovieDTO>;
