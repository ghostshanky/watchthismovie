export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  // We add 'genre_ids' because Search results sometimes use this format
  genre_ids?: number[]; 
}