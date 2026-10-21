import Header from '@/components/Header';
import Link from 'next/link';
import WatchTracker from '@/components/WatchTracker';
import WatchlistButton from '@/components/WatchlistButton';

interface CastMember {
  id: number;
  name: string;
  character: string;
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  let title = '';
  let overview = '';
  let posterPath = '';
  let backdropPath = '';
  let voteAverage = 0;
  let releaseDate = '';
  let runtime = 0;
  let cast: CastMember[] = [];
  let imdbId = id;

  try {
    let tmdbId = id;
    if (id.startsWith('tt')) {
      const findRes = await fetch(
        `https://api.themoviedb.org/3/find/${id}?api_key=${apiKey}&external_source=imdb_id`
      );
      const findData = await findRes.json();
      if (findData.movie_results && findData.movie_results.length > 0) {
        tmdbId = findData.movie_results[0].id.toString();
      }
      imdbId = id;
    } else {
      const extRes = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/external_ids?api_key=${apiKey}`
      );
      const extData = await extRes.json();
      if (extData.imdb_id) imdbId = extData.imdb_id;
    }

    const [movieRes, creditsRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}`, { next: { revalidate: 3600 } }),
      fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${apiKey}`, { next: { revalidate: 3600 } }),
    ]);

    const movieJson = await movieRes.json();
    const creditsJson = await creditsRes.json();

    if (movieJson && !movieJson.status_message) {
      title = movieJson.title || movieJson.original_title || '';
      overview = movieJson.overview || '';
      posterPath = movieJson.poster_path || '';
      backdropPath = movieJson.backdrop_path || '';
      voteAverage = movieJson.vote_average || 0;
      releaseDate = movieJson.release_date || '';
      runtime = movieJson.runtime || 0;
    }

    if (creditsJson && creditsJson.cast) {
      cast = creditsJson.cast.slice(0, 6);
    }
  } catch (err) {
    console.error('Server-side movie fetch error:', err);
  }

  const embedUrl = `https://framextv.tech/embed/${imdbId}`;
  const fullBackdropUrl = backdropPath ? `https://image.tmdb.org/t/p/original${backdropPath}` : null;

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16 relative overflow-hidden">
      {/* Atmospheric Backdrop Glow */}
      {fullBackdropUrl && (
        <div className="absolute top-0 left-0 right-0 h-[600px] overflow-hidden pointer-events-none opacity-15 blur-3xl z-0">
          <img src={fullBackdropUrl} alt="" className="w-full h-full object-cover scale-110" />
        </div>
      )}

      <div className="relative z-10">
        <Header />

        {title && (
          <WatchTracker
            mediaId={id}
            mediaType="movie"
            title={title}
            posterPath={backdropPath || posterPath}
          />
        )}

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
          {/* Sleek Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/80 backdrop-blur-md border border-neutral-800/80 p-4 rounded-2xl shadow-xl">
            <div>
              <h1 className="text-sm font-semibold text-neutral-200">
                {title ? `Watching ${title}` : 'Streaming via FrameX TV Engine'}
              </h1>
              <p className="text-xs text-neutral-400">High-bitrate HTML5 responsive player stream.</p>
            </div>

            <WatchlistButton
              mediaId={id}
              mediaType="movie"
              title={title}
              posterPath={backdropPath || posterPath}
              voteAverage={voteAverage}
              releaseDate={releaseDate}
            />
          </div>

          {/* Video Player Container */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl">
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              title="Video Player"
              referrerPolicy="origin"
            />
          </div>

          {/* Metadata Card */}
          <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white tracking-tight">{title || 'Movie'}</h2>
              <div className="flex items-center gap-3 text-xs font-semibold text-neutral-300">
                {releaseDate && <span className="bg-neutral-800/80 px-2.5 py-1 rounded-lg border border-neutral-700/50">{releaseDate.split('-')[0]}</span>}
                {runtime > 0 && <span className="bg-neutral-800/80 px-2.5 py-1 rounded-lg border border-neutral-700/50">{runtime} min</span>}
                {voteAverage > 0 && (
                  <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg font-bold">
                    ★ {voteAverage.toFixed(1)} / 10
                  </span>
                )}
              </div>
            </div>

            {overview && (
              <p className="text-sm text-neutral-300 leading-relaxed max-w-4xl">
                {overview}
              </p>
            )}

            {cast.length > 0 && (
              <div className="pt-2 border-t border-neutral-800/60">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Main Cast</h3>
                <div className="flex flex-wrap gap-2">
                  {cast.map((actor) => (
                    <span
                      key={actor.id}
                      className="bg-neutral-800/70 hover:bg-neutral-800 text-neutral-200 text-xs px-3 py-1.5 rounded-xl border border-neutral-700/50 transition"
                    >
                      {actor.name} <span className="text-neutral-400 font-normal">({actor.character})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-sky-400 transition">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}