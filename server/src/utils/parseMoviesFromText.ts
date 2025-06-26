import { CreateMovieDTO } from '../types/movie';  // або твій шлях

export function parseMoviesFromText(text: string): CreateMovieDTO[] {
  const blocks = text.split(/\n\s*\n/); // поділ по пустих рядках
  const movies: CreateMovieDTO[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    const movie: Partial<CreateMovieDTO> = {};

    for (const line of lines) {
      const [key, ...rest] = line.split(':');
      const value = rest.join(':').trim();

      switch (key.trim()) {
        case 'Title':
          movie.title = value;
          break;
        case 'Release Year':
          movie.year = parseInt(value, 10);
          break;
        case 'Format':
          movie.format = value as CreateMovieDTO['format'];
          break;
        case 'Stars':
          movie.actors = value.split(',').map(name => name.trim());
          break;
      }
    }

    if (movie.title && movie.year && movie.format && movie.actors) {
      movies.push(movie as CreateMovieDTO);
    }
  }

  return movies;
}
