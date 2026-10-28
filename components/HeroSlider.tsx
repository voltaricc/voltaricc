'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroSlider({ items }: { items: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 6 seconds
  useEffect(() => {
    if (!items || items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex];

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Backdrop Image */}
      <img
        key={current.id}
        src={`https://image.tmdb.org/t/p/original${current.backdrop_path}`}
        alt={current.title}
        className="w-full h-full object-cover opacity-60 scale-105 transition-opacity duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

      {/* Hero Content Overlay */}
      <div className="absolute bottom-12 left-4 md:left-12 max-w-2xl space-y-4">
        {/* Official Movie/TV Logo or Fallback Title Text */}
        {current.logo_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${current.logo_path}`}
            alt={current.title}
            className="max-h-24 md:max-h-36 w-auto object-contain drop-shadow-lg"
          />
        ) : (
          <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg">
            {current.title}
          </h1>
        )}

        {/* Metadata Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs md:text-sm font-semibold">
          <span className="bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/30">
            ★ {current.vote_average?.toFixed(1)}
          </span>
          <span className="bg-neutral-800/80 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-700">
            {(current.release_date || current.first_air_date)?.split('-')[0]}
          </span>
          <span className="bg-neutral-800/80 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-700 capitalize">
            {current.media_type}
          </span>
        </div>

        {/* Overview */}
        <p className="text-xs md:text-sm text-neutral-300 line-clamp-3 drop-shadow leading-relaxed">
          {current.overview}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          <Link
            href={current.media_type === 'movie' ? `/watch/${current.id}` : `/tv/${current.id}?season=1&episode=1`}
            className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-neutral-200 transition shadow-lg text-sm flex items-center gap-2"
          >
            ▶ Play
          </Link>
          <Link
            href={current.media_type === 'movie' ? `/watch/${current.id}` : `/tv/${current.id}?season=1&episode=1`}
            className="bg-neutral-800/80 hover:bg-neutral-700 text-white font-semibold px-6 py-3 rounded-xl transition backdrop-blur-md border border-neutral-700 text-sm flex items-center gap-2"
          >
            ⓘ More info
          </Link>
        </div>
      </div>

      {/* Interactive Carousel Pagination Indicator Dashes */}
      <div className="absolute bottom-12 right-6 md:right-12 hidden md:flex items-center gap-2">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1 transition-all duration-300 rounded-full ${
              currentIndex === idx ? 'w-8 bg-white' : 'w-4 bg-neutral-600'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}