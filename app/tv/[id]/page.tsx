import Header from '@/components/Header';
import TVPlayerClient from '@/components/TVPlayerClient';
import WatchTracker from '@/components/WatchTracker';
import WatchlistButton from '@/components/WatchlistButton';

export default async function TVShowPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}) {
  const { id } = await params;
  const resolvedSearch = await searchParams;
  const currentSeason = resolvedSearch.season || '1';
  const currentEpisode = resolvedSearch.episode || '1';

  const seasonNumber = parseInt(currentSeason, 10) || 1;
  const episodeNumber = parseInt(currentEpisode, 10) || 1;

  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  let showData: any = null;
  let seasonData: any = null;

  if (apiKey) {
    try {
      const showRes = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`, {
        next: { revalidate: 3600 },
      });
      showData = await showRes.json();

      const seasonRes = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/season/${currentSeason}?api_key=${apiKey}`,
        { next: { revalidate: 3600 } }
      );
      seasonData = await seasonRes.json();
    } catch (e) {
      console.error('Failed to fetch TV show data:', e);
    }
  }

  const activeEpisodeObj = seasonData?.episodes?.find(
    (ep: any) => ep.episode_number === episodeNumber
  );
  const episodeRuntime =
    activeEpisodeObj?.runtime || showData?.episode_run_time?.[0] || 45;

  const embedUrl = `https://vidy.st/tv/${id}/${currentSeason}/${currentEpisode}?episodeSelector=true&nextEpisode=true&autoplayNextEpisode=true&color=38BDF8`;

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <Header />
      <WatchTracker
        id={id}
        mediaType="tv"
        title={showData?.name || 'TV Show'}
        posterPath={showData?.poster_path}
        runtimeMinutes={episodeRuntime}
        season={seasonNumber}
        episode={episodeNumber}
      />

      {showData?.backdrop_path && (
        <div className="relative w-full overflow-hidden border-b border-neutral-900 py-12 md:py-16 pt-28">
          <img
            src={`https://image.tmdb.org/t/p/original${showData.backdrop_path}`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
          <div className="relative max-w-7xl mx-auto px-4 md:px-10 w-full space-y-2">
            <h1
              className="text-3xl md:text-5xl font-bold tracking-tight drop-shadow-lg"
              style={{ fontFamily: "'YouTube Sans', sans-serif" }}
            >
              {showData.name}
            </h1>
            <p className="text-xs md:text-sm text-neutral-300 max-w-3xl leading-relaxed drop-shadow">
              {showData.overview}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-10 pt-6 space-y-6">
        <div className="w-full aspect-video bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl relative">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            allow="encrypted-media; autoplay *; fullscreen *"
            title={showData?.name || 'TV Show Player'}
          />
        </div>

        {showData && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs md:text-sm text-neutral-400">
                <span className="text-sky-400 font-bold">★ {showData.vote_average?.toFixed(1)}</span>
                <span>{showData.first_air_date?.split('-')[0]}</span>
                {showData.number_of_seasons && (
                  <span>
                    {showData.number_of_seasons}{' '}
                    {showData.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                  </span>
                )}
              </div>
              <WatchlistButton
                mediaId={id}
                mediaType="tv"
                title={showData.name}
                posterPath={showData.poster_path}
                voteAverage={showData.vote_average}
              />
            </div>
          </div>
        )}

        {showData && (
          <TVPlayerClient
            showId={id}
            seasons={showData.seasons || []}
            currentSeason={currentSeason}
            currentEpisode={currentEpisode}
            episodes={seasonData?.episodes || []}
          />
        )}
      </div>
    </main>
  );
}