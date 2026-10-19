import type { Media } from '@/lib/tmdb';

export type BrowseItem = Media & { media_type?: 'movie' | 'tv' };
type Page = { results: BrowseItem[]; totalPages: number };

const BASE = 'https://api.themoviedb.org/3';

export const MOVIE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

export const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
];

// Runs on the server only, so your TMDb key stays hidden.
async function get(path: string, params: Record<string, string> = {}): Promise<Page> {
  const empty: Page = { results: [], totalPages: 1 };
  const key = process.env.TMDB_API_KEY;
  if (!key) return empty;
  try {
    const qs = new URLSearchParams({ api_key: key, ...params });
    const res = await fetch(`${BASE}${path}?${qs.toString()}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`TMDb responded ${res.status}`);
    const data = await res.json();
    return {
      results: (data.results ?? []) as BrowseItem[],
      totalPages: Math.min(data.total_pages ?? 1, 500),
    };
  } catch (err) {
    console.error(`TMDb fetch failed for ${path}:`, err);
    return empty;
  }
}

// Movies and TV mixed together, popular this week.
export async function getTrendingNow(): Promise<BrowseItem[]> {
  const { results } = await get('/trending/all/week');
  return results.filter((i) => i.media_type === 'movie' || i.media_type === 'tv');
}

export async function getMoviesByGenre(genreId: number): Promise<BrowseItem[]> {
  const { results } = await get('/discover/movie', {
    with_genres: String(genreId),
    sort_by: 'popularity.desc',
    'vote_count.gte': '200',
    include_adult: 'false',
  });
  return results.map((m) => ({ ...m, media_type: 'movie' as const }));
}

// Used by the Movies and TV pages, with an optional genre and page number.
export function discover(type: 'movie' | 'tv', genre?: string, page = 1): Promise<Page> {
  const params: Record<string, string> = {
    sort_by: 'popularity.desc',
    'vote_count.gte': '100',
    include_adult: 'false',
    page: String(page),
  };
  if (genre) params.with_genres = genre;
  return get(`/discover/${type}`, params);
}