import Header from '@/components/Header';
import WatchTracker from '@/components/WatchTracker';
import WatchlistButton from '@/components/WatchlistButton';

export default async function MovieWatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  let movieData: any = null;
  if (apiKey) {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`, {
        next: { revalidate: 86400 },
      });
      movieData = await res.json();
    } catch (e) {
      console.error('Failed to fetch movie details:', e);
    }
  }

  const embedUrl = `https://vidy.st/movie/${id}?color=38BDF8`;

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <Header />
      <WatchTracker 
        id={id} 
        mediaType="movie" 
        title={movieData?.title || 'Movie'} 
        posterPath={movieData?.poster_path} 
        runtimeMinutes={movieData?.runtime}
      />
      
      {movieData?.backdrop_path && (
        <div className="relative w-full overflow-hidden border-b border-neutral-900 py-12 md:py-16">
          <img
            src={`https://image.tmdb.org/t/p/original${movieData.backdrop_path}`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
          <div className="relative max-w-7xl mx-auto px-4 md:px-10 w-full space-y-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg">
              {movieData.title}
            </h1>
            <p className="text-xs md:text-sm text-neutral-300 max-w-3xl leading-relaxed drop-shadow">
              {movieData.overview}
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
            title={movieData?.title || 'Movie Player'}
          />
        </div>

        {movieData && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs md:text-sm text-neutral-400">
                <span className="text-sky-400 font-bold">★ {movieData.vote_average?.toFixed(1)}</span>
                <span>{movieData.release_date?.split('-')[0]}</span>
                <span>{movieData.runtime} mins</span>
              </div>
              <WatchlistButton
                mediaId={id}
                mediaType="movie"
                title={movieData.title}
                posterPath={movieData.poster_path}
                voteAverage={movieData.vote_average}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}