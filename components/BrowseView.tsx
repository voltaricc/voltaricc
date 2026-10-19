import Link from 'next/link';
import PosterCard from './PosterCard';
import GenreFilter from './GenreFilter';
import { discover, MOVIE_GENRES, TV_GENRES } from '@/lib/browse';

type Props = {
  type: 'movie' | 'tv';
  genre?: string;
  page?: string;
};

export default async function BrowseView({ type, genre, page }: Props) {
  const genres = type === 'movie' ? MOVIE_GENRES : TV_GENRES;
  const basePath = type === 'movie' ? '/movies' : '/tv';
  const title = type === 'movie' ? 'Movies' : 'TV Shows';

  // Only accept genres from our own list, and keep the page number sensible.
  const activeGenre = genre && genres.some((g) => String(g.id) === genre) ? genre : undefined;
  const genreName = genres.find((g) => String(g.id) === activeGenre)?.name;
  const pageNum = Math.max(1, Math.min(500, parseInt(page ?? '1', 10) || 1));

  const { results, totalPages } = await discover(type, activeGenre, pageNum);

  const linkFor = (p: number) => {
    const q = new URLSearchParams();
    if (activeGenre) q.set('genre', activeGenre);
    if (p > 1) q.set('page', String(p));
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  const pagerClass =
    'rounded-lg border border-neutral-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:border-sky-400 hover:text-white transition';

  return (
    <section className="px-4 md:px-10 py-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-5 bg-sky-400 rounded-full inline-block" />
            {title}
          </h1>
          {genreName && (
            <span className="rounded-full border border-sky-400/40 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
              {genreName}
            </span>
          )}
        </div>
        <GenreFilter basePath={basePath} genres={genres} current={activeGenre} />
      </div>

      {results.length === 0 ? (
        <div className="text-neutral-400 text-sm">Nothing found.</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
          {results.map((item) => (
            <PosterCard
              key={item.id}
              className="w-full"
              href={type === 'tv' ? `/tv/${item.id}` : `/watch/${item.id}`}
              title={item.title || item.name || 'Untitled'}
              posterPath={item.poster_path}
              rating={item.vote_average}
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-4">
        {pageNum > 1 && (
          <Link href={linkFor(pageNum - 1)} className={pagerClass}>
            ← Previous
          </Link>
        )}
        <span className="text-xs text-neutral-500">
          Page {pageNum} of {totalPages}
        </span>
        {pageNum < totalPages && (
          <Link href={linkFor(pageNum + 1)} className={pagerClass}>
            Next →
          </Link>
        )}
      </div>
    </section>
  );
}