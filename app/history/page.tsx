'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  const loadHistory = () => {
    const saved = localStorage.getItem('voltarix_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const sorted = Object.values(parsed).sort((a: any, b: any) => b.updatedAt - a.updatedAt);
        setHistoryItems(sorted);
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    } else {
      setHistoryItems([]);
    }
  };

  useEffect(() => {
    loadHistory();
    window.addEventListener('voltarix_history_updated', loadHistory);
    window.addEventListener('storage', loadHistory);
    return () => {
      window.removeEventListener('voltarix_history_updated', loadHistory);
      window.removeEventListener('storage', loadHistory);
    };
  }, []);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your watch history?')) {
      localStorage.removeItem('voltarix_history');
      setHistoryItems([]);
      window.dispatchEvent(new Event('voltarix_history_updated'));
    }
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = localStorage.getItem('voltarix_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        delete parsed[id];
        localStorage.setItem('voltarix_history', JSON.stringify(parsed));
        loadHistory();
        window.dispatchEvent(new Event('voltarix_history_updated'));
      } catch (err) {
        console.error('Failed to remove history item:', err);
      }
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pb-40">
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-10 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Watch History</h1>
            <p className="text-xs md:text-sm text-neutral-400 mt-1">
              Pick up right where you left off.
            </p>
          </div>
          {historyItems.length > 0 && (
            <button
              onClick={clearHistory}
              className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 px-4 py-2 rounded-xl text-xs font-semibold transition"
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
              className="bg-white text-black font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-neutral-200 transition"
            >
              Explore Movies & TV Shows
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {historyItems.map((item) => (
              <Link
                key={item.id}
                href={item.mediaType === 'movie' ? `/watch/${item.id}` : `/tv/${item.id}?season=1&episode=1`}
                className="group relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-600 transition-all duration-300 hover:scale-[1.02] shadow-lg flex flex-col"
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

                  <button
                    onClick={(e) => removeItem(item.id, e)}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-md"
                    title="Remove from history"
                  >
                    ✕
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-800">
                    <div
                      className="h-full bg-red-600 transition-all duration-300"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 flex flex-col justify-between flex-1">
                  <p className="text-xs font-semibold text-white line-clamp-1">{item.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-neutral-400 capitalize">
                      {item.mediaType} • {item.progressPercent}% watched
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}