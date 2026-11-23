'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getSortedHistory,
  resumeHref,
  HISTORY_EVENT,
  type HistoryEntry,
} from '@/lib/watchHistory';

// Caches resolved landscape image paths in memory by media + season + episode
const continueWatchingLandscapeCache = new Map<string, string | null>();

export default function ContinueWatching() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [landscapes, setLandscapes] = useState<Record<string, string | null>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Loads active watch history and fetches landscape thumbnails for visible cards
    const load = async () => {
      const items = getSortedHistory().filter((item) => item.progressPercent < 100);
      setHistory(items);

      const visibleItems = items.slice(0, 10);
      const updates: Record<string, string | null> = {};

      await Promise.all(
        visibleItems.map(async (item) => {
          const cacheKey = `${item.mediaType}-${item.id}-s${item.season || 1}-e${item.episode || 1}`;
          if (continueWatchingLandscapeCache.has(cacheKey)) {
            updates[item.storageKey] = continueWatchingLandscapeCache.get(cacheKey) ?? null;
            return;
          }

          try {
            const params = new URLSearchParams({
              mediaType: item.mediaType,
              id: String(item.id),
              season: String(item.season || 1),
              episode: String(item.episode || 1),
            });

            const res = await fetch(`/api/landscape?${params.toString()}`);
            if (!res.ok) return;

            const data = await res.json();
            const resolvedPath = data.landscapePath ?? null;
            continueWatchingLandscapeCache.set(cacheKey, resolvedPath);
            updates[item.storageKey] = resolvedPath;
          } catch {
            // Leave poster fallback intact if the request fails
          }
        })
      );

      if (Object.keys(updates).length > 0) {
        setLandscapes((prev) => ({ ...prev, ...updates }));
      }
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
    <section className="max-w-7xl mx-auto px-4 md:px-12 mt-10 space-y-4">
      <div className="flex items-center justify-between">
        <h2
          className="text-xl md:text-2xl font-bold tracking-wide text-white"
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

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth">
        {history.slice(0, 10).map((item) => {
          // Prefer landscape backdrop (movies) or episode still (TV), falling back to posterPath
          const imagePath = landscapes[item.storageKey] || item.posterPath;
          const imageUrl = imagePath
            ? `https://image.tmdb.org/t/p/w780${imagePath}`
            : null;

          return (
            <Link
              key={item.storageKey}
              href={resumeHref(item)}
              className="flex-none w-[240px] md:w-[280px] group relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800/80 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 md:hover:scale-[1.02] flex flex-col"
            >
              <div className="aspect-video w-full bg-neutral-950 relative overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 p-2 text-center">
                    {item.title}
                  </div>
                )}

                <div className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-black/80 rounded-md text-white border border-white/15 shadow">
                  {item.mediaType === 'movie' ? 'Movie' : 'TV Show'}
                </div>

                {item.mediaType === 'tv' && (
                  <div className="absolute bottom-3 right-2 px-2 py-0.5 text-[9px] font-bold tracking-wide bg-sky-950/90 rounded-md text-sky-300 border border-sky-500/30 shadow">
                    S{item.season || 1}E{item.episode || 1}
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
                <p className="text-sm font-semibold text-white line-clamp-1 group-hover:text-sky-400 transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-sky-400/90 font-medium mt-1">
                  {item.progressPercent ? `${Math.round(item.progressPercent)}% watched` : 'In progress'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}