'use client';

import Link from 'next/link';
import { useWatchlist } from '@/context/WatchlistContext';

interface PosterCardProps {
  href: string;
  title: string;
  posterPath: string | null;
  rating?: number;
  subtitle?: string;
  mediaType?: 'movie' | 'tv';
  mediaId?: number | string;
  className?: string;
}

export default function PosterCard({
  href,
  title,
  posterPath,
  rating,
  subtitle,
  mediaType,
  mediaId,
  className = '',
}: PosterCardProps) {
  const { isInWatchlist, toggleWatchlist, isAuthenticated } = useWatchlist();
  const imageUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;

  // 1. Resolve media ID from prop or parse from href
  const resolvedId = mediaId
    ? Number(mediaId)
    : (() => {
        const match = href.match(/\/(?:watch|movie|tv)\/(\d+)/);
        return match ? Number(match[1]) : null;
      })();

  // 2. Resolve media type
  const resolvedType: 'movie' | 'tv' =
    mediaType ?? (href.startsWith('/tv/') ? 'tv' : 'movie');

  const added = resolvedId ? isInWatchlist(resolvedId, resolvedType) : false;

  const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation(); // Stop click bubbling

    if (!resolvedId) return;

    if (!isAuthenticated) {
      alert('Please sign in to manage your library.');
      return;
    }

    await toggleWatchlist({
      media_id: resolvedId,
      media_type: resolvedType,
      title,
      poster_path: posterPath,
      vote_average: rating ?? null,
    });
  };

  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition duration-300 transform hover:-translate-y-1 shadow-xl ${className}`}
    >
      {/* Image Container */}
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

        {/* Media Type Badge Tag (Top Left) */}
        {mediaType && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md rounded-md text-white border border-white/15 shadow z-10">
            {mediaType === 'movie' ? 'Movie' : 'TV Show'}
          </span>
        )}

        {/* Rating Badge (Top Right) */}
        {rating !== undefined && rating > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-md z-10">
            ★ {rating.toFixed(1)}
          </div>
        )}

        {/* Library Toggle Button (Bottom Right of the Image - Styled to match UI badges & WatchlistButton) */}
        {resolvedId && (
          <button
            type="button"
            onClick={handleToggle}
            aria-label={added ? 'Remove from library' : 'Add to library'}
            title={added ? 'Remove from library' : 'Add to library'}
            className={`absolute bottom-2.5 right-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-lg backdrop-blur-md border transition-all duration-200 shadow-md cursor-pointer active:scale-90 ${
              added
                ? 'bg-sky-500/25 border-sky-400/80 text-sky-300 hover:bg-sky-500/35 shadow-sky-500/10'
                : 'bg-black/70 border-white/15 text-neutral-200 hover:border-sky-400/50 hover:text-sky-300 hover:bg-black/85'
            }`}
          >
            {added ? (
              /* Checkmark Icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              /* Plus Icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            )}
          </button>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-95 transition pointer-events-none" />
      </div>

      {/* Card Footer */}
      <div className="p-3 bg-neutral-900/90 backdrop-blur-md flex flex-col justify-between flex-grow">
        <h3 className="text-xs font-bold text-white truncate group-hover:text-sky-400 transition">
          {title}
        </h3>
        {subtitle && <p className="text-[10px] text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>
    </Link>
  );
}