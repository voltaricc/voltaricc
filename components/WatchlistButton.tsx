'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase/client';

type Props = {
  mediaId: number | string;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string | null;
  voteAverage?: number | null;
};

export default function WatchlistButton({ mediaId, mediaType, title, posterPath, voteAverage }: Props) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkWatchlist() {
      try {
        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('watchlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('media_id', mediaId)
          .eq('media_type', mediaType)
          .maybeSingle();

        if (data) {
          setIsInWatchlist(true);
        }
      } catch (e) {
        console.error('Failed to check watchlist status:', e);
      }
    }
    checkWatchlist();
  }, [mediaId, mediaType]);

  const toggleWatchlist = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please sign in to manage your library.');
        setLoading(false);
        return;
      }

      if (isInWatchlist) {
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('media_id', mediaId)
          .eq('media_type', mediaType);

        if (!error) setIsInWatchlist(false);
      } else {
        const { error } = await supabase
          .from('watchlist')
          .insert({
            user_id: user.id,
            media_id: mediaId,
            media_type: mediaType,
            title,
            poster_path: posterPath,
            vote_average: voteAverage,
          });

        if (!error) setIsInWatchlist(true);
      }
    } catch (e) {
      console.error('Failed to update watchlist:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWatchlist}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
        isInWatchlist
          ? 'bg-sky-500/20 border-sky-400 text-sky-300 hover:bg-sky-500/30'
          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white'
      }`}
    >
      <span>{isInWatchlist ? '✓ In Library' : '+ Add to Library'}</span>
    </button>
  );
}