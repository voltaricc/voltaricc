export type Media = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  overview?: string;
};

const BASE = 'https://api.themoviedb.org/3';

export const FALLBACK_MOVIES: Media[] = [
  { id: 550, title: 'Fight Club', poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg', release_date: '1999-10-15', vote_average: 8.4, overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.' },
  { id: 27205, title: 'Inception', poster_path: '/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', backdrop_path: '/s3TBrRGB1iv7gOCQnQ0tD5l2zXj.jpg', release_date: '2010-07-16', vote_average: 8.3, overview: 'A skilled thief who steals secrets through dream-sharing technology is offered a chance to have his past erased.' },
  { id: 157336, title: 'Interstellar', poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', backdrop_path: '/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg', release_date: '2014-11-05', vote_average: 8.4, overview: 'Explorers use a newly discovered wormhole to surpass the limits of human space travel.' },
  { id: 680, title: 'Pulp Fiction', poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', backdrop_path: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg', release_date: '1994-09-10', vote_average: 8.5, overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.' },
];

export const FALLBACK_TV: Media[] = [
  { id: 1396, name: 'Breaking Bad', poster_path: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', backdrop_path: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg', first_air_date: '2008-01-20', vote_average: 8.9, overview: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing methamphetamine.' },
  { id: 66732, name: 'Stranger Things', poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg', first_air_date: '2016-07-15', vote_average: 8.6, overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments.' },
];

// Runs on the server only, so the key is never visible to visitors.
async function tmdb(path: string, fallback: Media[]): Promise<Media[]> {
  const key = process.env.TMDB_API_KEY;
  if (!key) return fallback;
  try {
    const sep = path.includes('?') ? '&' : '?';
    const res = await fetch(`${BASE}${path}${sep}api_key=${key}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`TMDb responded ${res.status}`);
    const data = await res.json();
    return data.results?.length ? data.results : fallback;
  } catch (err) {
    console.error(`TMDb fetch failed for ${path}:`, err);
    return fallback;
  }
}

export const getTrendingMovies = () => tmdb('/trending/movie/day', FALLBACK_MOVIES);
export const getTrendingTv = () => tmdb('/trending/tv/day', FALLBACK_TV);

// New releases: in cinemas now, already out, newest first.
export async function getNewReleases(): Promise<Media[]> {
  const items = await tmdb('/movie/now_playing?region=GB', FALLBACK_MOVIES);
  const today = new Date().toISOString().slice(0, 10);
  return items
    .filter((m) => m.release_date && m.release_date <= today)
    .sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
}
export type MovieDetails = {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
  runtime: number;
};

// Gets the full details for one movie (used by the Watch page).
export async function getMovieDetails(id: string | number): Promise<MovieDetails> {
  const fallback: MovieDetails = {
    id: Number(id),
    title: 'Title unavailable',
    poster_path: '',
    backdrop_path: null,
    overview: 'We could not load the details for this movie right now.',
    vote_average: 0,
    release_date: '',
    runtime: 0,
  };

  const key = process.env.TMDB_API_KEY;
  if (!key) return fallback;

  try {
    const res = await fetch(`${BASE}/movie/${id}?api_key=${key}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`TMDb responded ${res.status}`);
    const data = await res.json();
    return {
      ...data,
      title: data.title ?? 'Untitled',
      poster_path: data.poster_path ?? '',
      overview: data.overview ?? '',
      vote_average: data.vote_average ?? 0,
      release_date: data.release_date ?? '',
      runtime: data.runtime ?? 0,
    };
  } catch (err) {
    console.error(`Could not load movie ${id}:`, err);
    return fallback;
  }
}

export type TVDetails = {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  first_air_date: string;
  number_of_seasons?: number;
  seasons?: {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    poster_path: string | null;
  }[];
};

// Gets the full details for one TV show (used by the TV page).
export async function getTVDetails(id: string | number): Promise<TVDetails> {
  const fallback: TVDetails = {
    id: Number(id),
    name: 'Title unavailable',
    poster_path: '',
    backdrop_path: null,
    overview: 'We could not load the details for this show right now.',
    vote_average: 0,
    first_air_date: '',
    number_of_seasons: 1,
    seasons: [{ id: 0, name: 'Season 1', season_number: 1, episode_count: 10, poster_path: null }],
  };

  const key = process.env.TMDB_API_KEY;
  if (!key) return fallback;

  try {
    const res = await fetch(`${BASE}/tv/${id}?api_key=${key}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`TMDb responded ${res.status}`);
    const data = await res.json();
    return {
      ...data,
      name: data.name ?? 'Untitled',
      poster_path: data.poster_path ?? '',
      overview: data.overview ?? '',
      vote_average: data.vote_average ?? 0,
      first_air_date: data.first_air_date ?? '',
    };
  } catch (err) {
    console.error(`Could not load TV show ${id}:`, err);
    return fallback;
  }
}