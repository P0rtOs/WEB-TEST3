export interface MovieSearchOptions {
  title?: string;
  actor?: string;
  sort?: string;          
  order?: 'ASC' | 'DESC'; 
  limit?: number;        
  offset?: number;        
}