'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import {
  getSortedHistory,
  readHistory,
  writeHistory,
  resumeHref,
  HISTORY_KEY,
  HISTORY_EVENT,
  type HistoryEntry,
} from '@/lib/watchHistory';

// Cache resolved landscape paths in memory so switching tabs or removing items stays instant
const historyLandscapeCache = new Map<string, string | null>();

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryEntry[]>([]);
  const [landscapes, setLandscapes] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const loadHistory = async () => {
      const sorted = getSortedHistory();
      setHistoryItems(sorted);

      const updates: Record<string, string | null> = {};

      // Resolve landscape backdrop (movies) or episode still (TV) for each history entry
      await Promise.all(
        sorted.map(async (item) => {
          const cacheKey = `${item.mediaType}-${item.id}-s${item.season || 1}-e${item.episode || 1}`;
          if (historyLandscapeCache.has(cacheKey)) {
            updates[item.storageKey] = historyLandscapeCache.get(cacheKey) ?? null;
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
            const path = data.landscapePath ?? null;
            historyLandscapeCache.set(cacheKey, path);
            updates[item.storageKey] = path;
          } catch {
            // Fall back cleanly to posterPath if the network request fails
          }
        })
      );

      if (Object.keys(updates).length > 0) {
        setLandscapes((prev) => ({ ...prev, ...updates }));
      }
    };

    loadHistory();

    window.addEventListener(HISTORY_EVENT, loadHistory);
    window.addEventListener('storage', loadHistory);
    return () => {
      window.removeEventListener(HISTORY_EVENT, loadHistory);
      window.removeEventListener('storage', loadHistory);
    };
  }, []);

  // Clears all saved entries from localStorage and notifies listening components
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your watch history?')) {
      localStorage.removeItem(HISTORY_KEY);
      setHistoryItems([]);
      window.dispatchEvent(new Event(HISTORY_EVENT));
    }
  };

  // Removes a single history entry without triggering the parent Link navigation
  const removeItem = (itemKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const history = readHistory();
    delete history[itemKey];
    writeHistory(history);
  };

  return (
    <main className="min-h-screen bg-black text-white pt-28 pb-40">
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold tracking-tight text-white"
              style={{ fontFamily: "'YouTube Sans', sans-serif" }}
            >
              Watch History
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 mt-1">
              Pick up right where you left off.
            </p>
          </div>
          {historyItems.length > 0 && (
            <button
              onClick={clearHistory}
              className="bg-neutral-900 hover:bg-sky-500/10 text-neutral-300 hover:text-sky-400 border border-neutral-800 hover:border-sky-500/50 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300"
            >
              Clear History
            </button>
          )}
        </div>

        {historyItems.length === 0 ? (
          <div className="w-full py-24 flex flex-col items-center justify-center text-center space-y-3 bg-neutral-950/50 rounded-2xl border border-neutral-900">
            <p className="text-neutral-400 text-sm">Your watch history is empty.</p>
            <Link
              href="/"
              className="bg-white text-black font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-sky-400 hover:text-white hover:shadow-lg hover:shadow-sky-500/20 transition-all duration-300"
            >
              Explore Movies & TV Shows
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {historyItems.map((item) => {
              const resolvedPath = landscapes[item.storageKey] || item.posterPath;
              const imageUrl = resolvedPath
                ? `https://image.tmdb.org/t/p/w780${resolvedPath}`
                : null;

              return (
                <Link
                  key={item.storageKey}
                  href={resumeHref(item)}
                  className="group relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 md:hover:scale-[1.02] flex flex-col"
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

                    <button
                      onClick={(e) => removeItem(item.storageKey, e)}
                      className="absolute top-2 right-2 bg-black/80 hover:bg-sky-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition shadow-md z-10"
                      title="Remove from history"
                    >
                      ✕
                    </button>

                    {/* Media Type Badge (Top-Left) */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-black/80 rounded-md text-white border border-white/15 shadow">
                      {item.mediaType === 'movie' ? 'Movie' : 'TV Show'}
                    </div>

                    {/* Season / Episode Tag (Bottom-Right) */}
                    {item.mediaType === 'tv' && (
                      <div className="absolute bottom-3 right-2 px-2 py-0.5 text-[9px] font-bold tracking-wide bg-sky-950/90 rounded-md text-sky-300 border border-sky-500/30 shadow">
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

                  <div className="p-3 flex flex-col justify-between flex-1">
                    <p className="text-xs font-semibold text-white line-clamp-1 group-hover:text-sky-400 transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-sky-400/90 font-medium">
                        {item.progressPercent ? `${Math.round(item.progressPercent)}% watched` : 'Watched'}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}