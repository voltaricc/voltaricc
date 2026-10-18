import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import MediaRow from '@/components/MediaRow';
import ContinueWatching from '@/components/ContinueWatching';
import { getTrendingMovies, getTrendingTv, getNewReleases, FALLBACK_MOVIES } from '@/lib/tmdb';

export default async function HomePage() {
  const [movies, tvShows, newReleases] = await Promise.all([
    getTrendingMovies(),
    getTrendingTv(),
    getNewReleases(),
  ]);

  const featured = movies[0] ?? FALLBACK_MOVIES[0];
  const heroImage = featured.backdrop_path || featured.poster_path;

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />

      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-end p-6 md:p-12 mb-8 overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 z-0">
          {heroImage && (
            <Image
              src={`https://image.tmdb.org/t/p/original${heroImage}`}
              alt={featured.title || featured.name || ''}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-40"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <span className="bg-sky-500 text-black text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest mb-3 inline-block">
            Featured Title
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight text-white">
            {featured.title || featured.name}
          </h1>
          <p className="text-neutral-300 text-xs md:text-sm line-clamp-3 mb-6 leading-relaxed">
            {featured.overview}
          </p>
          <Link
            href={`/watch/${featured.id}`}
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-lg transition duration-200 shadow-lg shadow-sky-500/20"
          >
            ▶ Watch Now
          </Link>
        </div>
      </section>

      <div className="space-y-10 px-6 md:px-10">
        <ContinueWatching />
        <MediaRow title="Popular Movies" items={movies} type="movie" />
        <MediaRow title="Popular TV Shows" items={tvShows} type="tv" />
        <MediaRow title="New Releases" items={newReleases} type="movie" />
      </div>

      <footer className="px-6 md:px-10 mt-16 text-[11px] text-neutral-500 max-w-xl">
        This product uses the TMDb API but is not endorsed or certified by TMDb.
      </footer>
    </main>
  );
}