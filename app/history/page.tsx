'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import PosterCard from '@/components/PosterCard';
import { getSupabase } from '@/lib/supabase/client';

type HistoryItem = {
  id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  season: number | null;
  episode: number | null;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabase();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setSignedIn(false);
          return;
        }

        const { data, error } = await supabase
          .from('watch_history')
          .select('id, media_id, media_type, title, poster_path, season, episode')
          .eq('user_id', user.id)
          .order('watched_at', { ascending: false })
          .limit(200);
        if (error) throw error;

        const seen = new Set<string>();
        const unique = ((data ?? []) as HistoryItem[]).filter((row) => {
          const key = `${row.media_type}-${row.media_id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setItems(unique);
      } catch (err) {
        console.error('Could not load history:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function clearHistory() {
    if (!window.confirm('Clear your whole watch history?')) return;
    try {
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('watch_history').delete().eq('user_id', user.id);
      if (error) throw error;
      setItems([]);
    } catch (err) {
      console.error('Could not clear history:', err);
      alert('Something went wrong. Please try again.');
    }
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans pb-16">
      <Header />

      <section className="px-4 md:px-10 py-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <span className="w-1.5 h-5 bg-sky-400 rounded-full inline-block" />
            Watch History
          </h1>
          {items.length > 0 && (
            <button
              onClick={clearHistory}
              className="rounded-lg border border-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-300 hover:border-sky-400 hover:text-white transition cursor-pointer"
            >
              Clear history
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-neutral-400 text-sm">Loading your history...</p>
        ) : !signedIn ? (
          <p className="text-neutral-400 text-sm">Sign in to see what you have watched.</p>
        ) : items.length === 0 ? (
          <p className="text-neutral-400 text-sm">Nothing here yet. Start watching something!</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
            {items.map((item) => (
              <PosterCard
                key={`${item.media_type}-${item.media_id}`}
                className="w-full"
                href={
                  item.media_type === 'tv'
                    ? `/tv/${item.media_id}?season=${item.season || 1}&episode=${item.episode || 1}`
                    : `/watch/${item.media_id}`
                }
                title={item.title}
                posterPath={item.poster_path}
                subtitle={
                  item.media_type === 'tv'
                    ? `S${item.season || 1} · E${item.episode || 1}`
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}