const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function getTrendingMovies() {
  const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error('Failed to fetch trending movies');
  const data = await res.json();
  return data.results;
}

export async function getMovieDetails(id) {
  const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error('Failed to fetch movie details');
  return await res.json();
}

// Multi Search (Movies + TV Shows)
export async function searchMulti(query) {
  const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error('Failed to search media');
  const data = await res.json();
  // Filter out person/cast results, keeping only movies and tv shows
  return data.results.filter((item) => item.media_type === 'movie' || item.media_type === 'tv');
}

// TV Series Functions
export async function getTrendingTV() {
  const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error('Failed to fetch trending TV shows');
  const data = await res.json();
  return data.results;
}

export async function getTVDetails(id) {
  const res = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error('Failed to fetch TV details');
  return await res.json();
}

export async function getTVSeasonDetails(id, seasonNumber) {
  const res = await fetch(`${BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error('Failed to fetch season details');
  return await res.json();
}