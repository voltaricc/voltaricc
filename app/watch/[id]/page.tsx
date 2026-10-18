import { getMovieDetails } from '@/lib/tmdb';
import Header from '@/components/Header';
import WatchlistButton from '@/components/WatchlistButton';
import WatchTracker from '@/components/WatchTracker';
import Link from 'next/link';
import { connection } from 'next/server';

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ quality?: string }>;
}) {
  await connection();

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const id = resolvedParams.id;
  const quality = resolvedSearchParams.quality || 'hd';
  const movie = await getMovieDetails(id);

  // Redirection fluide vers des serveurs stables
  let embedUrl = `https://vidsrc.to/embed/movie/${id}`;
  if (quality === 'backup') {
    embedUrl = `https://vidsrc.me/embed/movie?tmdb=${id}`;
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />
      <WatchTracker
        mediaId={id}
        mediaType="movie"
        title={movie.title}
        posterPath={movie.poster_path}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        {/* Navigation Breadcrumb */}
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-sky-400 mb-5 inline-flex items-center gap-1.5 transition"
        >
          ← Retour à l'accueil
        </Link>

        {/* Title Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {movie.title}
            </h1>
            <span className="bg-sky-500/10 text-sky-400 border border-sky-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-widest uppercase">
              Full HD
            </span>
          </div>

          <WatchlistButton
            mediaId={id}
            mediaType="movie"
            title={movie.title}
            posterPath={movie.poster_path}
            voteAverage={movie.vote_average}
            releaseDate={movie.release_date}
          />
        </div>

        {/* Player Source Switcher Bar */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Serveur :
            </span>
            <Link
              href={`/watch/${id}?quality=hd`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                quality === 'hd'
                  ? 'bg-sky-500 text-black shadow-md shadow-sky-500/20'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <span>⚡</span> Serveur Principal (HD)
            </Link>
            <Link
              href={`/watch/${id}?quality=backup`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                quality === 'backup'
                  ? 'bg-sky-500 text-black shadow-md shadow-sky-500/20'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <span>🔄</span> Serveur de Secours
            </Link>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Flux prêt
          </div>
        </div>

        {/* Refined Video Player Frame */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-neutral-800/80 shadow-[0_0_35px_rgba(56,189,248,0.12)]">
          <iframe
            src={embedUrl}
            className="w-full h-full border-none"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        </div>

        {/* Information Section */}
        <div className="mt-6 bg-neutral-900/60 border border-neutral-800/80 p-6 rounded-2xl backdrop-blur-sm">
          <p className="text-neutral-300 text-sm leading-relaxed">{movie.overview}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-400 border-t border-neutral-800/60 pt-4">
            <span className="text-sky-400 font-extrabold flex items-center gap-1">
              ★ {movie.vote_average?.toFixed(1)} / 10
            </span>
            <span>•</span>
            <span>{movie.release_date?.slice(0, 4)}</span>
            <span>•</span>
            <span>{movie.runtime} min</span>
          </div>
        </div>
      </div>
    </main>
  );
}