import Image from 'next/image';
import Link from 'next/link';

type Props = {
  href: string;
  title: string;
  posterPath: string | null;
  rating?: number;
  className?: string;
};

export default function PosterCard({
  href,
  title,
  posterPath,
  rating,
  className = 'shrink-0 w-36 md:w-44',
}: Props) {
  return (
    <Link href={href} className={className}>
      <div className="group relative bg-neutral-900/60 rounded-xl overflow-hidden border border-neutral-800 hover:border-sky-500/60 transition duration-300 hover:-translate-y-1">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
          {posterPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${posterPath}`}
              alt={title}
              fill
              sizes="(min-width: 768px) 176px, 144px"
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-xs text-neutral-500">
              {title}
            </div>
          )}

          {rating ? (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-sm">
              <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
                <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
              </svg>
              {rating.toFixed(1)}
            </div>
          ) : null}
        </div>
        <div className="p-2.5">
          <h3 className="font-semibold text-xs truncate text-neutral-100">{title}</h3>
        </div>
      </div>
    </Link>
  );
}