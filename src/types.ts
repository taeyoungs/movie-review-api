export interface ISimilarWorkProps {
  id: number;
  name: string;
  vote_average: number;
  poster_path: string | null;
}

export interface ISearchProps {
  id: number;
  name?: string;
  title?: string;
  vote_average: number;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

export interface ICreditProps {
  id: number;
  title: string;
  vote_average: number;
  release_date: string;
  media_type: string;
  poster_path: string | null;
}

export interface IMovieProps {
  id: number;
  name?: string;
  title?: string;
  vote_average: number;
  overview: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  total_pages: number;
}
