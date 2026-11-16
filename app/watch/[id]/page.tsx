import Header from '@/components/Header';
import WatchTracker from '@/components/WatchTracker';
import WatchlistButton from '@/components/WatchlistButton';
import AmbientPlayerWrapper from '@/components/AmbientPlayerWrapper';
import CastRow from '@/components/CastRow';

export default async function MovieWatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  let movieData: any = null;
  if (apiKey) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits`,
        {
          next: { revalidate: 86400 },
        }
      );
      movieData = await res.json();
    } catch (e) {
      console.error('Failed to fetch movie details:', e);
    }
  }

  const embedUrl = `https://vidy.st/movie/${id}?color=38BDF8`;

  return (
    <main className="min-h-screen bg-black text-white pb-36 overflow-x-hidden">
      <Header />
      <WatchTracker 
        id={id} 
        mediaType="movie" 
        title={movieData?.title || 'Movie'} 
        posterPath={movieData?.poster_path} 
        runtimeMinutes={movieData?.runtime}
      />
      
      {movieData?.backdrop_path ? (
        <div className="relative w-full overflow-hidden border-b border-neutral-900 pt-28 pb-12 md:pb-16">
          <img
            src={`https://image.tmdb.org/t/p/original${movieData.backdrop_path}`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
          <div className="relative max-w-7xl mx-auto px-4 md:px-10 w-full space-y-2">
            <h1
              className="text-3xl md:text-5xl font-bold tracking-tight drop-shadow-lg"
              style={{ fontFamily: "'YouTube Sans', sans-serif" }}
            >
              {movieData.title}
            </h1>
            <p className="text-xs md:text-sm text-neutral-300 max-w-3xl leading-relaxed drop-shadow">
              {movieData.overview}
            </p>
          </div>
        </div>
      ) : (
        <div className="pt-24" />
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-10 pt-6 space-y-6">
        <AmbientPlayerWrapper
          embedUrl={embedUrl}
          title={movieData?.title || 'Movie Player'}
          imagePath={movieData?.backdrop_path || movieData?.poster_path}
        />

        {movieData && (
          <div className="space-y-4 relative z-10">
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

            {/* Top 10 Main Cast */}
            <CastRow cast={movieData.credits?.cast || []} limit={10} />
          </div>
        )}
      </div>
    </main>
  );
}