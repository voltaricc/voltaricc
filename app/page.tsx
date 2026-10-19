import WatchlistRow from '@/components/WatchlistRow';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import MediaRow from '@/components/MediaRow';
import ContinueWatching from '@/components/ContinueWatching';
import { getTrendingMovies, getTrendingTv, getNewReleases, FALLBACK_MOVIES } from '@/lib/tmdb';
import { getTrendingNow, getMoviesByGenre } from '@/lib/browse';

export default async function HomePage() {
  const [movies, tvShows, newReleases, trendingNow, action, horror, scifi, mystery] =
    await Promise.all([
      getTrendingMovies(),
      getTrendingTv(),
      getNewReleases(),
      getTrendingNow(),
      getMoviesByGenre(28), // Action
      getMoviesByGenre(27), // Horror
      getMoviesByGenre(878), // Sci-Fi
      getMoviesByGenre(9648), // Mystery
    ]);

  const featured = movies[0] ?? FALLBACK_MOVIES[0];
  const heroImage = featured.backdrop_path || featured.poster_path;

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />

      <section className="relative w-full h-[55vh] md:h-[70vh] flex items-end p-5 md:p-12 mb-8 overflow-hidden border-b border-neutral-900">
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
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-sky-500 text-black text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest inline-block">
              Featured Title
            </span>
            {featured.vote_average ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                  <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
                </svg>
                {featured.vote_average.toFixed(1)}
              </span>
            ) : null}
          </div>
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

      <div className="space-y-10 px-4 md:px-10">
        <ContinueWatching />
        <WatchlistRow />
        <MediaRow title="Trending Now" items={trendingNow} type="movie" />
        <MediaRow title="Popular Movies" items={movies} type="movie" />
        <MediaRow title="Popular TV Shows" items={tvShows} type="tv" />
        <MediaRow title="New Releases" items={newReleases} type="movie" />
        <MediaRow title="Action" items={action} type="movie" />
        <MediaRow title="Horror" items={horror} type="movie" />
        <MediaRow title="Sci-Fi" items={scifi} type="movie" />
        <MediaRow title="Mystery" items={mystery} type="movie" />
      </div>

      <footer className="px-6 md:px-10 mt-16 text-[11px] text-neutral-500 max-w-xl">
        This product uses the TMDb API but is not endorsed or certified by TMDb.
      </footer>
    </main>
  );
}