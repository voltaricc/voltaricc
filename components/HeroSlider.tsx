'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export interface HeroItem {
  id: string | number;
  title?: string;
  name?: string;
  overview?: string;
  backdrop_path?: string;
  logo_path?: string | null;
  media_type: 'movie' | 'tv';
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10765: 'Sci-Fi & Fantasy'
};

export default function HeroSlider({ items }: { items: HeroItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];
  const title = currentItem.title || currentItem.name || 'Featured Title';
  const overview = currentItem.overview || '';
  const backdropUrl = currentItem.backdrop_path ? `https://image.tmdb.org/t/p/original${currentItem.backdrop_path}` : '';
  const logoUrl = currentItem.logo_path ? `https://image.tmdb.org/t/p/original${currentItem.logo_path}` : null;
  const releaseYear = (currentItem.release_date || currentItem.first_air_date || '').split('-')[0] || '2026';
  const mediaTypeLabel = currentItem.media_type === 'tv' ? 'TV Show' : 'Movie';
  const rating = currentItem.vote_average ? currentItem.vote_average.toFixed(1) : '7.0';
  const detailLink = currentItem.media_type === 'tv' ? `/tv/${currentItem.id}` : `/watch/${currentItem.id}`;

  const genres = (currentItem.genre_ids || []).slice(0, 2).map((id) => GENRE_MAP[id]).filter(Boolean);

  return (
    <div className="relative w-full h-[75vh] md:h-[82vh] flex items-end overflow-hidden border-b border-neutral-900 bg-black">
      {items.map((item, index) => {
        const bgUrl = item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : '';
        return (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none ${
              index === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            {bgUrl && <img src={bgUrl} alt="" className="w-full h-full object-cover object-center scale-105" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent w-full md:w-3/4" />
          </div>
        );
      })}

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-10 pb-12 w-full space-y-4">
        {logoUrl ? (
          <div className="max-w-md md:max-w-xl h-24 sm:h-32 md:h-40 relative flex items-center">
            <img src={logoUrl} alt={title} className="max-h-full max-w-full object-contain drop-shadow-2xl" />
          </div>
        ) : (
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl uppercase max-w-3xl leading-none">
            {title}
          </h1>
        )}

        <div className="flex flex-wrap items-center gap-2.5 text-xs md:text-sm font-semibold text-neutral-300">
          <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg font-bold">
            ★ {rating}
          </span>
          <span className="bg-neutral-800/80 backdrop-blur-md px-3 py-1 rounded-lg border border-neutral-700/50">{releaseYear}</span>
          <span className="bg-neutral-800/80 backdrop-blur-md px-3 py-1 rounded-lg border border-neutral-700/50">{mediaTypeLabel}</span>
          {genres.map((g) => (
            <span key={g} className="bg-neutral-900/90 text-neutral-300 backdrop-blur-md px-3 py-1 rounded-lg border border-neutral-800">{g}</span>
          ))}
        </div>

        <p className="text-sm md:text-base text-neutral-300 line-clamp-3 max-w-2xl leading-relaxed font-normal drop-shadow">
          {overview}
        </p>

        <div className="flex items-center gap-3 pt-2">
          <Link
            href={detailLink}
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-white/10"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            Play
          </Link>
          <Link
            href={detailLink}
            className="inline-flex items-center gap-2 bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700/80 px-6 py-3 rounded-xl font-bold text-sm backdrop-blur-md transition shadow-lg"
          >
            <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" /></svg>
            More info
          </Link>
        </div>

        <div className="absolute bottom-4 right-4 md:right-10 flex items-center gap-2 z-20">
          {items.slice(0, 5).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}