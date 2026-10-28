import Header from '@/components/Header';
import TVPlayerClient from '@/components/TVPlayerClient';

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

  const embedUrl = `https://vidy.st/tv/${id}/${currentSeason}/${currentEpisode}?episodeSelector=true&nextEpisode=true&autoplayNextEpisode=true&color=DC2626`;

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <Header />
      
      {showData?.backdrop_path && (
        <div className="relative w-full h-[35vh] md:h-[45vh] overflow-hidden border-b border-neutral-900">
          <img
            src={`https://image.tmdb.org/t/p/original${showData.backdrop_path}`}
            alt=""
            className="w-full h-full object-cover opacity-40 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute bottom-6 max-w-7xl mx-auto px-4 md:px-10 w-full">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg">
              {showData.name}
            </h1>
            <p className="text-xs md:text-sm text-neutral-300 mt-2 line-clamp-2 max-w-2xl drop-shadow">
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