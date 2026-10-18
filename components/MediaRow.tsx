import PosterCard from './PosterCard';
import type { Media } from '@/lib/tmdb';

type Props = {
  title: string;
  items: Media[];
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
        {items.map((item) => (
          <PosterCard
            key={item.id}
            href={type === 'tv' ? `/tv/${item.id}` : `/watch/${item.id}`}
            title={item.title || item.name || 'Untitled'}
            posterPath={item.poster_path}
          />
        ))}
      </div>
    </section>
  );
}