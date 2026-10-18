'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Header from '@/components/Header';
import Link from 'next/link';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history'>('watchlist');
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: wlData } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: histData } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false });

      if (wlData) setWatchlist(wlData);
      if (histData) setHistory(histData);
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans pb-12">
      <Header />

      <section className="px-6 md:px-10 pt-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6 tracking-tight">My Library</h1>

        {/* Tab Switcher */}
        <div className="flex gap-4 border-b border-neutral-800 pb-4 mb-8">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`text-sm font-bold pb-2 transition border-b-2 ${
              activeTab === 'watchlist'
                ? 'border-red-600 text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            My Watchlist ({watchlist.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`text-sm font-bold pb-2 transition border-b-2 ${
              activeTab === 'history'
                ? 'border-red-600 text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Recently Watched ({history.length})
          </button>
        </div>

        {loading ? (
          <p className="text-neutral-400 text-sm">Loading your library...</p>
        ) : activeTab === 'watchlist' ? (
          watchlist.length === 0 ? (
            <p className="text-neutral-400 text-sm">Your watchlist is empty. Add titles from any movie or show page!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {watchlist.map((item) => {
                const linkHref = item.media_type === 'movie' ? `/watch/${item.media_id}` : `/tv/${item.media_id}`;
                return (
                  <Link key={item.id} href={linkHref}>
                    <div className="group relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition hover:-translate-y-1">
                      <div className="aspect-[2/3] w-full bg-neutral-800 relative">
                        <span className={`absolute top-2 left-2 z-10 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          item.media_type === 'movie' ? 'bg-red-600' : 'bg-blue-600'
                        }`}>
                          {item.media_type === 'movie' ? 'Movie' : 'TV Series'}
                        </span>
                        {item.poster_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm truncate text-neutral-100 group-hover:text-red-400">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        ) : (
          history.length === 0 ? (
            <p className="text-neutral-400 text-sm">No watch history yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {history.map((item) => {
                const linkHref = item.media_type === 'movie'
                  ? `/watch/${item.media_id}`
                  : `/tv/${item.media_id}?season=${item.season || 1}&episode=${item.episode || 1}`;

                return (
                  <Link key={item.id} href={linkHref}>
                    <div className="group relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition hover:-translate-y-1">
                      <div className="aspect-[2/3] w-full bg-neutral-800 relative">
                        {item.poster_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm truncate text-neutral-100 group-hover:text-red-400">
                          {item.title}
                        </h3>
                        {item.media_type === 'tv' && (
                          <p className="text-xs text-red-500 font-medium mt-1">
                            S{item.season} E{item.episode}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}
      </section>
    </main>
  );
}