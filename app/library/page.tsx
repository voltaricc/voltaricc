'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import PosterCard from '@/components/PosterCard';
import { getSupabase } from '@/lib/supabase/client';

type WatchlistItem = {
  id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  vote_average: number | null;
};

type HistoryItem = {
  id: string;
  media_id: number | string;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  season?: number | null;
  episode?: number | null;
};

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history'>('watchlist');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = getSupabase();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let dbHistory: HistoryItem[] = [];
        let dbWatchlist: WatchlistItem[] = [];

        if (user) {
          const [wl, hist] = await Promise.all([
            supabase
              .from('watchlist')
              .select('id, media_id, media_type, title, poster_path, vote_average')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false }),
            supabase
              .from('watch_history')
              .select('id, media_id, media_type, title, poster_path, season, episode')
              .eq('user_id', user.id)
              .order('watched_at', { ascending: false })
              .limit(200),
          ]);

          if (wl.data) dbWatchlist = wl.data as WatchlistItem[];
          if (hist.data) dbHistory = hist.data as HistoryItem[];
        }

        // Fallback & sync with localStorage history
        let localHistory: HistoryItem[] = [];
        try {
          const savedHistory = localStorage.getItem('watch_history');
          if (savedHistory) {
            const parsed = JSON.parse(savedHistory);
            localHistory = parsed.map((item: any) => ({
              id: `local-${item.type}-${item.id}`,
              media_id: item.id,
              media_type: item.type,
              title: item.title,
              poster_path: item.posterPath,
              season: item.season || null,
              episode: item.episode || null,
            }));
          }
        } catch (e) {
          console.error('Failed to parse local watch history:', e);
        }

        // Combine DB and local history, removing duplicates
        const combinedHistory = [...dbHistory, ...localHistory];
        const seen = new Set<string>();
        const uniqueHistory = combinedHistory.filter((row) => {
          const key = `${row.media_type}-${row.media_id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setWatchlist(dbWatchlist);
        setHistory(uniqueHistory);
      } catch (err) {
        console.error('Could not load library:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const tabClass = (active: boolean) =>
    `text-sm font-bold pb-2 transition border-b-2 cursor-pointer ${
      active ? 'border-sky-400 text-white' : 'border-transparent text-neutral-400 hover:text-white'
    }`;

  const grid =
    'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4';

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />

      <section className="px-4 md:px-10 pt-6 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6 tracking-tight">My Library</h1>

        <div className="flex gap-6 border-b border-neutral-800 mb-8">
          <button onClick={() => setActiveTab('watchlist')} className={tabClass(activeTab === 'watchlist')}>
            My List ({watchlist.length})
          </button>
          <button onClick={() => setActiveTab('history')} className={tabClass(activeTab === 'history')}>
            Recently Watched ({history.length})
          </button>
        </div>

        {loading ? (
          <p className="text-neutral-400 text-sm">Loading your library...</p>
        ) : activeTab === 'watchlist' ? (
          watchlist.length === 0 ? (
            <p className="text-neutral-400 text-sm">
              Your list is empty. Add titles from any movie or show page!
            </p>
          ) : (
            <div className={grid}>
              {watchlist.map((item) => (
                <PosterCard
                  key={item.id}
                  className="w-full"
                  href={item.media_type === 'movie' ? `/watch/${item.media_id}` : `/tv/${item.media_id}`}
                  title={item.title}
                  posterPath={item.poster_path}
                  rating={item.vote_average ?? undefined}
                />
              ))}
            </div>
          )
        ) : history.length === 0 ? (
          <p className="text-neutral-400 text-sm">No watch history yet.</p>
        ) : (
          <div className={grid}>
            {history.map((item) => (
              <PosterCard
                key={`${item.media_type}-${item.media_id}`}
                className="w-full"
                href={
                  item.media_type === 'movie'
                    ? `/watch/${item.media_id}`
                    : `/tv/${item.media_id}?season=${item.season || 1}&episode=${item.episode || 1}`
                }
                title={item.title}
                posterPath={item.poster_path}
                subtitle={
                  item.media_type === 'tv' ? `S${item.season || 1} · E${item.episode || 1}` : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}