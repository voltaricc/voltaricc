'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabase } from '@/lib/supabase/client';

export type WatchlistEntry = {
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  vote_average: number | null;
};

interface WatchlistContextType {
  isInWatchlist: (mediaId: number, mediaType: 'movie' | 'tv') => boolean;
  toggleWatchlist: (item: WatchlistEntry) => Promise<void>;
  isAuthenticated: boolean;
}

const WatchlistContext = createContext<WatchlistContextType>({
  isInWatchlist: () => false,
  toggleWatchlist: async () => {},
  isAuthenticated: false,
});

export function WatchlistProvider({ children }: { children: ReactNode }) {
  // Store keys as "movie-123" or "tv-456" for instant O(1) lookups
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();

    async function fetchInitialWatchlist() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserId(null);
        setSavedKeys(new Set());
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('watchlist')
        .select('media_id, media_type')
        .eq('user_id', user.id);

      if (!error && data) {
        const keys = new Set(data.map((row) => `${row.media_type}-${row.media_id}`));
        setSavedKeys(keys);
      }
    }

    fetchInitialWatchlist();

    // Keep state synced if user logs in or out
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchInitialWatchlist();
      } else {
        setUserId(null);
        setSavedKeys(new Set());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isInWatchlist = (mediaId: number, mediaType: 'movie' | 'tv') => {
    return savedKeys.has(`${mediaType}-${mediaId}`);
  };

  const toggleWatchlist = async (item: WatchlistEntry) => {
    if (!userId) return;

    const supabase = getSupabase();
    const key = `${item.media_type}-${item.media_id}`;
    const alreadySaved = savedKeys.has(key);

    // 1. Optimistic UI update (instant visual feedback)
    setSavedKeys((prev) => {
      const next = new Set(prev);
      if (alreadySaved) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

    // 2. Sync change with Supabase
    if (alreadySaved) {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('media_id', item.media_id)
        .eq('media_type', item.media_type);

      if (error) {
        console.error('Failed to remove from watchlist:', error);
        // Revert UI if database call failed
        setSavedKeys((prev) => new Set(prev).add(key));
      }
    } else {
      const { error } = await supabase.from('watchlist').insert({
        user_id: userId,
        media_id: item.media_id,
        media_type: item.media_type,
        title: item.title,
        poster_path: item.poster_path,
        vote_average: item.vote_average ?? null,
      });

      if (error) {
        console.error('Failed to add to watchlist:', error);
        // Revert UI if database call failed
        setSavedKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        isInWatchlist,
        toggleWatchlist,
        isAuthenticated: Boolean(userId),
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => useContext(WatchlistContext);