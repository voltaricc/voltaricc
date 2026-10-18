'use server';

export async function fetchHomePageData() {
  const apiKey = process.env.TMDB_API_KEY || '2ba31f5df8b898a96d11e5504fa770c9';

  try {
    const [moviesRes, tvRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`, { next: { revalidate: 3600 } }),
      fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${apiKey}`, { next: { revalidate: 3600 } }),
    ]);

    const moviesData = await moviesRes.json();
    const tvData = await tvRes.json();

    return {
      movies: moviesData.results || [],
      tvShows: tvData.results || [],
    };
  } catch (error) {
    console.error('Error fetching TMDb data:', error);
    return { movies: [], tvShows: [] };
  }
}