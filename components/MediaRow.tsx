import PosterCard from './PosterCard';
import type { Media } from '@/lib/tmdb';

type Props = {
  title: string;
  items: (Media & { media_type?: string })[];
  type: 'movie' | 'tv';
};

export function RowHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg md:text-xl font-bold mb-4 text-white flex items-center gap-2">
      <span className="w-1.5 h-4 bg-sky-400 rounded-full inline-block" />
      {children}
    </h2>
  );
}

export default function MediaRow({ title, items, type }: Props) {
  if (!items.length) return null;
  return (
    <section>
      <RowHeading>{title}</RowHeading>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
        {items.map((item) => {
          // Mixed rows (like Trending Now) tell us each item's type themselves.
          const kind = item.media_type === 'tv' || item.media_type === 'movie' ? item.media_type : type;
          return (
            <PosterCard
              key={`${kind}-${item.id}`}
              href={kind === 'tv' ? `/tv/${item.id}` : `/watch/${item.id}`}
              title={item.title || item.name || 'Untitled'}
              posterPath={item.poster_path}
              rating={item.vote_average}
            />
          );
        })}
      </div>
    </section>
  );
}