'use client';

import Link from 'next/link';

interface PosterCardProps {
  href: string;
  title: string;
  posterPath: string | null;
  rating?: number;
  subtitle?: string;
  className?: string;
}

export default function PosterCard({
  href,
  title,
  posterPath,
  rating,
  subtitle,
  className = '',
}: PosterCardProps) {
  const imageUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;

  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition duration-300 transform hover:-translate-y-1 shadow-xl ${className}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs text-neutral-500 bg-neutral-950">
            {title}
          </div>
        )}

        {rating !== undefined && rating > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-md">
            ★ {rating.toFixed(1)}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-95 transition" />
      </div>

      <div className="p-3 bg-neutral-900/90 backdrop-blur-md flex flex-col justify-between flex-grow">
        <h3 className="text-xs font-bold text-white truncate group-hover:text-sky-400 transition">
          {title}
        </h3>
        {subtitle && <p className="text-[10px] text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>
    </Link>
  );
}