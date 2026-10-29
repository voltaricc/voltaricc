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
    <main className="min-h-screen bg-black text-white pb-40">
      <Header />
      <WatchTracker 
        id={id} 
        mediaType="movie" 
        title={movieData?.title || 'Movie'} 
        posterPath={movieData?.poster_path} 
      />
      <div className="max-w-7xl mx-auto px-4 md:px-10 pt-8 space-y-6">
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
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{movieData.title}</h1>
                <div className="flex items-center gap-3 text-xs md:text-sm text-neutral-400 mt-1">
                  <span className="text-sky-400 font-bold">★ {movieData.vote_average?.toFixed(1)}</span>
                  <span>{movieData.release_date?.split('-')[0]}</span>
                  <span>{movieData.runtime} mins</span>
                </div>
              </div>
              <WatchlistButton
                mediaId={id}
                mediaType="movie"
                title={movieData.title}
                posterPath={movieData.poster_path}
                voteAverage={movieData.vote_average}
              />
            </div>
            <p className="text-sm text-neutral-300 max-w-3xl leading-relaxed">{movieData.overview}</p>
          </div>
        )}
      </div>
    </main>
  );
}