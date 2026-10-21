import TVWatchClient from '@/components/TVWatchClient';

export default async function TVWatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const initialSeason = Number(query.season) || 1;
  const initialEpisode = Number(query.episode) || 1;

  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  let tvName = '';
  let overview = '';
  let voteAverage = 0;
  let firstAirDate = '';
  let cast: any[] = [];
  let posterPath = '';
  let backdropPath = '';
  let imdbId = id;
  let seasons = [{ season_number: 1, episode_count: 1, name: 'Season 1' }];

  try {
    let tmdbId = id;
    if (id.startsWith('tt')) {
      const findRes = await fetch(
        `https://api.themoviedb.org/3/find/${id}?api_key=${apiKey}&external_source=imdb_id`
      );
      const findData = await findRes.json();
      if (findData.tv_results && findData.tv_results.length > 0) {
        tmdbId = findData.tv_results[0].id.toString();
      }
      imdbId = id;
    } else {
      const extRes = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/external_ids?api_key=${apiKey}`
      );
      const extData = await extRes.json();
      if (extData.imdb_id) imdbId = extData.imdb_id;
    }

    const [tvRes, creditsRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKey}`, { next: { revalidate: 3600 } }),
      fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/credits?api_key=${apiKey}`, { next: { revalidate: 3600 } })
    ]);

    const tvData = await tvRes.json();
    const creditsData = await creditsRes.json();

    if (tvData && !tvData.status_message) {
      tvName = tvData.name || tvData.original_name || '';
      overview = tvData.overview || '';
      voteAverage = tvData.vote_average || 0;
      firstAirDate = tvData.first_air_date || '';
      posterPath = tvData.poster_path || '';
      backdropPath = tvData.backdrop_path || '';

      const validSeasons = (tvData.seasons || []).filter(
        (s: any) => s.season_number > 0
      );
      if (validSeasons.length > 0) {
        seasons = validSeasons;
      }
    }

    if (creditsData && creditsData.cast) {
      cast = creditsData.cast.slice(0, 6);
    }
  } catch (err) {
    console.error('Server-side TMDb fetch error:', err);
  }

  return (
    <TVWatchClient
      id={id}
      imdbId={imdbId}
      tvName={tvName}
      overview={overview}
      voteAverage={voteAverage}
      firstAirDate={firstAirDate}
      cast={cast}
      posterPath={posterPath}
      backdropPath={backdropPath}
      seasons={seasons}
      initialSeason={initialSeason}
      initialEpisode={initialEpisode}
    />
  );
}