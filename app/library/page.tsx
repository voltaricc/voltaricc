'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { getSupabase } from '@/lib/supabase/client';

type WatchlistItem = {
  id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  vote_average: number | null;
};

export default function LibraryPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWatchlist() {
      try {
        const supabase = getSupabase();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('watchlist')
            .select('id, media_id, media_type, title, poster_path, vote_average')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (data) {
            setWatchlist(data as WatchlistItem[]);
          }
        }
      } catch (err) {
        console.error('Could not load watchlist:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWatchlist();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white pb-40">
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-10 pt-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">My Library</h1>
          <p className="text-xs md:text-sm text-neutral-400 mt-1">
            Your saved movies and TV shows.
          </p>
        </div>

        {loading ? (
          <p className="text-neutral-400 text-sm">Loading your library...</p>
        ) : watchlist.length === 0 ? (
          <div className="w-full py-24 flex flex-col items-center justify-center text-center space-y-3 bg-neutral-950/50 rounded-2xl border border-neutral-900">
            <p className="text-neutral-400 text-sm">Your list is empty. Add titles from any movie or show page!</p>
            <Link
              href="/"
              className="bg-white text-black font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-neutral-200 transition"
            >
              Explore Movies & TV Shows
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {watchlist.map((item) => (
              <Link
                key={item.id}
                href={
                  item.media_type === 'movie'
                    ? `/watch/${item.media_id}`
                    : `/tv/${item.media_id}?season=1&episode=1`
                }
                className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-600 transition-all duration-300 hover:scale-[1.02] shadow-lg flex flex-col"
              >
                <div className="aspect-[2/3] w-full bg-neutral-950 relative overflow-hidden">
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 p-2 text-center">
                      {item.title}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-white line-clamp-1">{item.title}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    ★ {item.vote_average?.toFixed(1) || 'N/A'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}