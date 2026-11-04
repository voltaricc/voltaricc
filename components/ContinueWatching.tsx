'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ContinueWatching() {
  const [history, setHistory] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('voltarix_watch_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load watch history:', e);
    }
  }, []);

  // Prevent hydration mismatch
  if (!mounted) return null;

  // Show a clean empty state card instead of disappearing completely
  if (history.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 md:px-12 mt-12 space-y-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-wide text-white">Continue Watching</h2>
        <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-6 text-neutral-400 text-sm flex items-center justify-between">
          <span>No active watch history yet. Start watching a movie or TV show to track your progress here!</span>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-12 mt-12 space-y-4">
      <h2 className="text-xl md:text-2xl font-bold tracking-wide text-white">Continue Watching</h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth">
        {history.map((item) => {
          const posterPath = item.posterPath
            ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
            : '/placeholder.png';
          const linkHref = `/${item.mediaType}/${item.id}`;

          return (
            <Link
              key={item.id}
              href={linkHref}
              className="flex-none w-[180px] md:w-[220px] group relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800/80 hover:border-neutral-600 transition-all shadow-lg hover:scale-105"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
                <img
                  src={posterPath}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Movie / TV Show Badge Tag */}
                <span className="absolute top-2 left-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md rounded-md text-white border border-white/15 shadow">
                  {item.mediaType === 'movie' ? 'Movie' : 'TV Show'}
                </span>

                {/* Progress bar overlay at bottom of poster */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-800">
                  <div 
                    className="h-full bg-red-600" 
                    style={{ width: `${item.progressPercent || 0}%` }} 
                  />
                </div>
              </div>

              <div className="p-3">
                <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                <p className="text-xs text-neutral-400 mt-1">Resume playback</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}