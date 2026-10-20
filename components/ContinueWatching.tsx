'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export interface ContinueWatchingItem {
  id: string;
  title: string;
  posterPath: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  currentTime?: number;
  duration?: number;
  progress?: number;
}

export default function ContinueWatching() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Read saved watch history from localStorage
    try {
      const savedHistory = localStorage.getItem('watch_history');
      if (savedHistory) {
        setItems(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Failed to parse watch history from localStorage:', e);
    }
  }, []);

  // Prevent hydration mismatch by rendering nothing until mounted in browser
  if (!isMounted || items.length === 0) return null;

  return (
    <section className="space-y-3 my-6">
      <h2 className="text-lg font-bold text-white tracking-wide">Continue Watching</h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 pt-1">
        {items.map((item) => {
          let percent = item.progress ?? 0;
          if (!item.progress && item.currentTime && item.duration && item.duration > 0) {
            percent = Math.min(100, Math.round((item.currentTime / item.duration) * 100));
          }

          const watchUrl =
            item.type === 'tv'
              ? `/tv/${item.id}?season=${item.season || 1}&episode=${item.episode || 1}`
              : `/watch/${item.id}`;

          return (
            <div
              key={item.id}
              className="flex-none w-40 md:w-48 group relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 transition transform hover:-translate-y-1 hover:border-neutral-700"
            >
              <Link href={watchUrl} className="block relative aspect-[2/3] w-full">
                <img
                  src={
                    item.posterPath
                      ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
                      : '/placeholder.jpg'
                  }
                  alt={item.title}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition" />

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs font-bold truncate">{item.title}</p>
                  {item.type === 'tv' && item.season && item.episode && (
                    <p className="text-[10px] text-neutral-400">
                      S{item.season} E{item.episode}
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-800/80 w-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-r-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}