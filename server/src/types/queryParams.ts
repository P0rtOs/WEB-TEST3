export interface MovieSearchOptions { // Якщо змінювати пошук за опціями - починати тут
  title?: string;
  actor?: string;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}