'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getSortedHistory,
  resumeHref,
  HISTORY_EVENT,
  type HistoryEntry,
} from '@/lib/watchHistory';

export default function ContinueWatching() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const load = () => {
      setHistory(getSortedHistory().filter((item) => item.progressPercent < 100));
    };

    setMounted(true);
    load();

    window.addEventListener(HISTORY_EVENT, load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener(HISTORY_EVENT, load);
      window.removeEventListener('storage', load);
    };
  }, []);

  if (!mounted || history.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 space-y-4">
      <div className="flex items-center justify-between">
        <h2
          className="text-xl md:text-2xl font-bold tracking-tight text-white"
          style={{ fontFamily: "'YouTube Sans', sans-serif" }}
        >
          Continue Watching
        </h2>
        <Link
          href="/history"
          className="text-xs font-semibold text-neutral-400 hover:text-sky-400 transition-colors"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history.slice(0, 5).map((item) => (
          <Link
            key={item.storageKey}
            href={resumeHref(item)}
            className="group relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 hover:scale-[1.02] flex flex-col"
          >
            <div className="aspect-video w-full bg-neutral-950 relative overflow-hidden">
              {item.posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 p-2 text-center">
                  {item.title}
                </div>
              )}

              <div className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md rounded-md text-white border border-white/15 shadow">
                {item.mediaType === 'movie' ? 'Movie' : 'TV Show'}
              </div>

              {item.mediaType === 'tv' && (
                <div className="absolute bottom-3 right-2 px-2 py-0.5 text-[9px] font-bold tracking-wide bg-sky-950/80 backdrop-blur-md rounded-md text-sky-300 border border-sky-500/30 shadow">
                  S{item.season || 1} • E{item.episode || 1}
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-800">
                <div
                  className="h-full bg-sky-400 transition-all duration-300"
                  style={{ width: `${item.progressPercent || 0}%` }}
                />
              </div>
            </div>

            <div className="p-3">
              <p className="text-xs font-semibold text-white line-clamp-1 group-hover:text-sky-400 transition-colors">
                {item.title}
              </p>
              <p className="text-[10px] text-sky-400/90 font-medium mt-1">
                {item.progressPercent ? `${Math.round(item.progressPercent)}% watched` : 'In progress'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}