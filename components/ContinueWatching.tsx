'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase/client';

export interface ContinueWatchingItem {
  id: string;
  title: string;
  posterPath: string; // Will now store episode stills or backdrops
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  progress?: number;
}

export default function ContinueWatching() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedHistory = localStorage.getItem('watch_history');
      if (savedHistory) {
        setItems(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Failed to parse watch history:', e);
    }
  }, []);

  if (!isMounted || items.length === 0) return null;

  return (
    <section className="space-y-3 my-6">
      <h2 className="text-lg font-bold text-white tracking-wide">Continue Watching</h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 pt-1">
        {items.map((item) => {
          const percent = item.progress ?? 15;

          const watchUrl =
            item.type === 'tv'
              ? `/tv/${item.id}?season=${item.season || 1}&episode=${item.episode || 1}`
              : `/watch/${item.id}`;

          const imageUrl = item.posterPath
            ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
            : null;

          return (
            <div
              key={`${item.type}-${item.id}-${item.season || 0}-${item.episode || 0}`}
              className="flex-none w-64 md:w-72 group relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 transition transform hover:-translate-y-1 hover:border-neutral-700 shadow-xl"
            >
              <Link href={watchUrl} className="block relative aspect-video w-full">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center p-2 text-center text-xs text-neutral-400">
                    {item.title}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition" />

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs font-bold truncate">{item.title}</p>
                  {item.type === 'tv' && item.season && item.episode && (
                    <p className="text-[10px] text-sky-400 font-medium">
                      Season {item.season} : Episode {item.episode}
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