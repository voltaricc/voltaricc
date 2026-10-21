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
      posterPath = movieJson.backdrop_path || movieJson.poster_path || '';
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

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />

      {title && (
        <WatchTracker
          mediaId={id}
          mediaType="movie"
          title={title}
          posterPath={posterPath}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Middle Header Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl">
          <div>
            <h1 className="text-sm font-semibold text-neutral-300">
              {title ? `Watching ${title}` : 'Streaming via FrameX TV Engine'}
            </h1>
            <p className="text-xs text-neutral-500">High-bitrate HTML5 responsive player stream.</p>
          </div>

          <WatchlistButton
            mediaId={id}
            mediaType="movie"
            title={title}
            posterPath={posterPath}
            voteAverage={voteAverage}
            releaseDate={releaseDate}
          />
        </div>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            title="Video Player"
            referrerPolicy="origin"
          />
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white">{title || 'Movie'}</h2>
            <div className="flex items-center gap-3 text-xs font-semibold text-neutral-400">
              {releaseDate && <span>{releaseDate.split('-')[0]}</span>}
              {runtime > 0 && <span>{runtime} min</span>}
              {voteAverage > 0 && (
                <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg">
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
            <div className="pt-2 border-t border-neutral-800/80">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Main Cast</h3>
              <div className="flex flex-wrap gap-2">
                {cast.map((actor) => (
                  <span
                    key={actor.id}
                    className="bg-neutral-800 text-neutral-200 text-xs px-3 py-1.5 rounded-lg border border-neutral-700/60"
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
    </main>
  );
}