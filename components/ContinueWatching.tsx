'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ContinueWatching() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('voltarix_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const items = Object.values(parsed).sort((a: any, b: any) => b.updatedAt - a.updatedAt);
        setHistory(items);
      } catch (e) {
        console.error('Failed to parse watch history:', e);
      }
    }
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-6 space-y-4">
      <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">Continue Watching</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history.map((item) => (
          <Link
            key={item.id}
            href={item.mediaType === 'movie' ? `/watch/${item.id}` : `/tv/${item.id}?season=1&episode=1`}
            className="group relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-600 transition shadow-lg"
          >
            {/* Poster Thumbnail */}
            <div className="aspect-video w-full bg-neutral-950 relative overflow-hidden">
              {item.posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 p-2 text-center">
                  {item.title}
                </div>
              )}

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-800">
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${item.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="p-3">
              <p className="text-xs font-semibold text-white line-clamp-1">{item.title}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5 capitalize">
                {item.mediaType} • {item.progressPercent}% watched
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}